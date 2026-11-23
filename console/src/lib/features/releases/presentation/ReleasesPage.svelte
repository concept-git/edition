<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { ApiFailure } from '#lib/shared/api/client';
  import { keyedText } from '#lib/shared/api/copy';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import Button from '#lib/shared/ui/Button.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import { approveRelease, buildRelease, listPreviewPages, listReleases, promoteRelease, readPreviewPage, resolveTenant, rollbackRelease } from '../data/http-releases';
  import {
    canPreview,
    liveControl,
    sameIntent,
    statusLabel,
    withRollback,
    type ConfirmedBuild,
    type ReleaseOutcome,
    type ReleaseSummary,
    type WriteIntent
  } from '../domain/release';
  import { approveFailureMessage, buildFailureMessage, canRetry, listFailureMessage, previewFailureMessage, switchFailureMessage } from './messages';

  let { spaceId, onLive }: { spaceId: string; onLive?: (releaseId: string | null) => void } = $props();
  const session = getSession();
  const tones: Record<ReleaseOutcome, string> = {
    promoted: 'bg-chip text-ink',
    unchanged: 'bg-surface text-ink',
    skipped: 'bg-line text-ink',
    held: 'bg-ink text-white'
  };

  let tenantId = $state<string | null>(null);
  let items = $state.raw<ReleaseSummary[] | null>(null);
  let confirmed = $state.raw<ConfirmedBuild | null>(null);
  let listFailure = $state<ApiFailure | null>(null);
  let buildFailure = $state<ApiFailure | null>(null);
  let pending = $state(false);
  let acting = $state(false);
  let preview = $state.raw<{ title: string; content: string } | null>(null);
  let previewFailure = $state<ApiFailure | null>(null);
  let switchFailure = $state<ApiFailure | null>(null);
  let intent: WriteIntent | null = null;
  const intents = new Map<string, WriteIntent>();
  let confirmIntent: WriteIntent | null = null;
  let confirming = $state('');
  let confirmFailure = $state<ApiFailure | null>(null);
  let alive = true;

  const listMessage = $derived(listFailure ? listFailureMessage(listFailure) : '');
  const buildMessage = $derived(buildFailure ? buildFailureMessage(buildFailure) : '');
  const previewMessage = $derived(previewFailure ? previewFailureMessage(previewFailure) : '');
  const switchMessage = $derived(switchFailure ? switchFailureMessage(switchFailure) : '');
  const retryable = $derived(buildFailure !== null && canRetry(buildFailure));
  const confirmMessage = $derived(confirmFailure ? approveFailureMessage(confirmFailure) : '');

  onDestroy(() => {
    alive = false;
  });

  async function load() {
    listFailure = null;
    const token = session.accessToken;
    if (!token) {
      listFailure = { status: 0, code: null, traceId: null, retryAfter: null };
      return;
    }
    const tenant = await resolveTenant(token);
    if (!alive) return;
    if (!tenant.ok) {
      listFailure = tenant.failure;
      return;
    }
    tenantId = tenant.body;
    await refresh(token, tenant.body);
  }

  async function refresh(token: string, tenant: string) {
    const listed = await listReleases(token, tenant, spaceId);
    if (!alive) return;
    if (!listed.ok) {
      listFailure = listed.failure;
      return;
    }
    items = listed.body;
    listFailure = null;
    reportLive(items);
  }

  function submit() {
    if (pending || !tenantId) return;
    const token = session.accessToken;
    if (!token) return;
    intent = sameIntent(intent, spaceId);
    const key = intent.key;
    pending = true;
    buildFailure = null;
    void run(token, tenantId, key);
  }

  async function openPreview(release: ReleaseSummary) {
    if (acting || !tenantId) return;
    const token = session.accessToken;
    if (!token) return;
    acting = true;
    previewFailure = null;
    const pages = await listPreviewPages(token, tenantId, spaceId, release.id);
    if (!alive) return;
    if (!pages.ok) {
      acting = false;
      previewFailure = pages.failure;
      return;
    }
    const first = pages.body[0];
    if (!first) {
      acting = false;
      preview = { title: release.label, content: '' };
      return;
    }
    const document = await readPreviewPage(token, tenantId, spaceId, release.id, first.slug);
    if (!alive) return;
    acting = false;
    if (!document.ok) {
      previewFailure = document.failure;
      return;
    }
    preview = { title: document.body.title, content: document.body.content };
  }

  async function switchTo(release: ReleaseSummary, action: 'promote' | 'rollback') {
    if (acting || !tenantId) return;
    const token = session.accessToken;
    if (!token) return;
    const fingerprint = `${spaceId}:${release.id}:${action}`;
    const next = sameIntent(intents.get(fingerprint) ?? null, fingerprint);
    intents.set(fingerprint, next);
    acting = true;
    switchFailure = null;
    const result =
      action === 'promote'
        ? await promoteRelease(token, tenantId, spaceId, release.id, next.key)
        : await rollbackRelease(token, tenantId, spaceId, release.id, next.key);
    if (!alive) return;
    acting = false;
    if (!result.ok) {
      switchFailure = result.failure;
      return;
    }
    intents.delete(fingerprint);
    markLive(release.id, result.body);
    await refresh(token, tenantId);
  }

  function markLive(releaseId: string, detail: ReleaseSummary) {
    items = (items ?? []).map((item) => {
      if (item.id === releaseId) return { ...item, status: 'live', label: detail.label, allowedActions: detail.allowedActions };
      if (item.status === 'live') return { ...item, status: 'archived', allowedActions: withRollback(item.allowedActions) };
      return item;
    });
    reportLive(items);
  }

  function reportLive(list: ReleaseSummary[]) {
    onLive?.(list.find((item) => item.status === 'live')?.id ?? null);
  }

  async function run(token: string, tenant: string, key: string) {
    const result = await buildRelease(token, tenant, spaceId, key);
    if (!alive) return;
    pending = false;
    if (!result.ok) {
      buildFailure = result.failure;
      return;
    }
    intent = null;
    confirmed = result.body;
    await refresh(token, tenant);
  }

  function confirm(release: ReleaseSummary) {
    if (confirming || release.status !== 'flagged' || !release.allowedActions.includes('approve') || !tenantId) return;
    const token = session.accessToken;
    if (!token) return;
    confirmIntent = sameIntent(confirmIntent, release.id);
    const key = confirmIntent.key;
    confirming = release.id;
    confirmFailure = null;
    void runConfirm(token, tenantId, release, key);
  }

  async function runConfirm(token: string, tenant: string, release: ReleaseSummary, key: string) {
    const result = await approveRelease(token, tenant, spaceId, release.id, key);
    if (!alive) return;
    confirming = '';
    if (!result.ok) {
      confirmFailure = result.failure;
      return;
    }
    confirmIntent = null;
    items = (items ?? []).map((item) => {
      if (item.id === result.body.id) return result.body;
      if (item.status === 'live' && result.body.status === 'live') return { ...item, status: 'archived' };
      return item;
    });
    reportLive(items);
    await refresh(token, tenant);
  }

  void load();
</script>

<PageHeader level={2} title="发版" description="发版是空间对外的不可变快照。构建只确认主版本，站点仍需完成上线。" />

{#if tenantId === null && !listFailure}
  <p class="text-sm text-muted">正在载入发版。</p>
{:else if tenantId === null}
  <div role="alert" class="flex flex-wrap items-center gap-3 text-sm text-ink">
    <p>{listMessage}</p>
    <Button variant="quiet" onclick={() => void load()}>重试</Button>
  </div>
{:else}
  <section aria-label="构建发版" class="flex max-w-md flex-col items-start gap-3">
    <Button disabled={pending} onclick={submit}>构建发版</Button>
    {#if confirmed}
      <p role="status" aria-label="构建结果" class="rounded-nav px-3 py-2 text-sm {tones[confirmed.outcome]}">
        <span class="font-medium">{confirmed.outcome}</span>
        {confirmed.summary}
      </p>
      {#if confirmed.outcome === 'held'}
        <ul aria-label="校验报告" class="flex flex-col gap-1 text-sm text-ink">
          {#each keyedText(confirmed.report) as line (line.key)}
            <li>{line.text}</li>
          {/each}
        </ul>
      {/if}
    {/if}
    {#if buildMessage}
      <div role="alert" class="flex flex-wrap items-center gap-3 text-sm text-ink">
        <p>{buildMessage}</p>
        {#if retryable}
          <Button variant="quiet" disabled={pending} onclick={submit}>重试</Button>
        {/if}
      </div>
    {/if}
  </section>

  {#if preview}
    <section aria-label="预览" class="mt-4 max-w-md rounded-card border border-line bg-surface px-3 py-3 text-sm">
      <p class="font-medium text-ink">{preview.title}</p>
      <p class="mt-1 whitespace-pre-wrap text-ink">{preview.content}</p>
    </section>
  {/if}
  {#if previewMessage}
    <div role="alert" class="mt-4 text-sm text-ink">
      <p>{previewMessage}</p>
    </div>
  {/if}
  {#if switchMessage}
    <div role="alert" class="mt-4 text-sm text-ink">
      <p>{switchMessage}</p>
    </div>
  {/if}
  {#if confirmMessage}
    <p role="alert" class="mt-4 text-sm text-ink">{confirmMessage}</p>
  {/if}
  {#if listMessage}
    <div role="alert" class="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink">
      <p>{listMessage}</p>
      <Button variant="quiet" onclick={() => tenantId && session.accessToken && refresh(session.accessToken, tenantId)}>重试</Button>
    </div>
  {/if}
  {#if items && items.length > 0}
    <ul aria-label="发版列表" class="mt-6 flex max-w-md flex-col gap-2">
      {#each items as release (release.id)}
        <li class="flex flex-col gap-2 rounded-card border border-line bg-surface px-3 py-2 text-sm">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <span class="text-ink">{release.label}</span>
            <span class="text-muted">{statusLabel(release.status)}</span>
            <span class="flex flex-wrap gap-2">
              {#if canPreview(release)}
                <Button variant="quiet" disabled={acting} onclick={() => void openPreview(release)}>预览</Button>
              {/if}
              {#if liveControl(release) === 'promote'}
                <Button variant="quiet" disabled={acting} onclick={() => void switchTo(release, 'promote')}>切换主版本</Button>
              {/if}
              {#if liveControl(release) === 'rollback'}
                <Button variant="quiet" disabled={acting} onclick={() => void switchTo(release, 'rollback')}>回滚</Button>
              {/if}
            </span>
          </div>
          {#if release.status === 'flagged'}
            <p class="text-ink">确认前不能成为主版本。</p>
            <div class="flex gap-2">
              <Button disabled>设为主版本</Button>
              {#if release.allowedActions.includes('approve')}
                <Button disabled={confirming === release.id} onclick={() => confirm(release)}>确认</Button>
              {/if}
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {:else if items && !listFailure}
    <div class="mt-6">
      <EmptyState title="尚无发版" description="构建后会在这里列出这一空间的发版。" />
    </div>
  {/if}
{/if}

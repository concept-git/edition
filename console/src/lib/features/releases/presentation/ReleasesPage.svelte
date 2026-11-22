<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { ApiFailure } from '#lib/shared/api/client';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import Button from '#lib/shared/ui/Button.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import { buildRelease, listReleases, resolveTenant } from '../data/http-releases';
  import { sameIntent, statusLabel, type ConfirmedBuild, type ReleaseOutcome, type ReleaseSummary, type WriteIntent } from '../domain/release';
  import { buildFailureMessage, canRetry, listFailureMessage } from './messages';

  let { spaceId }: { spaceId: string } = $props();
  const session = getSession();
  const tones: Record<ReleaseOutcome, string> = {
    promoted: 'bg-mint text-accent',
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
  let intent: WriteIntent | null = null;
  let alive = true;

  const listMessage = $derived(listFailure ? listFailureMessage(listFailure) : '');
  const buildMessage = $derived(buildFailure ? buildFailureMessage(buildFailure) : '');
  const retryable = $derived(buildFailure !== null && canRetry(buildFailure));

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
          {#each confirmed.report as line, index (index)}
            <li>{line}</li>
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

  {#if listMessage}
    <div role="alert" class="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink">
      <p>{listMessage}</p>
      <Button variant="quiet" onclick={() => tenantId && session.accessToken && refresh(session.accessToken, tenantId)}>重试</Button>
    </div>
  {/if}
  {#if items && items.length > 0}
    <ul aria-label="发版列表" class="mt-6 flex max-w-md flex-col gap-2">
      {#each items as release (release.id)}
        <li class="flex items-center justify-between gap-3 rounded-card border border-line bg-surface px-3 py-2 text-sm">
          <span class="text-ink">{release.label}</span>
          <span class="text-muted">{statusLabel(release.status)}</span>
        </li>
      {/each}
    </ul>
  {:else if items && !listFailure}
    <div class="mt-6">
      <EmptyState title="尚无发版" description="构建后会在这里列出这一空间的发版。" />
    </div>
  {/if}
{/if}

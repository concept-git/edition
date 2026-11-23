<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { ApiFailure } from '#lib/shared/api/client';
  import Button from '#lib/shared/ui/Button.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import TextField from '#lib/shared/ui/TextField.svelte';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import { currentTenant, deleteRedirect, loadMounts, loadPages, loadRedirects, remountSpace, reslugPage } from '../data/redirects-api';
  import {
    IntentKey,
    queryFailureMessage,
    writeFailureMessage,
    type MountAddress,
    type PageAddress,
    type RedirectRule
  } from '../domain/redirects';

  let { siteId }: { siteId: string } = $props();
  const session = getSession();
  const remountIntent = new IntentKey();
  const reslugIntent = new IntentKey();
  const deleteIntent = new IntentKey();
  let mounts = $state<MountAddress[] | null>(null);
  let pages = $state<PageAddress[] | null>(null);
  let rules = $state<RedirectRule[] | null>(null);
  let slugDrafts = $state<Record<string, string>>({});
  let addressDrafts = $state<Record<string, string>>({});
  let confirming = $state<string | null>(null);
  let pending = $state(false);
  let queryFailure = $state<ApiFailure | null>(null);
  let actionFailure = $state<ApiFailure | null>(null);
  let alive = true;

  onDestroy(() => {
    alive = false;
  });

  async function load() {
    const token = session.accessToken;
    if (!token) {
      queryFailure = { status: 0, code: null, traceId: null, retryAfter: null };
      return;
    }
    const tenant = await currentTenant(token);
    if (!alive) return;
    if (!tenant.ok) {
      queryFailure = tenant.failure;
      return;
    }
    const [mountResult, redirectResult] = await Promise.all([
      loadMounts(token, tenant.body, siteId),
      loadRedirects(token, tenant.body, siteId)
    ]);
    if (!alive) return;
    if (!mountResult.ok) {
      queryFailure = mountResult.failure;
      return;
    }
    if (!redirectResult.ok) {
      queryFailure = redirectResult.failure;
      return;
    }
    const pageResult = await loadMountedPages(token, tenant.body, mountResult.body);
    if (!alive) return;
    if (!pageResult.ok) {
      queryFailure = pageResult.failure;
      return;
    }
    queryFailure = null;
    for (const mount of mountResult.body) if (slugDrafts[mount.spaceId] === undefined) slugDrafts[mount.spaceId] = '';
    for (const page of pageResult.body) if (addressDrafts[page.id] === undefined) addressDrafts[page.id] = '';
    mounts = mountResult.body;
    pages = pageResult.body;
    rules = redirectResult.body;
  }

  async function tenantId(token: string): Promise<string | null> {
    const tenant = await currentTenant(token);
    if (!tenant.ok) {
      actionFailure = tenant.failure;
      return null;
    }
    return tenant.body;
  }

  async function loadMountedPages(token: string, tenant: string, items: MountAddress[]) {
    const collected: PageAddress[] = [];
    for (const mount of items) {
      const result = await loadPages(token, tenant, mount.spaceId);
      if (!result.ok) return result;
      collected.push(...result.body);
    }
    return { ok: true as const, body: collected };
  }

  async function refreshRules(token: string, tenant: string) {
    const result = await loadRedirects(token, tenant, siteId);
    if (!alive) return;
    if (!result.ok) {
      actionFailure = result.failure;
      return;
    }
    rules = result.body;
  }

  async function changeSlug(event: SubmitEvent, mount: MountAddress) {
    event.preventDefault();
    const token = session.accessToken;
    const next = (slugDrafts[mount.spaceId] ?? '').trim();
    if (!token || pending || next === '') return;
    pending = true;
    actionFailure = null;
    const tenant = await tenantId(token);
    if (!alive || !tenant) {
      pending = false;
      return;
    }
    const key = remountIntent.take(`${siteId}\n${mount.spaceId}\n${mount.slug}\n${next}`);
    const changed = await remountSpace(token, tenant, siteId, mount.slug, next, key);
    if (!alive) return;
    pending = false;
    if (!changed.ok) {
      actionFailure = changed.failure;
      return;
    }
    remountIntent.finish();
    const slugs = new Map(changed.body.map((item) => [item.spaceId, item.slug]));
    mounts = (mounts ?? []).map((item) => (slugs.has(item.spaceId) ? { ...item, slug: slugs.get(item.spaceId) ?? item.slug } : item));
    slugDrafts[mount.spaceId] = '';
    await refreshRules(token, tenant);
  }

  async function changeAddress(event: SubmitEvent, page: PageAddress) {
    event.preventDefault();
    const token = session.accessToken;
    const next = (addressDrafts[page.id] ?? '').trim();
    if (!token || pending || next === '') return;
    pending = true;
    actionFailure = null;
    const tenant = await tenantId(token);
    if (!alive || !tenant) {
      pending = false;
      return;
    }
    const key = reslugIntent.take(`${siteId}\n${page.id}\n${page.slug}\n${next}`);
    const changed = await reslugPage(token, tenant, page.spaceId, page.id, next, key);
    if (!alive) return;
    pending = false;
    if (!changed.ok) {
      actionFailure = changed.failure;
      return;
    }
    reslugIntent.finish();
    pages = (pages ?? []).map((item) => (item.id === page.id ? { ...item, slug: changed.body.slug } : item));
    addressDrafts[page.id] = '';
    await refreshRules(token, tenant);
  }

  async function remove(path: string) {
    const token = session.accessToken;
    if (!token || pending) return;
    pending = true;
    actionFailure = null;
    const tenant = await tenantId(token);
    if (!alive || !tenant) {
      pending = false;
      return;
    }
    const key = deleteIntent.take(`${siteId}\n${path}`);
    const removed = await deleteRedirect(token, tenant, siteId, path, key);
    if (!alive) return;
    pending = false;
    if (!removed.ok) {
      actionFailure = removed.failure;
      return;
    }
    deleteIntent.finish();
    confirming = null;
    await refreshRules(token, tenant);
  }

  void load();
</script>

<PageHeader level={2} title="重定向" description="改地址后自动登记，旧地址仍到达稳定目标。" />

{#if queryFailure}
  <div role="alert" class="flex flex-wrap items-center gap-3 text-sm text-ink">
    <p>{queryFailureMessage(queryFailure)}</p>
    <Button variant="quiet" onclick={() => void load()}>重试</Button>
  </div>
{:else if mounts === null || pages === null || rules === null}
  <p class="text-sm text-muted">正在读取</p>
{:else}
  {#if actionFailure}
    <p role="alert" class="mb-4 text-sm text-ink">{writeFailureMessage(actionFailure)}</p>
  {/if}
  <ul aria-label="挂载地址" class="mb-6 flex flex-col gap-3">
    {#each mounts as mount (mount.spaceId)}
      <li class="flex flex-wrap items-end gap-3 text-sm text-ink">
        <span>{mount.spaceName}</span>
        <span>{mount.slug}</span>
        <form class="flex items-end gap-3" onsubmit={(event) => void changeSlug(event, mount)}>
          <div class="w-40">
            <TextField label="新 slug" disabled={pending} bind:value={slugDrafts[mount.spaceId]} />
          </div>
          <Button type="submit" disabled={pending}>更改路径</Button>
        </form>
      </li>
    {/each}
  </ul>
  <ul aria-label="页面地址" class="mb-6 flex flex-col gap-3">
    {#each pages as page (page.id)}
      <li class="flex flex-wrap items-end gap-3 text-sm text-ink">
        <span>{page.title}</span>
        <span>{page.slug}</span>
        <form class="flex items-end gap-3" onsubmit={(event) => void changeAddress(event, page)}>
          <div class="w-40">
            <TextField label="新地址" disabled={pending} bind:value={addressDrafts[page.id]} />
          </div>
          <Button type="submit" disabled={pending}>更改地址</Button>
        </form>
      </li>
    {/each}
  </ul>
  {#if rules.length === 0}
    <EmptyState title="没有数据" description="改变挂载 slug 或页面地址后，旧地址会出现在这里。" />
  {:else}
    <ul aria-label="重定向" class="flex max-w-3xl flex-col">
      {#each rules as rule (rule.path)}
        <li class="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line py-3 text-sm">
          <span class="min-w-40 text-ink">{rule.path}</span>
          <div role="group" aria-label="目标" class="min-w-56">
            <p class="text-ink">{rule.targetLabel}</p>
            <p class="mt-1 text-xs text-muted">{rule.targetId}</p>
          </div>
          {#if rule.currentPath}
            <span class="text-ink">{rule.currentPath}</span>
          {/if}
          <span class="text-muted">{rule.origin === 'manual' ? '人工' : '自动'}</span>
          {#if rule.origin === 'manual'}
            {#if confirming === rule.path}
              <Button variant="danger" disabled={pending} onclick={() => void remove(rule.path)}>确认删除</Button>
            {:else}
              <Button variant="danger-quiet" disabled={pending} onclick={() => (confirming = rule.path)}>删除</Button>
            {/if}
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
{/if}

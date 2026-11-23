<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { ApiFailure } from '#lib/shared/api/client';
  import Button from '#lib/shared/ui/Button.svelte';
  import DataTable from '#lib/shared/ui/DataTable.svelte';
  import Dialog from '#lib/shared/ui/Dialog.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import TextField from '#lib/shared/ui/TextField.svelte';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import { createSite, currentTenant, deleteSite, loadSiteList } from '../data/sites-api';
  import { deleteSiteMessage, IntentKey, queryFailureMessage, writeFailureMessage, type SiteList, type SiteSummary } from '../domain/sites';

  const session = getSession();
  const intent = new IntentKey();
  const deleteIntent = new IntentKey();
  let list = $state<SiteList | null>(null);
  let name = $state('');
  let pending = $state(false);
  let queryFailure = $state<ApiFailure | null>(null);
  let createFailure = $state<ApiFailure | null>(null);
  let deleteOpen = $state(false);
  let pendingDelete = $state<SiteSummary | null>(null);
  let confirmationName = $state('');
  let deleteMessage = $state('');
  let deleting = $state(false);
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
    const result = await loadSiteList(token, tenant.body);
    if (!alive) return;
    if (!result.ok) {
      queryFailure = result.failure;
      return;
    }
    queryFailure = null;
    list = result.body;
  }

  async function create(event: SubmitEvent) {
    event.preventDefault();
    const token = session.accessToken;
    if (!token || pending) return;
    pending = true;
    createFailure = null;
    const tenant = await currentTenant(token);
    if (!alive) return;
    if (!tenant.ok) {
      createFailure = tenant.failure;
      pending = false;
      return;
    }
    const key = intent.take(name);
    const created = await createSite(token, tenant.body, name, key);
    if (!alive) return;
    if (!created.ok) {
      createFailure = created.failure;
      pending = false;
      return;
    }
    intent.finish();
    name = '';
    const refreshed = await loadSiteList(token, tenant.body);
    if (!alive) return;
    pending = false;
    if (!refreshed.ok) {
      queryFailure = refreshed.failure;
      const previous = list?.items ?? [];
      const items = previous.some((site) => site.id === created.body.id)
        ? previous
        : [...previous, { id: created.body.id, name: created.body.name }];
      list = { items, canCreate: list?.canCreate ?? true };
      return;
    }
    queryFailure = null;
    list = refreshed.body;
  }

  function askDelete(site: SiteSummary) {
    pendingDelete = site;
    confirmationName = '';
    deleteMessage = '';
    deleteOpen = true;
  }

  function closeDelete() {
    deleteOpen = false;
    pendingDelete = null;
    deleteMessage = '';
  }

  async function confirmDelete() {
    const site = pendingDelete;
    const token = session.accessToken;
    if (!site || !token || deleting) return;
    deleting = true;
    deleteMessage = '';
    const tenant = await currentTenant(token);
    if (!alive) return;
    if (!tenant.ok) {
      deleteMessage = deleteSiteMessage(tenant.failure);
      deleting = false;
      return;
    }
    const key = deleteIntent.take(`${site.id}\n${confirmationName}`);
    const removed = await deleteSite(token, tenant.body, site.id, confirmationName, key);
    if (!alive) return;
    if (!removed.ok) {
      deleteMessage = deleteSiteMessage(removed.failure);
      deleting = false;
      if (removed.failure.status !== 0 && removed.failure.status !== 429 && removed.failure.status < 500) deleteIntent.finish();
      return;
    }
    deleteIntent.finish();
    deleting = false;
    closeDelete();
    const previous = list?.items ?? [];
    list = { items: previous.filter((item) => item.id !== site.id), canCreate: list?.canCreate ?? false };
    const refreshed = await loadSiteList(token, tenant.body);
    if (!alive) return;
    if (!refreshed.ok) {
      queryFailure = refreshed.failure;
      return;
    }
    queryFailure = null;
    list = refreshed.body;
  }

  void load();
</script>

<PageHeader title="站点" description="站点把一组空间编成对外地址，并持有挂载、域名、重定向和搜索。" />

{#if queryFailure}
  <div role="alert" class="mb-4 flex flex-wrap items-center gap-3 text-sm text-ink">
    <p>{queryFailureMessage(queryFailure)}</p>
    <Button variant="quiet" onclick={() => void load()}>重试</Button>
  </div>
{:else if list === null}
  <p class="mb-4 text-sm text-muted">正在读取</p>
{:else if list.items.length === 0}
  <EmptyState title="没有数据" description="创建一个站点后，可以把空间挂到 slug 上。" />
{:else}
  <DataTable label="站点" columns={['名称', ' ']} total={list.items.length}>
    {#snippet rows()}
      {#each list.items as site (site.id)}
        <tr class="border-b border-line">
          <td class="px-3 py-3">
            <a class="text-ink hover:text-accent" href={`/sites/${site.id}/mounts`}>{site.name}</a>
          </td>
          <td class="px-3 py-3 text-right">
            <Button type="button" variant="danger-quiet" onclick={() => askDelete(site)}>删除</Button>
          </td>
        </tr>
      {/each}
    {/snippet}
  </DataTable>
{/if}

{#if list?.canCreate}
  <form aria-label="创建站点" class="mt-8" onsubmit={create}>
    <h2 class="mb-1 text-sm font-medium text-ink">新站点</h2>
    <TextField layout="line" label="名称" name="name" required disabled={pending} hint="站点把空间编成对外地址。" bind:value={name} />
    {#if createFailure}
      <p role="alert" class="mt-3 text-sm text-ink">{writeFailureMessage(createFailure)}</p>
    {/if}
    <div class="pt-4">
      <Button type="submit" disabled={pending}>创建站点</Button>
      <p class="mt-2 text-xs text-faint">创建后可以挂载空间、域名和重定向。</p>
    </div>
  </form>
{/if}

{#if deleteOpen && pendingDelete}
  <Dialog bind:open={deleteOpen} title="确认删除站点" description="回输站点名称。站点仍有挂载时删除会被拒绝，站点还在。">
    <TextField label="站点名称" bind:value={confirmationName} />
    {#if deleteMessage}
      <p role="alert" class="text-sm text-ink">{deleteMessage}</p>
    {/if}
    {#snippet actions()}
      <Button variant="quiet" onclick={closeDelete}>取消</Button>
      <Button variant="danger" disabled={deleting || confirmationName.trim().length === 0} onclick={() => void confirmDelete()}>
        删除站点
      </Button>
    {/snippet}
  </Dialog>
{/if}

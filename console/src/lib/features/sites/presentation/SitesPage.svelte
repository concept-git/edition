<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { ApiFailure } from '#lib/shared/api/client';
  import Button from '#lib/shared/ui/Button.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import SectionCard from '#lib/shared/ui/SectionCard.svelte';
  import TextField from '#lib/shared/ui/TextField.svelte';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import { createSite, currentTenant, loadSiteList } from '../data/sites-api';
  import { IntentKey, queryFailureMessage, writeFailureMessage, type SiteList } from '../domain/sites';

  const session = getSession();
  const intent = new IntentKey();
  let list = $state<SiteList | null>(null);
  let name = $state('');
  let pending = $state(false);
  let queryFailure = $state<ApiFailure | null>(null);
  let createFailure = $state<ApiFailure | null>(null);
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

  void load();
</script>

<PageHeader title="站点" description="站点把一组空间编成对外地址，并持有挂载、域名、重定向和搜索。" />
<div class="mb-4">
  <Button href="/sites/example/mounts" variant="quiet">打开示例站点</Button>
</div>

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
  <ul aria-label="站点" class="mb-6 flex flex-col items-start gap-2">
    {#each list.items as site (site.id)}
      <li>
        <Button href={`/sites/${site.id}/mounts`}>{site.name}</Button>
      </li>
    {/each}
  </ul>
{/if}

{#if list?.canCreate}
  <SectionCard title="新站点">
    <form aria-label="创建站点" class="flex max-w-md flex-col gap-3" onsubmit={create}>
      <TextField label="名称" name="name" required disabled={pending} bind:value={name} />
      {#if createFailure}
        <p role="alert" class="text-sm text-ink">{writeFailureMessage(createFailure)}</p>
      {/if}
      <div>
        <Button type="submit" disabled={pending}>创建站点</Button>
      </div>
    </form>
  </SectionCard>
{/if}

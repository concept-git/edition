<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { ApiFailure } from '#lib/shared/api/client';
  import Button from '#lib/shared/ui/Button.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import TextField from '#lib/shared/ui/TextField.svelte';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import { bindDomain, currentTenant, listDomains, setPrimaryDomain, verifyDomain, viewDomain } from '../data/domains-api';
  import {
    IntentKey,
    canSetPrimary,
    queryFailureMessage,
    writeFailureMessage,
    type DomainDetail,
    type DomainRecord
  } from '../domain/domains';

  let { siteId }: { siteId: string } = $props();
  const session = getSession();
  const intent = new IntentKey();
  let domains = $state<DomainRecord[] | null>(null);
  let canBind = $state(false);
  let host = $state('');
  let pending = $state(false);
  let queryFailure = $state<ApiFailure | null>(null);
  let addFailure = $state<ApiFailure | null>(null);
  let actionFailure = $state<ApiFailure | null>(null);
  let alive = true;

  onDestroy(() => {
    alive = false;
  });

  function apply(detail: DomainDetail, canUpdate: boolean) {
    const next = (domains ?? []).map((item) => {
      if (item.host === detail.host) return { ...detail, canUpdate };
      if (detail.isPrimary && item.isPrimary) return { ...item, isPrimary: false };
      return item;
    });
    if (!next.some((item) => item.host === detail.host)) next.push({ ...detail, canUpdate });
    next.sort((left, right) => left.host.localeCompare(right.host));
    domains = next;
  }

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
    await refresh(token, tenant.body);
  }

  async function refresh(token: string, tenant: string) {
    const listed = await listDomains(token, tenant, siteId);
    if (!alive) return;
    if (!listed.ok) {
      queryFailure = listed.failure;
      return;
    }
    const records: DomainRecord[] = [];
    for (const item of listed.body.items) {
      const detail = await viewDomain(token, tenant, siteId, item.host);
      if (!alive) return;
      if (!detail.ok) {
        queryFailure = detail.failure;
        return;
      }
      records.push({ ...detail.body, canUpdate: item.canUpdate });
    }
    queryFailure = null;
    canBind = listed.body.canBind;
    domains = records;
  }

  async function add(event: SubmitEvent) {
    event.preventDefault();
    const token = session.accessToken;
    const nextHost = host.trim();
    if (!token || pending || nextHost === '') return;
    pending = true;
    addFailure = null;
    const tenant = await currentTenant(token);
    if (!alive) return;
    if (!tenant.ok) {
      addFailure = tenant.failure;
      pending = false;
      return;
    }
    const key = intent.take(`bind\n${siteId}\n${nextHost}`);
    const created = await bindDomain(token, tenant.body, siteId, nextHost, key);
    if (!alive) return;
    if (!created.ok) {
      addFailure = created.failure;
      pending = false;
      return;
    }
    intent.finish();
    host = '';
    apply(created.body, true);
    await refresh(token, tenant.body);
    if (!alive) return;
    pending = false;
  }

  async function prove(domainHost: string) {
    const token = session.accessToken;
    if (!token || pending) return;
    pending = true;
    actionFailure = null;
    const tenant = await currentTenant(token);
    if (!alive) return;
    if (!tenant.ok) {
      actionFailure = tenant.failure;
      pending = false;
      return;
    }
    const key = intent.take(`verify\n${siteId}\n${domainHost}`);
    const proved = await verifyDomain(token, tenant.body, siteId, domainHost, key);
    if (!alive) return;
    if (!proved.ok) {
      actionFailure = proved.failure;
      pending = false;
      return;
    }
    intent.finish();
    apply(proved.body, true);
    await refresh(token, tenant.body);
    if (!alive) return;
    pending = false;
  }

  async function choosePrimary(domainHost: string) {
    const current = domains?.find((item) => item.host === domainHost);
    if (!current || !canSetPrimary(current) || pending) return;
    const token = session.accessToken;
    if (!token) return;
    pending = true;
    actionFailure = null;
    const tenant = await currentTenant(token);
    if (!alive) return;
    if (!tenant.ok) {
      actionFailure = tenant.failure;
      pending = false;
      return;
    }
    const key = intent.take(`primary\n${siteId}\n${domainHost}`);
    const chosen = await setPrimaryDomain(token, tenant.body, siteId, domainHost, key);
    if (!alive) return;
    if (!chosen.ok) {
      actionFailure = chosen.failure;
      pending = false;
      return;
    }
    intent.finish();
    apply(chosen.body, current.canUpdate);
    await refresh(token, tenant.body);
    if (!alive) return;
    pending = false;
  }

  void load();
</script>

<PageHeader level={2} title="域名" description="未核验的自定义域名不参与解析。主域名必须已核验。" />

{#if queryFailure}
  <div role="alert" class="mb-4 flex flex-wrap items-center gap-3 text-sm text-ink">
    <p>{queryFailureMessage(queryFailure)}</p>
    <Button variant="quiet" onclick={() => void load()}>重试</Button>
  </div>
{/if}

{#if domains === null}
  {#if !queryFailure}
    <p class="mb-4 text-sm text-muted">正在读取</p>
  {/if}
{:else if domains.length === 0}
  <div class="mb-6">
    <EmptyState title="没有数据" description="添加自有域名后，按 TXT 记录完成核验。" />
  </div>
{:else}
  <ul aria-label="域名" class="mb-6 flex flex-col gap-4">
    {#each domains as domain (domain.host)}
      <li class="flex flex-col gap-2 text-sm text-ink">
        <div class="flex flex-wrap items-center gap-3">
          <span>{domain.host}</span>
          <span>{domain.verified ? '已核验' : '未核验'}</span>
          {#if domain.isPrimary}
            <span>主域名</span>
          {/if}
        </div>
        <p>
          <span class="text-muted">TXT 记录</span>
          <span>{domain.txtName}</span>
          <span>{domain.txtValue}</span>
        </p>
        {#if domain.canUpdate}
          <div class="flex flex-wrap gap-2">
            {#if !domain.verified}
              <Button type="button" disabled={pending} onclick={() => void prove(domain.host)}>核验</Button>
            {/if}
            {#if !domain.isPrimary}
              <Button type="button" disabled={pending || !canSetPrimary(domain)} onclick={() => void choosePrimary(domain.host)}>
                设为主域名
              </Button>
            {/if}
          </div>
        {/if}
      </li>
    {/each}
  </ul>
{/if}

{#if actionFailure}
  <p role="alert" class="mb-4 text-sm text-ink">{writeFailureMessage(actionFailure)}</p>
{/if}

{#if canBind}
  <form aria-label="添加域名" class="flex max-w-md flex-col gap-3" onsubmit={add}>
    <TextField label="域名" name="host" required disabled={pending} bind:value={host} />
    {#if addFailure}
      <p role="alert" class="text-sm text-ink">{writeFailureMessage(addFailure)}</p>
    {/if}
    <div>
      <Button type="submit" disabled={pending}>添加域名</Button>
    </div>
  </form>
{/if}

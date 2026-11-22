<script lang="ts">
  import type { ApiFailure } from '#lib/shared/api/client';
  import Button from '#lib/shared/ui/Button.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import SelectField from '#lib/shared/ui/SelectField.svelte';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import { loadSearch, loadSiteOptions, loadTenant, loadTraffic, type SearchReport, type VisitsReport } from '../data/http-analytics';
  import { failureText, healthClass, healthLabel, type SiteOption } from '../domain/analytics';
  import VisitChart from './VisitChart.svelte';

  let { view }: { view: 'visits' | 'search' } = $props();
  const session = getSession();

  const pages = {
    visits: {
      title: '访问趋势',
      description: '查看线上版本的访问。采集缺口保持为缺口。',
      empty: '没有采集时这里是无数据，不是一条贴地的零线。'
    },
    search: {
      title: '搜索排行',
      description: '查看读者在站点上的搜索。',
      empty: '没有采集时不把缺失画成零。'
    }
  };

  const current = $derived(pages[view]);

  type Report = { kind: 'loading' } | { kind: 'error'; failure: ApiFailure } | { kind: 'sites' } | VisitsReport | SearchReport;

  let sites = $state<SiteOption[]>([]);
  let siteId = $state('');
  let report = $state<Report>({ kind: 'loading' });
  let generation = 0;
  const status = $derived(report.kind === 'empty' || report.kind === 'visits' || report.kind === 'search' ? healthLabel(report.health.status) : null);

  async function load(selected = siteId) {
    const current = ++generation;
    const token = session.accessToken;
    const requested = view;
    if (!token) {
      report = { kind: 'error', failure: { status: 0, code: null, traceId: null, retryAfter: null } };
      return;
    }
    report = { kind: 'loading' };
    const tenant = await loadTenant(token);
    if (current !== generation) return;
    if (!tenant.ok) {
      report = { kind: 'error', failure: tenant.failure };
      return;
    }
    const listed = await loadSiteOptions(token, tenant.body);
    if (current !== generation) return;
    if (!listed.ok) {
      report = { kind: 'error', failure: listed.failure };
      return;
    }
    sites = listed.body;
    if (listed.body.length === 0) {
      siteId = '';
      report = { kind: 'sites' };
      return;
    }
    const id = listed.body.some((site) => site.id === selected) ? selected : listed.body[0].id;
    siteId = id;
    const result = requested === 'visits' ? await loadTraffic(token, tenant.body, id) : await loadSearch(token, tenant.body, id);
    if (current !== generation) return;
    report = result.ok ? result.body : { kind: 'error', failure: result.failure };
  }

  void load();
</script>

<PageHeader title={current.title} description={current.description} />

{#if sites.length > 1}
  <div class="mb-4 max-w-xs">
    <SelectField label="站点" bind:value={siteId} options={sites.map((site) => ({ value: site.id, label: site.name }))} onchange={(value) => void load(value)} />
  </div>
{/if}

{#if report.kind === 'loading'}
  <p class="text-sm text-muted">正在读取</p>
{:else if report.kind === 'error'}
  <div role="alert" class="flex flex-wrap items-center gap-3 text-sm text-ink">
    <p>{failureText(report.failure)}</p>
    <Button variant="quiet" onclick={() => void load()}>重试</Button>
  </div>
{:else if report.kind === 'sites' || report.kind === 'empty'}
  {#if status && report.kind === 'empty'}
    <p role="status" class="mb-4 inline-flex rounded-nav border px-2 py-0.5 text-sm {healthClass(report.health.status)}">{status}</p>
  {/if}
  <EmptyState title="没有数据" description={report.kind === 'sites' ? '创建一个站点后，才能查看线上版本的使用。' : current.empty} />
{:else if report.kind === 'visits'}
  {#if status}
    <p role="status" class="mb-4 inline-flex rounded-nav border px-2 py-0.5 text-sm {healthClass(report.health.status)}">{status}</p>
  {/if}
  <VisitChart points={report.points} />
  {#if report.pages.length > 0}
    <ul aria-label="页面排行" class="mt-6 max-w-md">
      {#each report.pages as page (page.label)}
        <li class="flex items-baseline justify-between gap-4 border-b border-line py-2 text-sm">
          <span>{page.label}</span>
          <span>{page.count}</span>
        </li>
      {/each}
    </ul>
  {/if}
{:else}
  {#if status}
    <p role="status" class="mb-4 inline-flex rounded-nav border px-2 py-0.5 text-sm {healthClass(report.health.status)}">{status}</p>
  {/if}
  <ul aria-label="搜索排行" class="max-w-md">
    {#each report.popular as item (item.label)}
      <li class="flex items-baseline justify-between gap-4 border-b border-line py-2 text-sm">
        <span>{item.label}</span>
        <span>{item.count}</span>
      </li>
    {/each}
  </ul>
{/if}

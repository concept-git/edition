<script lang="ts">
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import { loadContentMetrics } from '../data/content-metrics';
  import type { ContentHome, Count } from '../domain/content-metrics';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import LoadingNote from '#lib/shared/ui/LoadingNote.svelte';
  import Notice from '#lib/shared/ui/Notice.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import Stat from '#lib/shared/ui/Stat.svelte';

  const session = getSession();
  let home = $state<ContentHome | { status: 'loading' }>({ status: 'loading' });
  let generation = 0;

  function shown(count: Count): string {
    return count === null ? '—' : String(count);
  }

  function shownYesterday(count: Count): string {
    return count === null ? '昨日 —' : `昨日 ${count}`;
  }

  async function load() {
    const current = ++generation;
    const token = session.accessToken;
    if (!token) {
      home = { status: 'error', traceId: null };
      return;
    }
    home = { status: 'loading' };
    const next = await loadContentMetrics(token);
    if (current === generation) home = next;
  }

  void load();
</script>

<PageHeader title="使用情况" description="成员、页面和已进版页面。没有计数时不把缺口画成零。" />

{#if home.status === 'loading'}
  <LoadingNote text="正在读取内容数据。" />
{:else if home.status === 'error'}
  <Notice text={home.traceId === null ? '内容数据没有读到。' : `内容数据没有读到。追踪号 ${home.traceId}。`} onRetry={() => void load()} />
{:else if home.status === 'empty'}
  <EmptyState title="没有数据" description="没有可显示的计数。缺口不会画成零。" />
{:else}
  <section aria-label="内容使用情况">
    <h2 class="text-sm font-medium text-ink">内容使用情况</h2>
    <p class="mt-1 text-xs text-faint">
      详细了解内容使用情况，可查看
      <a href="/analytics/visits" class="font-normal text-accent">使用分析</a>
    </p>
    <div class="mt-8 grid grid-cols-3 gap-x-16 gap-y-8">
      {#each home.figures as figure (figure.label)}
        <Stat scale="sheet" label={figure.label} value={shown(figure.total)} supplement={shownYesterday(figure.yesterday)} />
      {/each}
    </div>
  </section>
{/if}

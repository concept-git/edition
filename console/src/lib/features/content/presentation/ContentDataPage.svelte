<script lang="ts">
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import { loadContentMetrics } from '../data/content-metrics';
  import type { ContentHome, Count } from '../domain/content-metrics';
  import Button from '#lib/shared/ui/Button.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
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

<PageHeader title="内容数据" description="成员、页面和已进版页面，以及昨日补充。没有计数时不把缺口画成零。" />

{#if home.status === 'loading'}
  <p class="text-sm text-muted">正在读取内容数据。</p>
{:else if home.status === 'error'}
  <div role="alert" class="flex flex-wrap items-center gap-3 text-sm text-ink">
    <p>{home.traceId === null ? '内容数据没有读到。' : `内容数据没有读到。追踪号 ${home.traceId}。`}</p>
    <Button variant="quiet" onclick={() => void load()}>重试</Button>
  </div>
{:else if home.status === 'empty'}
  <EmptyState title="没有数据" description="没有可显示的计数。缺口不会画成零。" />
{:else}
  <section aria-label="内容使用情况" class="mt-8 grid grid-cols-3 gap-8">
    {#each home.figures as figure (figure.label)}
      <Stat label={figure.label} value={shown(figure.total)} supplement={shownYesterday(figure.yesterday)} />
    {/each}
  </section>
{/if}

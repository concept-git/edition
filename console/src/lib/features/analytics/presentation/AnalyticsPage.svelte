<script lang="ts">
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';

  let { view }: { view: 'visits' | 'search' } = $props();

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
</script>

<PageHeader title={current.title} description={current.description} />
<EmptyState title="没有数据" description={current.empty} />

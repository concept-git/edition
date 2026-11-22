<script lang="ts">
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
</script>

<PageHeader title="审计" description="按操作查阅审计。已注销的主体不再被重新认出。" />
<EmptyState title="没有数据" description="查询失败时会保留错误，而不是变成一张空表。" />

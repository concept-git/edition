<script lang="ts">
  import Button from '#lib/shared/ui/Button.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
</script>

<PageHeader title="站点" description="站点把一组空间编成对外地址，并持有挂载、域名、重定向和搜索。" />
<EmptyState title="没有数据" description="打开示例站点可以查看挂载、域名、重定向、搜索、授权和 Webhook。">
  {#snippet actions()}
    <Button href="/sites/example/mounts">打开示例站点</Button>
  {/snippet}
</EmptyState>

<script lang="ts">
  import Button from '#lib/shared/ui/Button.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';

  let { view }: { view: 'spaces' | 'collections' } = $props();
</script>

{#if view === 'spaces'}
  <PageHeader title="空间" description="空间是一组页面的家。来源模式分为 authored 与 synced。" />
  <EmptyState title="没有数据" description="打开示例空间可以查看页面、目录、标签、发版、导入、授权和回收。">
    {#snippet actions()}
      <Button href="/content/spaces/example/pages">打开示例空间</Button>
    {/snippet}
  </EmptyState>
{:else}
  <PageHeader title="分组" description="分组最多 3 级，只做归类，不承载权限、地址或生命周期。" />
  <EmptyState title="没有数据" description="登录后可以把空间放进分组。" />
{/if}

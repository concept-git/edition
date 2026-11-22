<script lang="ts">
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
</script>

<PageHeader title="插件" description="按基线编辑插件源码并形成候选。候选不接触管理凭据，也不改生产登记。" />
<EmptyState title="没有数据" description="登录后可以按基线编辑插件源码。" />

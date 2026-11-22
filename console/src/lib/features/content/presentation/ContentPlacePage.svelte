<script lang="ts">
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
</script>

<PageHeader title="分组" description="分组最多 3 级，只做归类，不承载权限、地址或生命周期。" />
<EmptyState title="没有数据" description="登录后可以把空间放进分组。" />

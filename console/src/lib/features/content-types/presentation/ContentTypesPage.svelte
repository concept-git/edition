<script lang="ts">
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
</script>

<PageHeader title="内容类型" description="登记不可变版本，并启用或切换。已有正文不会因此改写。" />
<EmptyState title="没有数据" description="登录后可以登记内容类型的一个版本。" />

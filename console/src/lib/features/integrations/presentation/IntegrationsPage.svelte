<script lang="ts">
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';

  let { view }: { view: 'api' | 'management' } = $props();

  const pages = {
    api: {
      title: 'API 令牌',
      description: 'API 令牌代表机器调用方，权限同时受自身范围与资源授权约束。',
      empty: '签发成功时秘密只显示一次。登录后可以签发和吊销。'
    },
    management: {
      title: '管理令牌',
      description: '管理令牌是用户为管理自动化签发的有限期凭据，仍然代表该用户。',
      empty: '签发成功时秘密只显示一次。登录后可以签发和吊销。'
    }
  };

  const current = $derived(pages[view]);
</script>

<PageHeader title={current.title} description={current.description} />
<EmptyState title="没有数据" description={current.empty} />

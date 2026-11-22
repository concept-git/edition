<script lang="ts">
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';

  let { view }: { view: 'tenants' | 'users' | 'health' | 'mail' } = $props();

  const pages = {
    tenants: {
      title: '租户',
      description: '平台运营员查看租户。这里不展示租户正文。',
      empty: '登录为平台运营员后可以查看租户。'
    },
    users: {
      title: '用户',
      description: '平台运营员查看用户。这里不展示租户正文。',
      empty: '登录为平台运营员后可以查看用户。'
    },
    health: {
      title: '进程健康',
      description: '查看进程与交付健康。这里没有租户正文。',
      empty: '登录为平台运营员后可以查看健康。'
    },
    mail: {
      title: '邮件作业',
      description: '查看邮件作业。这里不展示租户正文。',
      empty: '登录为平台运营员后可以查看邮件作业。'
    }
  };

  const current = $derived(pages[view]);
</script>

<PageHeader title={current.title} description={current.description} />
<EmptyState title="没有数据" description={current.empty} />

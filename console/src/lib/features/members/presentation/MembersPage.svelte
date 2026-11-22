<script lang="ts">
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';

  let { view }: { view: 'members' | 'teams' } = $props();

  const pages = {
    members: {
      title: '成员',
      description: '邀请同事加入当前租户。成员角色是所有者或成员。',
      empty: '登录后可以邀请成员，并看到邀请状态。'
    },
    teams: {
      title: '用户组',
      description: '用户组把多个用户收成一个可授权的主体。',
      empty: '登录后可以创建用户组，并把成员放进去。'
    }
  };

  const current = $derived(pages[view]);
</script>

<PageHeader title={current.title} description={current.description} />
<EmptyState title="没有数据" description={current.empty} />

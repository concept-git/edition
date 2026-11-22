<script lang="ts">
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import TextField from '#lib/shared/ui/TextField.svelte';

  let draft = $state('');

  let { view }: { view: 'password' | 'sessions' | 'deactivate' | 'erase' } = $props();

  const pages = {
    password: {
      title: '密码',
      description: '修改用来证明身份的密码。',
      empty: '登录后可以修改密码。'
    },
    sessions: {
      title: '管理会话',
      description: '查看并结束自己的管理会话。',
      empty: '登录后可以查看会话，并结束其中一次。'
    },
    deactivate: {
      title: '停用',
      description: '停用可逆，并结束全部会话。',
      empty: '登录后可以停用账号。停用不是注销。'
    },
    erase: {
      title: '注销',
      description: '注销不可逆。确认前账号仍然保留。',
      empty: '注销前会看到不可逆说明。取消则账号仍在。'
    }
  };

  const current = $derived(pages[view]);
</script>

<PageHeader title={current.title} description={current.description} />
{#if view === 'password'}
  <div class="mb-4 max-w-sm">
    <TextField label="当前密码" type="password" autocomplete="current-password" bind:value={draft} />
  </div>
{/if}
<EmptyState title="没有数据" description={current.empty} />

<script lang="ts">
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';

  let { view }: { view: 'mounts' | 'domains' | 'redirects' | 'search' | 'grants' | 'webhooks' } = $props();

  const pages = {
    mounts: { title: '挂载', description: '把空间挂到一个 slug。身份引用仍用稳定 id。' },
    domains: { title: '自有域名', description: '未核验的自定义域名不参与解析。主域名必须已核验。' },
    redirects: { title: '重定向', description: '改地址后自动登记，旧地址仍到达稳定目标。' },
    search: { title: '搜索', description: '排定搜索字段的优先顺序。搜索不索引工作稿。' },
    grants: { title: '授权', description: '在站点上把角色赋予主体。' },
    webhooks: { title: '投递结果', description: '登记 Webhook 投递，并区分成功和失败。' }
  };

  const current = $derived(pages[view]);
</script>

<PageHeader level={2} title={current.title} description={current.description} />
<EmptyState title="没有数据" description="登录后可以编辑这一站点的挂载和域名。" />

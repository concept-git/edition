<script lang="ts">
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';

  let { view }: { view: 'pages' | 'toc' | 'tags' | 'releases' | 'imports' | 'grants' | 'trash' } = $props();

  const pages = {
    pages: { title: '页面', description: '可以创建 Markdown、HTML、TXT、JSON 和 XML 五种页面。' },
    toc: { title: '目录', description: '目录最多 7 级，供读者按顺序浏览。' },
    tags: { title: '标签', description: '标签把页面跨位置聚在一起。' },
    releases: { title: '发版', description: '发版是空间对外的不可变快照。预览只指尚未成为主版本的发版。' },
    imports: { title: '导入', description: '同步空间可以导入发版包。手写空间拒绝整体导入。' },
    grants: { title: '授权', description: '在空间上把角色赋予主体。页面上只能收窄。' },
    trash: { title: '回收', description: '回收的页面可以恢复。清除才不可逆。' }
  };

  const current = $derived(pages[view]);
</script>

<PageHeader level={2} title={current.title} description={current.description} />
<EmptyState title="没有数据" description="登录后可以编辑这一空间里的页面。" />

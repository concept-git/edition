<script lang="ts">
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import Stat from '#lib/shared/ui/Stat.svelte';

  const stats = [
    { label: '成员', supplement: '昨日 —' },
    { label: '页面', supplement: '昨日 —' },
    { label: '已进版页面', supplement: '昨日 —' }
  ];
</script>

<PageHeader title="内容数据" description="成员、页面和已进版页面。登录后显示计数；没有采集时不把缺口画成零。" />
<section aria-label="内容使用情况" class="mt-8 grid grid-cols-3 gap-8">
  {#each stats as stat (stat.label)}
    <Stat label={stat.label} value="—" supplement={stat.supplement} />
  {/each}
</section>

<script lang="ts">
  import Button from '#lib/shared/ui/Button.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import SectionCard from '#lib/shared/ui/SectionCard.svelte';

  const steps = [
    { n: '1', title: '邀请成员', description: '把同事请入当前租户。', href: '/members', label: '邀请成员' },
    { n: '2', title: '创建空间', description: '给页面一个家。', href: '/content/spaces', label: '创建空间' },
    { n: '3', title: '挂载站点', description: '把空间编到对外 slug。', href: '/sites/example/mounts', label: '挂载站点' }
  ];
</script>

<PageHeader title="概览" description="当前租户的成员、空间和站点。" />
<div class="flex flex-col gap-4">
  <SectionCard title="上手">
    <div class="grid grid-cols-3 gap-4">
      {#each steps as step (step.n)}
        <div>
          <span class="flex h-6 w-6 items-center justify-center rounded-full bg-mint text-xs font-semibold text-accent">{step.n}</span>
          <p class="mt-3 text-sm font-medium text-ink">{step.title}</p>
          <p class="mt-1 text-xs leading-5 text-muted">{step.description}</p>
          <div class="mt-3">
            <Button href={step.href} variant="quiet">{step.label}</Button>
          </div>
        </div>
      {/each}
    </div>
  </SectionCard>
  <SectionCard title="数量">
    <EmptyState title="没有数据" description="登录后显示成员、空间和站点的数量。" />
  </SectionCard>
</div>

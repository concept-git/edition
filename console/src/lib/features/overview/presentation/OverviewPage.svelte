<script lang="ts">
  import Button from '#lib/shared/ui/Button.svelte';
  import Icon from '#lib/shared/ui/Icon.svelte';
  import LoadingNote from '#lib/shared/ui/LoadingNote.svelte';
  import Notice from '#lib/shared/ui/Notice.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import SectionCard from '#lib/shared/ui/SectionCard.svelte';
  import Stat from '#lib/shared/ui/Stat.svelte';
  import { loadTenantCounts } from '../data/http-counts';
  import { countFailureText, countsAreEmpty } from '../domain/counts';

  let { token }: { token: string | null } = $props();

  const steps = [
    { n: '1', title: '邀请成员', description: '把同事请入当前租户。', href: '/members', label: '邀请成员' },
    { n: '2', title: '创建空间', description: '给页面一个家。', href: '/content/spaces', label: '创建空间' },
    { n: '3', title: '挂载站点', description: '把空间编到对外 slug。', href: '/sites', label: '挂载站点' }
  ];

  let attempt = $state(0);
  let showSteps = $state(true);
  const request = $derived.by(() => {
    const currentToken = token;
    attempt;
    if (!currentToken) return Promise.resolve(null);
    return loadTenantCounts(currentToken);
  });

  function retry() {
    attempt += 1;
  }
</script>

<PageHeader title="当前租户" description="成员、空间和站点。" />
<div class="flex flex-col gap-4">
  {#if showSteps}
    <SectionCard title="快速上手">
      {#snippet actions()}
        <button type="button" class="inline-flex h-8 w-8 items-center justify-center rounded-nav text-faint hover:bg-chip hover:text-ink" aria-label="关闭快速上手" onclick={() => (showSteps = false)}>
          <Icon name="close" />
        </button>
      {/snippet}
      <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {#each steps as step (step.n)}
          <div>
            <span class="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-medium text-white">{step.n}</span>
            <p class="mt-3 text-sm font-medium text-ink">{step.title}</p>
            <p class="mt-1 text-xs leading-5 text-faint">{step.description}</p>
            <div class="mt-3">
              <Button href={step.href} variant="quiet">{step.label}</Button>
            </div>
          </div>
        {/each}
      </div>
    </SectionCard>
  {/if}
  <SectionCard title="租户">
    {#snippet actions()}
      <span class="flex gap-2">
        <Button href="/members" variant="quiet">成员</Button>
        <Button href="/content/spaces" variant="quiet">空间</Button>
        <Button href="/sites" variant="quiet">站点</Button>
      </span>
    {/snippet}
    {#await request}
      <LoadingNote text="正在读取数量。" />
    {:then result}
      {#if result === null}
        <LoadingNote text="正在读取数量。" />
      {:else if !result.ok}
        <Notice
          text={countFailureText(result.failure)}
          onRetry={result.failure.status === 0 || result.failure.status === 429 || result.failure.status >= 500 ? retry : undefined}
        />
      {:else if countsAreEmpty(result.counts)}
        <p class="text-sm text-muted">当前租户还没有成员、空间和站点。</p>
      {:else}
        <div class="grid grid-cols-3 gap-x-12 gap-y-6">
          <Stat label="成员" value={String(result.counts.members)} supplement="当前租户" />
          <Stat label="空间" value={String(result.counts.spaces)} supplement="当前租户" />
          <Stat label="站点" value={String(result.counts.sites)} supplement="当前租户" />
        </div>
      {/if}
    {/await}
  </SectionCard>
</div>

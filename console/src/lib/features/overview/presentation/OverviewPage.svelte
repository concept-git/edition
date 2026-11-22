<script lang="ts">
  import type { ApiFailure } from '#lib/shared/api/client';
  import Button from '#lib/shared/ui/Button.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import SectionCard from '#lib/shared/ui/SectionCard.svelte';
  import Stat from '#lib/shared/ui/Stat.svelte';
  import { loadTenantCounts } from '../data/http-counts';
  import { countFailureText, countsAreEmpty, type TenantCounts } from '../domain/counts';

  let { token }: { token: string | null } = $props();

  const steps = [
    { n: '1', title: '邀请成员', description: '把同事请入当前租户。', href: '/members', label: '邀请成员' },
    { n: '2', title: '创建空间', description: '给页面一个家。', href: '/content/spaces', label: '创建空间' },
    { n: '3', title: '挂载站点', description: '把空间编到对外 slug。', href: '/sites/example/mounts', label: '挂载站点' }
  ];

  type View =
    | { kind: 'loading' }
    | { kind: 'empty' }
    | { kind: 'ready'; counts: TenantCounts }
    | { kind: 'error'; failure: ApiFailure };

  let view = $state.raw<View>({ kind: 'loading' });
  let attempt = $state(0);
  const retryable = $derived(
    view.kind === 'error' && (view.failure.status === 0 || view.failure.status === 429 || view.failure.status >= 500)
  );

  function retry() {
    attempt += 1;
  }

  $effect(() => {
    const currentToken = token;
    const generation = attempt;
    if (!currentToken) return;
    let active = true;
    view = { kind: 'loading' };
    void loadTenantCounts(currentToken).then((result) => {
      if (!active || generation !== attempt) return;
      if (!result.ok) {
        view = { kind: 'error', failure: result.failure };
        return;
      }
      view = countsAreEmpty(result.counts) ? { kind: 'empty' } : { kind: 'ready', counts: result.counts };
    });
    return () => {
      active = false;
    };
  });
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
    {#if view.kind === 'ready'}
      <div class="grid grid-cols-3 gap-8">
        <Stat label="成员" value={String(view.counts.members)} supplement="当前租户" />
        <Stat label="空间" value={String(view.counts.spaces)} supplement="当前租户" />
        <Stat label="站点" value={String(view.counts.sites)} supplement="当前租户" />
      </div>
    {:else if view.kind === 'empty'}
      <EmptyState title="没有数据" description="当前租户还没有成员、空间和站点。" />
    {:else if view.kind === 'error'}
      <div role="alert" class="flex flex-wrap items-center gap-3 text-sm text-ink">
        <p>{countFailureText(view.failure)}</p>
        {#if retryable}
          <Button variant="quiet" onclick={retry}>重试</Button>
        {/if}
      </div>
    {:else}
      <p class="text-sm text-muted">正在读取数量。</p>
    {/if}
  </SectionCard>
</div>

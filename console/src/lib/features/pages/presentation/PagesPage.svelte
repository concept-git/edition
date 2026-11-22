<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { ApiFailure } from '#lib/shared/api/client';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import Button from '#lib/shared/ui/Button.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import { listPages } from '../data/http-pages';
  import type { SpacePage } from '../domain/page';
  import { pagesFailureMessage } from './messages';

  let { spaceId }: { spaceId: string } = $props();
  const session = getSession();
  let items = $state<SpacePage[] | null>(null);
  let failure = $state<ApiFailure | null>(null);
  let alive = true;

  onDestroy(() => {
    alive = false;
  });

  async function load() {
    failure = null;
    items = null;
    const token = session.accessToken;
    if (!token) {
      failure = { status: 0, code: null, traceId: null, retryAfter: null };
      return;
    }
    const result = await listPages(token, spaceId);
    if (!alive) return;
    if (!result.ok) {
      failure = result.failure;
      items = null;
      return;
    }
    items = result.body;
  }

  void load();
</script>

<PageHeader level={2} title="页面" description="这一空间里的页面。" />

{#if failure}
  <div role="alert" class="flex flex-wrap items-center gap-3 text-sm text-ink">
    <p>{pagesFailureMessage(failure)}</p>
    <Button variant="quiet" onclick={() => void load()}>重试</Button>
  </div>
{:else if items === null}
  <p class="text-sm text-muted">正在载入页面。</p>
{:else if items.length === 0}
  <EmptyState title="没有数据" description="导入完成的页面会出现在这里。" />
{:else}
  <ul aria-label="页面" class="flex flex-col gap-2 text-sm text-ink">
    {#each items as item (item.id)}
      <li class="rounded-nav border border-line bg-surface px-3 py-2">{item.title}</li>
    {/each}
  </ul>
{/if}

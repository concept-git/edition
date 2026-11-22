<script lang="ts">
  import { onDestroy, untrack, type Snippet } from 'svelte';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import Button from '#lib/shared/ui/Button.svelte';
  import { resolveTenant, viewSpace } from '../data/http-spaces';
  import type { SpaceDetail } from '../domain/space';
  import { queryFailureMessage } from './messages';

  let { spaceId, children }: { spaceId: string; children: Snippet<[SpaceDetail]> } = $props();
  const session = getSession();
  let view = $state<SpaceDetail | null>(null);
  let message = $state('');
  let generation = 0;

  async function load(id: string) {
    const request = ++generation;
    view = null;
    message = '';
    const token = session.accessToken;
    if (!token) {
      message = '空间没有载入。';
      return;
    }
    const tenant = await resolveTenant(token);
    if (request !== generation) return;
    if (!tenant.ok) {
      message = queryFailureMessage(tenant.failure);
      return;
    }
    const result = await viewSpace(token, tenant.body, id);
    if (request !== generation) return;
    if (!result.ok) {
      message = queryFailureMessage(result.failure);
      return;
    }
    view = result.body;
  }

  onDestroy(() => {
    generation += 1;
  });

  void load(untrack(() => spaceId));
</script>

{#if view}
  {@render children(view)}
{:else if message}
  <div role="alert" class="flex flex-wrap items-center gap-3 text-sm text-ink">
    <p>{message}</p>
    <Button variant="quiet" onclick={() => void load(spaceId)}>重试</Button>
  </div>
{:else}
  <p class="text-sm text-muted">正在载入空间。</p>
{/if}

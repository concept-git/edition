<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { ApiFailure } from '#lib/shared/api/client';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import Button from '#lib/shared/ui/Button.svelte';
  import { loadRollouts, resolveTenant } from '../data/http-delivery';
  import { adopt, rolloutLabel, type SiteRollout } from '../domain/delivery';
  import { canRetry, loadFailureMessage } from './messages';

  let { spaceId }: { spaceId: string } = $props();
  const session = getSession();
  const budget = 4;

  let rollouts = $state.raw<SiteRollout[] | null>(null);
  let failure = $state<ApiFailure | null>(null);
  let alive = true;
  let generation = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const message = $derived(failure ? loadFailureMessage(failure) : '');
  const retryable = $derived(failure !== null && canRetry(failure));

  onDestroy(() => {
    alive = false;
    generation += 1;
    clearTimeout(timer);
  });

  async function load() {
    const watch = ++generation;
    clearTimeout(timer);
    failure = null;
    const token = session.accessToken;
    if (!token) {
      failure = { status: 0, code: null, traceId: null, retryAfter: null };
      return;
    }
    const tenant = await resolveTenant(token);
    if (!alive || watch !== generation) return;
    if (!tenant.ok) {
      failure = tenant.failure;
      return;
    }
    const listed = await loadRollouts(token, tenant.body, spaceId);
    if (!alive || watch !== generation) return;
    if (!listed.ok) {
      failure = listed.failure;
      return;
    }
    rollouts = listed.body;
    await follow(token, tenant.body, watch);
  }

  async function follow(token: string, tenantId: string, watch: number) {
    let rounds = 0;
    while (alive && watch === generation && rounds < budget && (rollouts ?? []).some((item) => !item.terminal)) {
      const waiting = (rollouts ?? []).filter((item) => !item.terminal);
      const seconds = Math.max(...waiting.map((item) => item.nextPollAfterSeconds));
      const keepGoing = await pause(Math.max(0, seconds) * 1000, watch);
      if (!keepGoing || watch !== generation) return;
      const next = await loadRollouts(token, tenantId, spaceId);
      if (!alive || watch !== generation) return;
      if (!next.ok) {
        failure = next.failure;
        return;
      }
      const prior = rollouts ?? [];
      rollouts = next.body.map((item) => adopt(prior.find((row) => row.siteId === item.siteId) ?? null, item));
      rounds += 1;
    }
  }

  function pause(ms: number, watch: number) {
    return new Promise<boolean>((resolve) => {
      timer = setTimeout(() => resolve(alive && watch === generation), ms);
    });
  }

  void load();
</script>

{#if failure || (rollouts && rollouts.length > 0)}
  <section aria-label="逐站交付" class="mt-8 max-w-md">
    <h3 class="text-sm font-medium text-ink">逐站交付</h3>
    <p class="mt-1 text-sm text-muted">主版本选定之后，这里是每个挂载站点的实际上线进度。</p>
    {#if rollouts && rollouts.length > 0}
      <ul aria-label="上线进度" class="mt-4 flex flex-col gap-2">
        {#each rollouts as rollout (rollout.siteId)}
          <li class="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface px-3 py-2 text-sm">
            <span class="text-ink">{rollout.name}</span>
            <span class="text-ink">{rolloutLabel(rollout)}</span>
          </li>
        {/each}
      </ul>
    {/if}
    {#if message}
      <div role="alert" class="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink">
        <p>{message}</p>
        {#if retryable}
          <Button variant="quiet" onclick={() => void load()}>重试</Button>
        {/if}
      </div>
    {/if}
  </section>
{/if}

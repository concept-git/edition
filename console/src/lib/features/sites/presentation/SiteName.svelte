<script lang="ts">
  import type { ApiFailure } from '#lib/shared/api/client';
  import Button from '#lib/shared/ui/Button.svelte';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import { currentTenant, loadSite } from '../data/sites-api';
  import { queryFailureMessage } from '../domain/sites';

  let { siteId }: { siteId: string } = $props();
  const session = getSession();
  let loadedName = $state<string | null>(null);
  let failure = $state<ApiFailure | null>(null);
  let attempt = $state(0);

  $effect(() => {
    const id = siteId;
    const generation = attempt;
    if (id === 'example') return;
    let alive = true;
    loadedName = null;
    failure = null;
    void (async () => {
      const token = session.accessToken;
      if (!token) {
        if (alive) failure = { status: 0, code: null, traceId: null, retryAfter: null };
        return;
      }
      const tenant = await currentTenant(token);
      if (!alive || generation !== attempt) return;
      if (!tenant.ok) {
        failure = tenant.failure;
        return;
      }
      const site = await loadSite(token, tenant.body, id);
      if (!alive || generation !== attempt) return;
      if (!site.ok) {
        failure = site.failure;
        return;
      }
      loadedName = site.body.name;
    })();
    return () => {
      alive = false;
    };
  });
</script>

{#if siteId === 'example'}
  <h1 class="mt-1 text-xl font-semibold text-ink">示例站点</h1>
{:else if failure}
  <div role="alert" class="mt-1 flex flex-wrap items-center gap-3 text-sm text-ink">
    <p>{queryFailureMessage(failure)}</p>
    <Button variant="quiet" onclick={() => (attempt += 1)}>重试</Button>
  </div>
{:else if loadedName}
  <h1 class="mt-1 text-xl font-semibold text-ink">{loadedName}</h1>
{:else}
  <p class="mt-1 text-sm text-muted">正在读取。</p>
{/if}

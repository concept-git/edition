<script lang="ts">
  import LoadingNote from '#lib/shared/ui/LoadingNote.svelte';
  import Notice from '#lib/shared/ui/Notice.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import { isSample } from '#lib/shared/ui/sample';
  import { currentTenant, loadSite } from '../data/sites-api';
  import { queryFailureMessage } from '../domain/sites';

  let { siteId }: { siteId: string } = $props();
  const session = getSession();
  let attempt = $state(0);
  const request = $derived.by(() => {
    const id = siteId;
    const generation = attempt;
    if (isSample(id)) return Promise.resolve({ kind: 'sample' as const });
    const token = session.accessToken;
    if (!token) return Promise.resolve({ kind: 'error' as const, failure: { status: 0, code: null, traceId: null, retryAfter: null } });
    return loadName(token, id, generation);
  });

  async function loadName(token: string, id: string, generation: number) {
    const tenant = await currentTenant(token);
    if (generation !== attempt) return { kind: 'stale' as const };
    if (!tenant.ok) return { kind: 'error' as const, failure: tenant.failure };
    const site = await loadSite(token, tenant.body, id);
    if (generation !== attempt) return { kind: 'stale' as const };
    if (!site.ok) return { kind: 'error' as const, failure: site.failure };
    return { kind: 'ready' as const, name: site.body.name };
  }
</script>

{#await request}
  <LoadingNote />
{:then result}
  {#if result.kind === 'sample'}
    <PageHeader title="示例站点" />
  {:else if result.kind === 'error'}
    <Notice text={queryFailureMessage(result.failure)} onRetry={() => (attempt += 1)} />
  {:else if result.kind === 'ready'}
    <PageHeader title={result.name} />
  {:else}
    <LoadingNote />
  {/if}
{/await}

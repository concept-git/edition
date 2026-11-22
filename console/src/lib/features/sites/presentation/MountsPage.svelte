<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { ApiFailure } from '#lib/shared/api/client';
  import Button from '#lib/shared/ui/Button.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import TextField from '#lib/shared/ui/TextField.svelte';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import { currentTenant, loadSite, loadSpaces, mountSpace } from '../data/sites-api';
  import { IntentKey, queryFailureMessage, writeFailureMessage, type SiteView, type SpaceChoice } from '../domain/sites';

  let { siteId }: { siteId: string } = $props();
  const session = getSession();
  const intent = new IntentKey();
  let site = $state<SiteView | null>(null);
  let spaces = $state<SpaceChoice[] | null>(null);
  let selectedSpaceId = $state('');
  let slug = $state('');
  let pending = $state(false);
  let queryFailure = $state<ApiFailure | null>(null);
  let mountFailure = $state<ApiFailure | null>(null);
  let alive = true;

  onDestroy(() => {
    alive = false;
  });

  const spaceName = $derived.by(() => {
    const names = new Map((spaces ?? []).map((space) => [space.id, space.name]));
    return (id: string) => names.get(id) ?? id;
  });

  async function load() {
    const token = session.accessToken;
    if (!token) {
      queryFailure = { status: 0, code: null, traceId: null, retryAfter: null };
      return;
    }
    const tenant = await currentTenant(token);
    if (!alive) return;
    if (!tenant.ok) {
      queryFailure = tenant.failure;
      return;
    }
    const [siteResult, spaceResult] = await Promise.all([
      loadSite(token, tenant.body, siteId),
      loadSpaces(token, tenant.body)
    ]);
    if (!alive) return;
    if (!siteResult.ok) {
      queryFailure = siteResult.failure;
      return;
    }
    if (!spaceResult.ok) {
      queryFailure = spaceResult.failure;
      return;
    }
    queryFailure = null;
    site = siteResult.body;
    spaces = spaceResult.body;
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    const token = session.accessToken;
    if (!token || pending || selectedSpaceId === '') return;
    pending = true;
    mountFailure = null;
    const tenant = await currentTenant(token);
    if (!alive) return;
    if (!tenant.ok) {
      mountFailure = tenant.failure;
      pending = false;
      return;
    }
    const key = intent.take(`${siteId}\n${selectedSpaceId}\n${slug}`);
    const mounted = await mountSpace(token, tenant.body, siteId, slug, selectedSpaceId, key);
    if (!alive) return;
    pending = false;
    if (!mounted.ok) {
      mountFailure = mounted.failure;
      return;
    }
    intent.finish();
    slug = '';
    site = mounted.body;
  }

  void load();
</script>

<PageHeader level={2} title="挂载" description="把空间挂到一个 slug。身份引用仍用稳定 id。" />

{#if queryFailure}
  <div role="alert" class="flex flex-wrap items-center gap-3 text-sm text-ink">
    <p>{queryFailureMessage(queryFailure)}</p>
    <Button variant="quiet" onclick={() => void load()}>重试</Button>
  </div>
{:else if site && spaces}
  {#if site.mounts.length === 0}
    <EmptyState title="没有数据" description="选择一个空间并写上 slug。" />
  {:else}
    <ul aria-label="已挂载" class="mb-6 flex flex-col gap-2 text-sm text-ink">
      {#each site.mounts as mount (mount.slug)}
        <li class="flex gap-3">
          <span>{spaceName(mount.spaceId)}</span>
          <span>{mount.slug}</span>
        </li>
      {/each}
    </ul>
  {/if}
  {#if site.canMount}
    <form aria-label="挂载" class="flex max-w-md flex-col gap-3" onsubmit={submit}>
      <div role="radiogroup" aria-label="空间" class="flex flex-wrap gap-2">
        {#each spaces as space (space.id)}
          <Button type="button" variant={selectedSpaceId === space.id ? 'primary' : 'quiet'} onclick={() => (selectedSpaceId = space.id)}>
            {space.name}
          </Button>
        {/each}
      </div>
      <TextField label="slug" name="slug" required disabled={pending} bind:value={slug} />
      {#if mountFailure}
        <p role="alert" class="text-sm text-ink">{writeFailureMessage(mountFailure)}</p>
      {/if}
      <div>
        <Button type="submit" disabled={pending || selectedSpaceId === ''}>挂载</Button>
      </div>
    </form>
  {/if}
{/if}

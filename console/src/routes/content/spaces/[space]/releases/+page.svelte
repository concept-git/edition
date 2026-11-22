<script lang="ts">
  import { page } from '$app/state';
  import SpaceSection from '#lib/features/content/presentation/SpaceSection.svelte';
  import DeliveryRollout from '#lib/features/delivery/presentation/DeliveryRollout.svelte';
  import ReleasesPage from '#lib/features/releases/presentation/ReleasesPage.svelte';

  const spaceId = $derived(page.params.space ?? '');
  let liveId = $state<string | null>(null);
</script>

{#if spaceId === 'example'}
  <SpaceSection view="releases" />
{:else}
  <ReleasesPage {spaceId} onLive={(releaseId) => (liveId = releaseId)} />
  {#if liveId}
    {#key `${spaceId}:${liveId}`}
      <DeliveryRollout {spaceId} />
    {/key}
  {/if}
{/if}

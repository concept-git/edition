<script lang="ts">
  import { page } from '$app/state';
  import SpaceSection from '#lib/features/content/presentation/SpaceSection.svelte';
  import DeliveryRollout from '#lib/features/delivery/presentation/DeliveryRollout.svelte';
  import ReleasesPage from '#lib/features/releases/presentation/ReleasesPage.svelte';
  import SampleSwitch from '#lib/shared/ui/SampleSwitch.svelte';

  const spaceId = $derived(page.params.space ?? '');
  let liveId = $state<string | null>(null);
</script>

<SampleSwitch id={spaceId}>
  {#snippet sample()}
    <SpaceSection view="releases" />
  {/snippet}
  {#snippet real()}
    <ReleasesPage {spaceId} onLive={(releaseId) => (liveId = releaseId)} />
    {#if liveId}
      {#key `${spaceId}:${liveId}`}
        <DeliveryRollout {spaceId} />
      {/key}
    {/if}
  {/snippet}
</SampleSwitch>

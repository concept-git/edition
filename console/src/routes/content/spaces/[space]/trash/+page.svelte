<script lang="ts">
  import { page } from '$app/state';
  import SpaceSection from '#lib/features/content/presentation/SpaceSection.svelte';
  import TrashPage from '#lib/features/recovery/presentation/TrashPage.svelte';
  import SampleSwitch from '#lib/shared/ui/SampleSwitch.svelte';

  const spaceId = $derived(page.params.space ?? '');
</script>

<SampleSwitch id={spaceId}>
  {#snippet sample()}
    <SpaceSection view="trash" />
  {/snippet}
  {#snippet real()}
    <TrashPage {spaceId} />
  {/snippet}
</SampleSwitch>

<script lang="ts">
  import { page } from '$app/state';
  import SpaceSection from '#lib/features/content/presentation/SpaceSection.svelte';
  import TocPage from '#lib/features/toc/presentation/TocPage.svelte';
  import SampleSwitch from '#lib/shared/ui/SampleSwitch.svelte';

  const spaceId = $derived(page.params.space ?? '');
</script>

<SampleSwitch id={spaceId}>
  {#snippet sample()}
    <SpaceSection view="toc" />
  {/snippet}
  {#snippet real()}
    <TocPage {spaceId} />
  {/snippet}
</SampleSwitch>

<script lang="ts">
  import { page } from '$app/state';
  import SpaceSection from '#lib/features/content/presentation/SpaceSection.svelte';
  import ImportsPage from '#lib/features/imports/presentation/ImportsPage.svelte';
  import SampleSwitch from '#lib/shared/ui/SampleSwitch.svelte';

  const spaceId = $derived(page.params.space ?? '');
</script>

<SampleSwitch id={spaceId}>
  {#snippet sample()}
    <SpaceSection view="imports" />
  {/snippet}
  {#snippet real()}
    <ImportsPage {spaceId} />
  {/snippet}
</SampleSwitch>

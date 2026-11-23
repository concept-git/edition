<script lang="ts">
  import { page } from '$app/state';
  import MountsPage from '#lib/features/sites/presentation/MountsPage.svelte';
  import SiteSection from '#lib/features/sites/presentation/SiteSection.svelte';
  import SampleSwitch from '#lib/shared/ui/SampleSwitch.svelte';

  const siteId = $derived(page.params.site ?? '');
</script>

{#key siteId}
  <SampleSwitch id={siteId}>
    {#snippet sample()}
      <SiteSection view="mounts" />
    {/snippet}
    {#snippet real()}
      <MountsPage {siteId} />
    {/snippet}
  </SampleSwitch>
{/key}

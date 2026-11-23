<script lang="ts">
  import { page } from '$app/state';
  import SearchFieldsPage from '#lib/features/sites/presentation/SearchFieldsPage.svelte';
  import SiteSection from '#lib/features/sites/presentation/SiteSection.svelte';
  import SampleSwitch from '#lib/shared/ui/SampleSwitch.svelte';

  const siteId = $derived(page.params.site ?? '');
</script>

{#key siteId}
  <SampleSwitch id={siteId}>
    {#snippet sample()}
      <SiteSection view="search" />
    {/snippet}
    {#snippet real()}
      <SearchFieldsPage {siteId} />
    {/snippet}
  </SampleSwitch>
{/key}

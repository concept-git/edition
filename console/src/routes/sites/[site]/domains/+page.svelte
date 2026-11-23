<script lang="ts">
  import { page } from '$app/state';
  import DomainsPage from '#lib/features/domains/presentation/DomainsPage.svelte';
  import SiteSection from '#lib/features/sites/presentation/SiteSection.svelte';
  import SampleSwitch from '#lib/shared/ui/SampleSwitch.svelte';

  const siteId = $derived(page.params.site ?? '');
</script>

{#key siteId}
  <SampleSwitch id={siteId}>
    {#snippet sample()}
      <SiteSection view="domains" />
    {/snippet}
    {#snippet real()}
      <DomainsPage {siteId} />
    {/snippet}
  </SampleSwitch>
{/key}

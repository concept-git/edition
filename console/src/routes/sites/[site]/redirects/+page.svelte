<script lang="ts">
  import { page } from '$app/state';
  import RedirectsPage from '#lib/features/redirects/presentation/RedirectsPage.svelte';
  import SiteSection from '#lib/features/sites/presentation/SiteSection.svelte';
  import SampleSwitch from '#lib/shared/ui/SampleSwitch.svelte';

  const siteId = $derived(page.params.site ?? '');
</script>

{#key siteId}
  <SampleSwitch id={siteId}>
    {#snippet sample()}
      <SiteSection view="redirects" />
    {/snippet}
    {#snippet real()}
      <RedirectsPage {siteId} />
    {/snippet}
  </SampleSwitch>
{/key}

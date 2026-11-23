<script lang="ts">
  import { page } from '$app/state';
  import WebhooksPage from '#lib/features/webhooks/presentation/WebhooksPage.svelte';
  import SiteSection from '#lib/features/sites/presentation/SiteSection.svelte';
  import SampleSwitch from '#lib/shared/ui/SampleSwitch.svelte';

  const siteId = $derived(page.params.site ?? '');
</script>

{#key siteId}
  <SampleSwitch id={siteId}>
    {#snippet sample()}
      <SiteSection view="webhooks" />
    {/snippet}
    {#snippet real()}
      <WebhooksPage {siteId} />
    {/snippet}
  </SampleSwitch>
{/key}

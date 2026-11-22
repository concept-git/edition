<script lang="ts">
  import { page } from '$app/state';
  import WebhooksPage from '#lib/features/webhooks/presentation/WebhooksPage.svelte';
  import SiteSection from '#lib/features/sites/presentation/SiteSection.svelte';

  const siteId = $derived(page.params.site ?? '');
</script>

{#key siteId}
  {#if siteId === 'example'}
    <SiteSection view="webhooks" />
  {:else}
    <WebhooksPage {siteId} />
  {/if}
{/key}

<script lang="ts">
  import { page } from '$app/state';
  import RedirectsPage from '#lib/features/redirects/presentation/RedirectsPage.svelte';
  import SiteSection from '#lib/features/sites/presentation/SiteSection.svelte';

  const siteId = $derived(page.params.site ?? '');
</script>

{#key siteId}
  {#if siteId === 'example'}
    <SiteSection view="redirects" />
  {:else}
    <RedirectsPage {siteId} />
  {/if}
{/key}

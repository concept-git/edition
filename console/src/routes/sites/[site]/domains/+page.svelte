<script lang="ts">
  import { page } from '$app/state';
  import DomainsPage from '#lib/features/domains/presentation/DomainsPage.svelte';
  import SiteSection from '#lib/features/sites/presentation/SiteSection.svelte';

  const siteId = $derived(page.params.site ?? '');
</script>

{#key siteId}
  {#if siteId === 'example'}
    <SiteSection view="domains" />
  {:else}
    <DomainsPage {siteId} />
  {/if}
{/key}

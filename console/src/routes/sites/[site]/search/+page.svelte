<script lang="ts">
  import { page } from '$app/state';
  import SearchFieldsPage from '#lib/features/sites/presentation/SearchFieldsPage.svelte';
  import SiteSection from '#lib/features/sites/presentation/SiteSection.svelte';

  const siteId = $derived(page.params.site ?? '');
</script>

{#key siteId}
  {#if siteId === 'example'}
    <SiteSection view="search" />
  {:else}
    <SearchFieldsPage {siteId} />
  {/if}
{/key}

<script lang="ts">
  import { page } from '$app/state';
  import MountsPage from '#lib/features/sites/presentation/MountsPage.svelte';
  import SiteSection from '#lib/features/sites/presentation/SiteSection.svelte';

  const siteId = $derived(page.params.site ?? '');
</script>

{#key siteId}
  {#if siteId === 'example'}
    <SiteSection view="mounts" />
  {:else}
    <MountsPage {siteId} />
  {/if}
{/key}

<script lang="ts">
  import { page } from '$app/state';
  import SpaceSection from '#lib/features/content/presentation/SpaceSection.svelte';
  import ReleasesPage from '#lib/features/releases/presentation/ReleasesPage.svelte';

  const spaceId = $derived(page.params.space ?? '');
</script>

{#if spaceId === 'example'}
  <SpaceSection view="releases" />
{:else}
  <ReleasesPage {spaceId} />
{/if}

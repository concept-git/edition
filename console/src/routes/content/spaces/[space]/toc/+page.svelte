<script lang="ts">
  import { page } from '$app/state';
  import SpaceSection from '#lib/features/content/presentation/SpaceSection.svelte';
  import TocPage from '#lib/features/toc/presentation/TocPage.svelte';

  const spaceId = $derived(page.params.space ?? '');
</script>

{#if spaceId === 'example'}
  <SpaceSection view="toc" />
{:else}
  <TocPage {spaceId} />
{/if}

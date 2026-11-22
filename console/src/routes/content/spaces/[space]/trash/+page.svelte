<script lang="ts">
  import { page } from '$app/state';
  import SpaceSection from '#lib/features/content/presentation/SpaceSection.svelte';
  import TrashPage from '#lib/features/recovery/presentation/TrashPage.svelte';

  const spaceId = $derived(page.params.space ?? '');
</script>

{#if spaceId === 'example'}
  <SpaceSection view="trash" />
{:else}
  <TrashPage {spaceId} />
{/if}

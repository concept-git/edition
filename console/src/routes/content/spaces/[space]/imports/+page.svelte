<script lang="ts">
  import { page } from '$app/state';
  import SpaceSection from '#lib/features/content/presentation/SpaceSection.svelte';
  import ImportsPage from '#lib/features/imports/presentation/ImportsPage.svelte';

  const spaceId = $derived(page.params.space ?? '');
</script>

{#if spaceId === 'example'}
  <SpaceSection view="imports" />
{:else}
  <ImportsPage {spaceId} />
{/if}

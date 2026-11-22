<script lang="ts">
  import { page } from '$app/state';
  import AuthorPages from '#lib/features/content-types/presentation/AuthorPages.svelte';
  import SpaceSection from '#lib/features/content/presentation/SpaceSection.svelte';

  const spaceId = $derived(page.params.space ?? '');
</script>

{#if spaceId === 'example'}
  <SpaceSection view="pages" />
{:else}
  <AuthorPages {spaceId} />
{/if}

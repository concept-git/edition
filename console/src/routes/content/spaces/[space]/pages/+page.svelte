<script lang="ts">
  import { page } from '$app/state';
  import AuthorPages from '#lib/features/content-types/presentation/AuthorPages.svelte';
  import SpaceSection from '#lib/features/content/presentation/SpaceSection.svelte';
  import PagesPage from '#lib/features/pages/presentation/PagesPage.svelte';

  const spaceId = $derived(page.params.space ?? '');
</script>

{#if spaceId === 'example'}
  <SpaceSection view="pages" />
{:else}
  <PagesPage {spaceId} />
  <AuthorPages {spaceId} />
{/if}

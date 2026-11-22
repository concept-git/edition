<script lang="ts">
  import { page } from '$app/state';
  import PageRestriction from '#lib/features/permissions/presentation/PageRestriction.svelte';

  const spaceId = $derived(page.params.space ?? '');
  const pageId = $derived(page.params.pageId ?? '');
</script>

<PageRestriction {spaceId} {pageId} />

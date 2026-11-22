<script lang="ts">
  import { page } from '$app/state';
  import TagsPage from '#lib/features/tags/presentation/TagsPage.svelte';
</script>

<TagsPage spaceId={page.params.space} />

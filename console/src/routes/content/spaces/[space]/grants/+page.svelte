<script lang="ts">
  import { page } from '$app/state';
  import ResourceGrants from '#lib/features/permissions/presentation/ResourceGrants.svelte';

  const spaceId = $derived(page.params.space ?? '');
</script>

<ResourceGrants kind="spaces" resourceId={spaceId} />

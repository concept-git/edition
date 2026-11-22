<script lang="ts">
  import { page } from '$app/state';
  import ResourceGrants from '#lib/features/permissions/presentation/ResourceGrants.svelte';

  const siteId = $derived(page.params.site ?? '');
</script>

<ResourceGrants kind="sites" resourceId={siteId} />

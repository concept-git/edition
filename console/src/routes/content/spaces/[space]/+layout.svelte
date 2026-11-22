<script lang="ts">
  import SpaceFrame from '#lib/features/content/presentation/SpaceFrame.svelte';

  let { data, children } = $props();
</script>

<SpaceFrame spaceId={data.spaceId}>
  {@render children()}
</SpaceFrame>

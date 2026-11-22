<script lang="ts">
  import SiteFrame from '#lib/features/sites/presentation/SiteFrame.svelte';

  let { data, children } = $props();
</script>

<SiteFrame siteId={data.siteId}>
  {@render children()}
</SiteFrame>

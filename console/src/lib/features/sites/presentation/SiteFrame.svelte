<script lang="ts">
  import type { Snippet } from 'svelte';
  import SiteName from './SiteName.svelte';

  let { siteId, children }: { siteId: string; children: Snippet } = $props();
</script>

<p class="text-xs text-muted">当前站点</p>
{#key siteId}
  <SiteName {siteId} />
{/key}
<div class="mt-6">
  {@render children()}
</div>

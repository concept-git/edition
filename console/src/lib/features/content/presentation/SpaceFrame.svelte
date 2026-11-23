<script lang="ts">
  import type { Snippet } from 'svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import { isSample } from '#lib/shared/ui/sample';

  let {
    spaceId,
    title = '',
    controls,
    children
  }: {
    spaceId: string;
    title?: string;
    controls?: Snippet;
    children: Snippet;
  } = $props();
  const heading = $derived(title || (isSample(spaceId) ? '示例空间' : spaceId));
</script>

<PageHeader title={heading} description="当前空间" />
{#if controls}
  {@render controls()}
{/if}
<div class="mt-6">
  {@render children()}
</div>

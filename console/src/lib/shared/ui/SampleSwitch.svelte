<script lang="ts">
  import type { Snippet } from 'svelte';
  import { isSample } from './sample';

  let { id, sample, real }: { id: string; sample: Snippet; real: Snippet } = $props();
</script>

{#if isSample(id)}
  {@render sample()}
{:else}
  {@render real()}
{/if}

<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    title,
    description,
    actions
  }: {
    title: string;
    description?: string;
    actions?: Snippet;
  } = $props();
</script>

<div class="max-w-md">
  <p class="text-sm font-medium text-ink">{title}</p>
  {#if description}
    <p class="mt-1 text-sm leading-6 text-muted">{description}</p>
  {/if}
  {#if actions}
    <div class="mt-4">
      {@render actions()}
    </div>
  {/if}
</div>

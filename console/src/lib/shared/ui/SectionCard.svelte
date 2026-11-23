<script lang="ts">
  import type { Snippet } from 'svelte';

  let { title, actions, children }: { title: string; actions?: Snippet; children: Snippet } = $props();
  const headingId = $props.id();
</script>

<section aria-labelledby={headingId} class="rounded-card border border-line bg-surface p-5 shadow-none">
  <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
    <h2 id={headingId} class="text-sm font-medium text-ink">{title}</h2>
    {#if actions}{@render actions()}{/if}
  </div>
  <div class="mt-4">
    {@render children()}
  </div>
</section>

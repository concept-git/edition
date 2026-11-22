<script lang="ts">
  import type { Snippet } from 'svelte';

  let { title, children }: { title: string; children: Snippet } = $props();
  const headingId = $props.id();
</script>

<section aria-labelledby={headingId} class="rounded-card border border-line bg-surface p-5">
  <h2 id={headingId} class="text-sm font-semibold text-ink">{title}</h2>
  <div class="mt-4">
    {@render children()}
  </div>
</section>

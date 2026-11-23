<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    label,
    columns,
    total,
    page = 1,
    rows
  }: {
    label: string;
    columns: string[];
    total: number;
    page?: number;
    rows: Snippet;
  } = $props();
</script>

<div>
  <table aria-label={label} class="w-full border-collapse text-left">
    <thead>
      <tr class="border-b border-line text-xs font-normal text-faint">
        {#each columns as column (column)}
          <th scope="col" class="px-3 py-3 font-normal">{column}</th>
        {/each}
      </tr>
    </thead>
    <tbody class="text-sm font-normal text-ink">
      {@render rows()}
    </tbody>
  </table>
  <div class="flex items-center justify-between px-3 py-3">
    <p class="text-xs text-faint">共 {total} 条</p>
    <span class="inline-flex h-7 min-w-7 items-center justify-center rounded-nav bg-accent px-2 text-xs text-white" aria-current="page">{page}</span>
  </div>
</div>

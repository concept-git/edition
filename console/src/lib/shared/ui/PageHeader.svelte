<script lang="ts">
  let { title, description, level = 1 }: { title: string; description?: string; level?: 1 | 2 } = $props();
</script>

<header class={level === 1 ? 'mb-6' : 'mb-3'}>
  {#if level === 1}
    <h1 class="text-base leading-6 font-medium text-ink">{title}</h1>
  {:else}
    <h2 class="text-sm font-medium text-ink">{title}</h2>
  {/if}
  {#if description}
    <p class="mt-1 text-xs leading-5 font-normal text-faint">{description}</p>
  {/if}
</header>

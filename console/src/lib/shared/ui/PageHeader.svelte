<script lang="ts">
  let { title, description, level = 1 }: { title: string; description?: string; level?: 1 | 2 } = $props();
</script>

<header class={level === 1 ? 'mb-5' : 'mb-3'}>
  {#if level === 1}
    <h1 class="text-xl font-semibold text-ink">{title}</h1>
  {:else}
    <h2 class="text-base font-medium text-ink">{title}</h2>
  {/if}
  {#if description}
    <p class="mt-1 text-[13px] leading-5 text-muted">{description}</p>
  {/if}
</header>

<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    href,
    label,
    active = false,
    layout = 'stack',
    onSelect,
    icon
  }: {
    href: string;
    label: string;
    active?: boolean;
    layout?: 'stack' | 'rail' | 'row';
    onSelect?: () => void;
    icon?: Snippet;
  } = $props();

  const classes = $derived(
    layout === 'rail'
      ? `relative flex h-10 w-10 items-center justify-center rounded-nav ${active ? 'bg-mint text-accent' : 'text-muted'}`
      : layout === 'row'
        ? `inline-flex h-8 items-center rounded-nav px-3 text-sm ${active ? 'bg-mint text-accent' : 'text-ink'}`
        : `flex min-h-9 items-center gap-2 rounded-nav px-2.5 text-sm ${active ? 'bg-mint text-accent' : 'text-ink'}`
  );
</script>

<a
  {href}
  aria-current={active ? 'page' : undefined}
  class={classes}
  onclick={() => onSelect?.()}
>
  {#if icon}
    {@render icon()}
  {/if}
  {#if layout === 'rail'}
    <span class="sr-only">{label}</span>
  {:else}
    <span>{label}</span>
  {/if}
</a>

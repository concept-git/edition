<script lang="ts">
  import { Button } from 'bits-ui';
  import type { Snippet } from 'svelte';

  let {
    href,
    type = 'button',
    variant = 'primary',
    children,
    onclick
  }: {
    href?: string;
    type?: 'button' | 'submit';
    variant?: 'primary' | 'quiet';
    children: Snippet;
    onclick?: (event: MouseEvent) => void;
  } = $props();

  const classes = $derived(
    variant === 'primary'
      ? 'inline-flex h-8 items-center rounded-full bg-accent px-4 text-sm text-white'
      : 'inline-flex h-8 items-center rounded-full px-2 text-sm text-accent'
  );
</script>

{#if href}
  <Button.Root {href} class={classes} {onclick}>
    {@render children()}
  </Button.Root>
{:else}
  <Button.Root {type} class={classes} {onclick}>
    {@render children()}
  </Button.Root>
{/if}

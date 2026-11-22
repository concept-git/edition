<script lang="ts">
  import { Button } from 'bits-ui';
  import type { Snippet } from 'svelte';

  let {
    href,
    type = 'button',
    variant = 'primary',
    disabled = false,
    children,
    onclick
  }: {
    href?: string;
    type?: 'button' | 'submit';
    variant?: 'primary' | 'quiet' | 'danger';
    disabled?: boolean;
    children: Snippet;
    onclick?: (event: MouseEvent) => void;
  } = $props();

  const classes = $derived(
    variant === 'quiet'
      ? 'inline-flex h-8 items-center rounded-full px-2 text-sm text-accent disabled:opacity-60'
      : variant === 'danger'
        ? 'inline-flex h-8 items-center rounded-full bg-danger px-4 text-sm text-white disabled:opacity-60'
        : 'inline-flex h-8 items-center rounded-full bg-accent px-4 text-sm text-white disabled:opacity-60'
  );
</script>

{#if href}
  <Button.Root {href} class={classes} {disabled} {onclick}>
    {@render children()}
  </Button.Root>
{:else}
  <Button.Root {type} class={classes} {disabled} {onclick}>
    {@render children()}
  </Button.Root>
{/if}

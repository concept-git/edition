<script lang="ts">
  import { Button } from 'bits-ui';
  import type { Snippet } from 'svelte';

  let {
    href,
    type = 'button',
    variant = 'primary',
    wide = false,
    disabled = false,
    children,
    onclick
  }: {
    href?: string;
    type?: 'button' | 'submit';
    /** primary 绿实心是创建、邀请、查询。ink 黑实心只保存。quiet 绿字是取消、返回、重试。danger-quiet 红字是行内移除。danger 红实心是确认危险。文字 2～5 个，以 4 个为好。 */
    variant?: 'primary' | 'quiet' | 'danger' | 'danger-quiet' | 'ink';
    /** 拉满所在行。登录这类单列主动作用。 */
    wide?: boolean;
    disabled?: boolean;
    children: Snippet;
    onclick?: (event: MouseEvent) => void;
  } = $props();

  const quiet = $derived(variant === 'quiet' || variant === 'danger-quiet');
  const classes = $derived(
    `inline-flex items-center justify-center rounded-nav text-sm font-normal disabled:pointer-events-none disabled:opacity-60 ${
      quiet ? 'h-auto px-0' : wide ? 'h-10 w-full px-4' : 'h-8 px-4'
    } ${
      variant === 'danger'
        ? 'bg-danger text-white hover:bg-danger-press active:bg-danger-press'
        : variant === 'danger-quiet'
          ? 'text-danger hover:text-danger-press'
          : variant === 'quiet'
            ? 'text-accent hover:text-accent-press'
            : variant === 'ink'
              ? 'bg-ink text-white hover:opacity-90'
              : 'bg-accent text-white hover:bg-accent-press active:bg-accent-press'
    }`
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

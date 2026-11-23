<script lang="ts">
  import Icon from '#lib/shared/ui/Icon.svelte';
  import type { Snippet } from 'svelte';

  let {
    href,
    label,
    active = false,
    layout = 'stack',
    chevron = false,
    nested = false,
    onSelect,
    icon
  }: {
    href: string;
    label: string;
    active?: boolean;
    layout?: 'stack' | 'rail' | 'row';
    chevron?: boolean;
    nested?: boolean;
    onSelect?: () => void;
    icon?: Snippet;
  } = $props();

  const tone = $derived(active ? 'bg-mint font-medium text-accent' : 'font-normal text-ink hover:bg-chip');
  const classes = $derived(
    layout === 'rail'
      ? `relative flex h-9 w-full items-center gap-2 rounded-[10px] px-2.5 text-sm md:w-9 md:justify-center md:px-0 ${active ? 'bg-mint font-medium text-accent' : 'font-normal text-ink hover:bg-chip md:text-muted md:hover:text-ink'}`
      : layout === 'row'
        ? `inline-flex h-9 min-w-0 items-center rounded-nav px-3 text-sm ${tone}`
        : `flex h-9 items-center gap-2 rounded-nav px-2.5 text-sm ${tone}`
  );
</script>

<a
  {href}
  aria-current={active ? 'page' : undefined}
  title={layout === 'rail' ? label : undefined}
  class={classes}
  onclick={() => onSelect?.()}
>
  {#if nested}
    <span class="h-1 w-1 shrink-0 rounded-full bg-current opacity-60" aria-hidden="true"></span>
  {/if}
  {#if icon}
    {@render icon()}
  {/if}
  <span class={layout === 'rail' ? 'min-w-0 truncate md:sr-only' : 'min-w-0 flex-1 truncate text-left'}>{label}</span>
  {#if chevron}
    <Icon name="chevron" class="text-faint" />
  {/if}
</a>

<script lang="ts">
  import Icon from '#lib/shared/ui/Icon.svelte';
  import NavItem from '#lib/shared/ui/NavItem.svelte';

  let {
    items,
    folded = false,
    onUnfold,
    onSelect
  }: {
    items: Array<{ href: string; label: string; icon: string; active: boolean; overview?: boolean }>;
    folded?: boolean;
    onUnfold?: () => void;
    onSelect: (overview: boolean) => void;
  } = $props();
</script>

<nav
  aria-label="模块"
  class="flex w-full shrink-0 flex-col gap-1 border-b border-line bg-surface px-3 py-4 md:h-full md:w-[64px] md:items-center md:gap-2 md:border-r md:border-b-0 md:px-0"
>
  {#each items as item (item.href)}
    <NavItem href={item.href} label={item.label} active={item.active} layout="rail" onSelect={() => onSelect(item.overview === true)}>
      {#snippet icon()}
        <Icon name={item.icon} />
      {/snippet}
    </NavItem>
  {/each}
  {#if folded}
    <button
      type="button"
      class="mt-auto hidden h-9 w-9 items-center justify-center rounded-[10px] text-faint hover:bg-chip hover:text-ink md:inline-flex"
      aria-label="展开分区"
      onclick={onUnfold}
    >
      <Icon name="chevron" />
    </button>
  {/if}
</nav>

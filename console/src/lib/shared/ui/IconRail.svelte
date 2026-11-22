<script lang="ts">
  import Icon from '#lib/shared/ui/Icon.svelte';
  import NavItem from '#lib/shared/ui/NavItem.svelte';

  let {
    items,
    onSelect
  }: {
    items: Array<{ href: string; label: string; icon: string; active: boolean; overview?: boolean }>;
    onSelect: (overview: boolean) => void;
  } = $props();
</script>

<nav aria-label="模块" class="flex w-[64px] shrink-0 flex-col items-center gap-1 border-r border-line bg-surface py-3">
  {#each items as item (item.href)}
    <NavItem href={item.href} label={item.label} active={item.active} layout="rail" onSelect={() => onSelect(item.overview === true)}>
      {#snippet icon()}
        <Icon name={item.icon} />
      {/snippet}
    </NavItem>
  {/each}
</nav>

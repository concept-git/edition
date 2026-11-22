<script lang="ts">
  import NavItem from '#lib/shared/ui/NavItem.svelte';

  let {
    items,
    onSelect
  }: {
    items: Array<{ href: string; label: string; active: boolean }>;
    onSelect: () => void;
  } = $props();
</script>

<nav aria-label="分区" class="flex w-[200px] shrink-0 flex-col gap-1 border-r border-line bg-surface px-2 py-3">
  {#each items as item (item.href)}
    <NavItem href={item.href} label={item.label} active={item.active} {onSelect} />
  {/each}
</nav>

<script lang="ts">
  import Icon from '#lib/shared/ui/Icon.svelte';
  import NavItem from '#lib/shared/ui/NavItem.svelte';

  let {
    label,
    icon,
    items,
    onSelect
  }: {
    label: string;
    icon: string;
    items: Array<{ href: string; label: string; active: boolean }>;
    onSelect: () => void;
  } = $props();

  let opened = $state(false);
  const shown = $derived(opened || items.some((item) => item.active));
</script>

<div>
  <button
    type="button"
    class="flex h-9 w-full items-center gap-2 rounded-nav px-2.5 text-sm font-normal text-ink hover:bg-chip"
    aria-expanded={shown}
    onclick={() => (opened = !shown)}
  >
    <Icon name={icon} />
    <span class="flex-1 text-left">{label}</span>
    <Icon name="chevron" class={`text-faint ${shown ? 'rotate-90' : ''}`} />
  </button>
  {#if shown}
    <div class="edition-rise flex flex-col gap-0.5 py-0.5 pl-6">
      {#each items as item (item.href)}
        <NavItem href={item.href} label={item.label} active={item.active} {onSelect} />
      {/each}
    </div>
  {/if}
</div>

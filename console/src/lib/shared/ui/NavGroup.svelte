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
    class="flex min-h-9 w-full items-center gap-2 rounded-nav px-2.5 text-sm text-ink"
    aria-expanded={shown}
    onclick={() => (opened = !shown)}
  >
    <Icon name={icon} />
    <span class="flex-1 text-left">{label}</span>
    <svg class="h-3.5 w-3.5 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </button>
  {#if shown}
    <div class="flex flex-col gap-0.5 py-0.5 pl-6">
      {#each items as item (item.href)}
        <NavItem href={item.href} label={item.label} active={item.active} {onSelect} />
      {/each}
    </div>
  {/if}
</div>

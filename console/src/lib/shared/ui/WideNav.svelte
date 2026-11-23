<script lang="ts">
  import Icon from '#lib/shared/ui/Icon.svelte';
  import NavGroup from '#lib/shared/ui/NavGroup.svelte';
  import NavItem from '#lib/shared/ui/NavItem.svelte';

  type Link = {
    href: string;
    label: string;
    icon?: string;
    active: boolean;
  };

  type Entry =
    | { kind: 'link'; id: string; link: Link }
    | { kind: 'group'; id: string; label: string; icon: string; items: Link[] };

  let {
    entries,
    products,
    onOverview,
    onModule
  }: {
    entries: Entry[];
    products: Link[];
    onOverview: () => void;
    onModule: () => void;
  } = $props();

</script>

<nav aria-label="租户" class="flex h-full w-full shrink-0 flex-col border-r border-line bg-surface md:w-[220px]">
  <div class="flex min-h-0 flex-1 flex-col gap-0.5 overflow-auto px-3 py-4">
    {#each entries as entry (entry.id)}
      {#if entry.kind === 'link'}
        <NavItem href={entry.link.href} label={entry.link.label} active={entry.link.active} onSelect={onOverview}>
          {#snippet icon()}
            <Icon name={entry.link.icon ?? 'overview'} />
          {/snippet}
        </NavItem>
      {:else}
        <NavGroup label={entry.label} icon={entry.icon} items={entry.items} onSelect={onOverview} />
      {/if}
    {/each}
  </div>
  <div class="flex flex-col gap-0.5 border-t border-line px-3 py-3">
    {#each products as item (item.href)}
      <NavItem href={item.href} label={item.label} active={item.active} chevron onSelect={onModule}>
        {#snippet icon()}
          <Icon name={item.icon ?? 'content'} />
        {/snippet}
      </NavItem>
    {/each}
  </div>
</nav>

<script lang="ts">
  import Icon from '#lib/shared/ui/Icon.svelte';
  import NavItem from '#lib/shared/ui/NavItem.svelte';
  import { pathActive, type SectionLink } from '#lib/features/shell/presentation/ia';

  let {
    items,
    pathname,
    title = '',
    folded = false,
    onFold,
    onSelect
  }: {
    items: SectionLink[];
    pathname: string;
    title?: string;
    folded?: boolean;
    onFold?: () => void;
    onSelect: () => void;
  } = $props();

  function active(item: SectionLink) {
    return pathActive(pathname, item.href, item.exact);
  }
</script>

<nav aria-label="分区" class="flex min-h-0 w-full flex-1 flex-col bg-surface md:h-full md:w-[220px] md:flex-none md:border-r md:border-line {folded ? 'md:hidden' : ''}">
  <div class="flex min-h-0 flex-1 flex-col overflow-auto px-3 py-4">
    {#if title}
      <p class="mb-2 px-2.5 text-sm leading-6 font-medium text-ink">{title}</p>
    {/if}
    <div class="flex flex-col gap-0.5">
      {#each items as item (item.href)}
        <NavItem href={item.href} label={item.label} active={active(item) && !item.children} {onSelect} />
        {#if item.children}
          <nav aria-label={item.children[0]?.group ?? item.label} class="mb-1 flex flex-col gap-0.5 pl-3">
            {#each item.children as child (child.href)}
              <NavItem href={child.href} label={child.label} active={active(child)} nested {onSelect} />
            {/each}
          </nav>
        {/if}
      {/each}
    </div>
  </div>
  <div class="hidden px-3 py-3 md:flex">
    <button
      type="button"
      class="inline-flex h-8 w-8 items-center justify-center rounded-nav text-faint hover:bg-chip hover:text-ink"
      aria-label="收起分区"
      onclick={onFold}
    >
      <Icon name="chevron" class="rotate-180" />
    </button>
  </div>
</nav>

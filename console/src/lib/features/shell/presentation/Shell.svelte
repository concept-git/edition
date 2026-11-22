<script lang="ts">
  import { beforeNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import type { Snippet } from 'svelte';
  import IconRail from '#lib/shared/ui/IconRail.svelte';
  import SectionNav from '#lib/shared/ui/SectionNav.svelte';
  import TopBar from '#lib/shared/ui/TopBar.svelte';
  import WideNav from '#lib/shared/ui/WideNav.svelte';
  import { moduleOf, overviewEntries, pathActive, productEntries, rail, sections, shellFor } from '#lib/features/shell/presentation/ia';
  import { shellEnter } from '#lib/features/shell/presentation/motion';
  import { getShellMode } from '#lib/features/shell/presentation/shell-mode.svelte';

  let { children }: { children: Snippet } = $props();
  const shell = getShellMode();
  const pathname = $derived(page.url.pathname);
  const kind = $derived(shellFor(pathname, shell.stickToModule));
  const module = $derived(moduleOf(pathname));
  const wideEntries = $derived(
    overviewEntries.map((entry) =>
      entry.kind === 'link'
        ? {
            kind: 'link' as const,
            id: entry.id,
            link: {
              href: entry.href,
              label: entry.label,
              icon: entry.icon,
              active: pathActive(pathname, entry.href, entry.exact)
            }
          }
        : {
            kind: 'group' as const,
            id: entry.id,
            label: entry.label,
            icon: entry.icon,
            items: entry.items.map((item) => ({
              href: item.href,
              label: item.label,
              active: pathActive(pathname, item.href, item.exact)
            }))
          }
    )
  );
  const products = $derived(
    productEntries.map((item) => ({
      href: item.href,
      label: item.label,
      icon: item.label === '内容' ? 'content' : 'sites',
      active: pathActive(pathname, item.href)
    }))
  );
  const railItems = $derived(
    rail.map((item) => ({
      href: item.href,
      label: item.label,
      icon: item.icon,
      overview: item.id === 'overview',
      active: module === item.id
    }))
  );
  const sectionItems = $derived(
    module && module !== 'overview'
      ? sections[module].map((item) => ({
          href: item.href,
          label: item.label,
          active: pathActive(pathname, item.href, 'exact' in item ? item.exact : false)
        }))
      : []
  );

  function chooseRail(overview: boolean) {
    if (overview) shell.preferOverview();
    else shell.preferModule();
  }

  beforeNavigate((navigation) => {
    const next = navigation.to?.url.pathname;
    const current = navigation.from?.url.pathname ?? page.url.pathname;
    if (!next) return;
    if (next === '/') {
      shell.preferOverview();
      return;
    }
    const stayingInModule = shellFor(current, shell.stickToModule) === 'module';
    if (shellFor(next, stayingInModule) === 'module') shell.preferModule();
    else shell.preferOverview();
  });
</script>

<div class="flex h-dvh flex-col bg-canvas font-sans text-ink">
  <TopBar onOverview={() => shell.preferOverview()} />
  {#if kind === 'overview'}
    <div class="flex min-h-0 flex-1" data-shell="overview" in:shellEnter|global>
      <WideNav entries={wideEntries} {products} onOverview={() => shell.preferOverview()} onModule={() => shell.preferModule()} />
      <main data-region="canvas" class="min-w-0 flex-1 overflow-auto bg-canvas px-6 py-5">
        {@render children()}
      </main>
    </div>
  {:else}
    <div class="flex min-h-0 flex-1" data-shell="module" in:shellEnter|global>
      <IconRail items={railItems} onSelect={chooseRail} />
      <SectionNav items={sectionItems} onSelect={() => shell.preferModule()} />
      <main data-region="canvas" class="min-w-0 flex-1 overflow-auto bg-surface px-8 py-6">
        {@render children()}
      </main>
    </div>
  {/if}
</div>

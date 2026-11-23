<script lang="ts">
  import { beforeNavigate } from '$app/navigation';
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import type { Snippet } from 'svelte';
  import { operatorFailureText, readOperator } from '#lib/features/platform/domain/operator.svelte';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import IconRail from '#lib/shared/ui/IconRail.svelte';
  import SectionNav from '#lib/shared/ui/SectionNav.svelte';
  import TopBar from '#lib/shared/ui/TopBar.svelte';
  import WideNav from '#lib/shared/ui/WideNav.svelte';
  import { readIdentity } from '#lib/shared/api/tenant';
  import Notice from '#lib/shared/ui/Notice.svelte';
  import { moduleOf, overviewEntries, pathActive, productEntries, sectionTitle, sectionTree, shellFor, visibleRail } from '#lib/features/shell/presentation/ia';
  import { shellEnter } from '#lib/features/shell/presentation/motion';
  import { getShellMode } from '#lib/features/shell/presentation/shell-mode.svelte';

  let { children, account, notice }: { children: Snippet; account?: Snippet; notice?: Snippet } = $props();
  const shell = getShellMode();
  const session = getSession();
  onMount(() => {
    shell.setSectionFolded(sessionStorage.getItem('edition.section-folded') === '1');
  });
  let operatorAttempt = $state(0);
  let navOpen = $state(false);
  const identityRequest = $derived(readIdentity(session.accessToken));
  const operatorRequest = $derived.by(() => {
    operatorAttempt;
    return readOperator(session.accessToken);
  });

  function retryOperator() {
    operatorAttempt += 1;
  }
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
      icon: item.href === '/content' ? 'content' : 'sites',
      active: pathActive(pathname, item.href)
    }))
  );
  function railFor(showPlatform: boolean) {
    return visibleRail(showPlatform).map((item) => ({
      href: item.href,
      label: item.label,
      icon: item.icon,
      overview: item.id === 'overview',
      active: module === item.id
    }));
  }
  const sectionItems = $derived(module && module !== 'overview' ? sectionTree(pathname, module) : []);

  function chooseRail(overview: boolean) {
    if (overview) shell.preferOverview();
    else shell.preferModule();
  }

  function toggleNav() {
    navOpen = !navOpen;
  }

  function closeNav() {
    navOpen = false;
  }

  function onWindowKey(event: KeyboardEvent) {
    if (event.key === 'Escape') navOpen = false;
  }

  beforeNavigate((navigation) => {
    navOpen = false;
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

<svelte:window onkeydown={onWindowKey} />

<div class="flex h-dvh flex-col bg-canvas font-sans text-ink">
  {#await identityRequest}
    <TopBar onOverview={() => shell.preferOverview()} onMenu={toggleNav} menuOpen={navOpen} {account} />
  {:then identity}
    <TopBar
      onOverview={() => shell.preferOverview()}
      onMenu={toggleNav}
      menuOpen={navOpen}
      tenant={identity?.tenant ?? ''}
      person={identity?.name ?? ''}
      {account}
    />
  {/await}
  {#await operatorRequest}
    {@render frame(false, null)}
  {:then status}
    {@render frame(status.allowed || status.failure !== null, status.failure)}
  {/await}
</div>

{#snippet frame(showPlatform: boolean, failure: import('#lib/shared/api/client').ApiFailure | null)}
  {#key kind}
  <div
    class="relative flex min-h-0 flex-1"
    data-shell={kind === 'overview' ? 'overview' : 'module'}
    data-layout
    in:shellEnter|global
  >
    {#if navOpen}
      <button type="button" class="absolute inset-0 z-20 border-0 bg-ink/20 p-0 md:hidden" tabindex="-1" aria-hidden="true" onclick={closeNav}></button>
    {/if}
    {#if kind === 'overview'}
      <div class="{navOpen ? 'edition-rise flex' : 'hidden'} absolute inset-y-0 left-0 z-30 w-[min(220px,calc(100%-3rem))] shadow-[4px_0_16px_rgba(31,35,41,0.08)] md:static md:flex md:w-auto md:shadow-none md:animate-none">
        <WideNav entries={wideEntries} {products} onOverview={() => shell.preferOverview()} onModule={() => shell.preferModule()} />
      </div>
      <main data-region="canvas" class="min-w-0 flex-1 overflow-auto bg-canvas px-4 py-4 sm:px-6 sm:py-5">
        {#if pathname === '/'}
          <div class="max-w-6xl">
            {@render operatorFailure(failure)}
            {#if notice}{@render notice()}{/if}
            {@render children()}
          </div>
        {:else}
          <div data-sheet="page" class="min-h-full rounded-card bg-surface px-5 py-6 sm:px-8">
            <div class="max-w-6xl">
              {@render operatorFailure(failure)}
              {#if notice}{@render notice()}{/if}
              {@render children()}
            </div>
          </div>
        {/if}
      </main>
    {:else}
      <div class="{navOpen ? 'edition-rise flex' : 'hidden'} absolute inset-y-0 left-0 z-30 w-[min(220px,calc(100%-3rem))] flex-col overflow-y-auto bg-surface shadow-[4px_0_16px_rgba(31,35,41,0.08)] md:static md:flex md:h-full md:w-auto md:flex-row md:overflow-visible md:bg-transparent md:shadow-none md:animate-none">
        <IconRail items={railFor(showPlatform)} folded={shell.sectionFolded} onUnfold={() => shell.setSectionFolded(false)} onSelect={chooseRail} />
        <SectionNav
          title={sectionTitle(module)}
          items={sectionItems}
          {pathname}
          folded={shell.sectionFolded}
          onFold={() => shell.setSectionFolded(true)}
          onSelect={() => shell.preferModule()}
        />
      </div>
      <main data-region="canvas" class="min-w-0 flex-1 overflow-auto bg-canvas p-4 sm:p-5">
        <div data-sheet="page" class="min-h-full rounded-card bg-surface px-5 py-6 sm:px-8">
          <div class="max-w-6xl">
            {@render operatorFailure(failure)}
            {#if notice}{@render notice()}{/if}
            {@render children()}
          </div>
        </div>
      </main>
    {/if}
  </div>
  {/key}
{/snippet}

{#snippet operatorFailure(failure: import('#lib/shared/api/client').ApiFailure | null)}
  {#if failure}
    <Notice text={operatorFailureText(failure)} onRetry={retryOperator} />
  {/if}
{/snippet}

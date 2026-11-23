<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from '#lib/shared/ui/Icon.svelte';

  let {
    onOverview,
    onMenu,
    menuOpen = false,
    tenant = '',
    person = '',
    account
  }: {
    onOverview: () => void;
    onMenu: () => void;
    menuOpen?: boolean;
    tenant?: string;
    person?: string;
    account?: Snippet;
  } = $props();

  let accountOpen = $state(false);
  const initial = $derived(Array.from(person.trim())[0] || '我');

  function toggleAccount() {
    accountOpen = !accountOpen;
  }

  function closeAccount() {
    accountOpen = false;
  }

  function onKey(event: KeyboardEvent) {
    if (event.key === 'Escape') accountOpen = false;
  }
</script>

<svelte:window onkeydown={onKey} />

<header class="flex h-[56px] shrink-0 items-center justify-between gap-3 border-b border-line bg-surface px-3 sm:px-5">
  <div class="flex min-w-0 items-center gap-1 sm:gap-2">
    <button
      type="button"
      class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-nav text-ink hover:bg-chip md:hidden"
      aria-label="菜单"
      aria-expanded={menuOpen}
      onclick={onMenu}
    >
      <Icon name={menuOpen ? 'close' : 'menu'} />
    </button>
    <a href="/" class="flex min-w-0 items-center" onclick={onOverview}>
      <img src="/page-craft-tip.png" alt="Page Craft" class="h-5 w-auto" />
    </a>
  </div>
  <div class="flex min-w-0 items-center gap-2 sm:gap-3">
    {#if tenant}
      <span class="min-w-0 truncate text-sm font-normal text-muted">{tenant}</span>
    {/if}
    <div class="relative">
      <button
        type="button"
        class="relative z-40 inline-flex h-8 w-8 items-center justify-center rounded-full bg-chip text-xs font-normal text-muted hover:bg-line"
        aria-label="我"
        aria-expanded={accountOpen}
        onclick={toggleAccount}
      >
        {initial}
      </button>
      {#if accountOpen}
        <button type="button" class="fixed inset-0 z-30 border-0 bg-transparent p-0" tabindex="-1" aria-hidden="true" onclick={closeAccount}></button>
        <div class="edition-rise absolute top-full right-0 z-40 mt-1 flex w-36 flex-col rounded-nav border border-line bg-surface p-1 shadow-[0_8px_24px_rgba(31,35,41,0.08)]">
          <a href="/account/password" class="flex h-9 items-center rounded-nav px-3 text-sm font-normal text-ink hover:bg-chip" onclick={closeAccount}>密码</a>
          {#if account}{@render account()}{/if}
        </div>
      {/if}
    </div>
  </div>
</header>

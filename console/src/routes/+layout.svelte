<script lang="ts">
  import { browser } from '$app/env';
  import { afterNavigate, goto } from '$app/navigation';
  import { page } from '$app/state';
  import '../app.css';
  import { setShellMode, ShellMode } from '#lib/features/shell/presentation/shell-mode.svelte';
  import Shell from '#lib/features/shell/presentation/Shell.svelte';
  import { HttpAuth } from '#lib/features/session/data/http-auth';
  import SessionNotice from '#lib/features/session/presentation/SessionNotice.svelte';
  import { Session, setSession } from '#lib/features/session/presentation/session.svelte';
  import Button from '#lib/shared/ui/Button.svelte';

  let { children } = $props();
  const session = new Session(new HttpAuth());
  setSession(session);
  setShellMode(new ShellMode());

  let ready = $state(false);

  function routeGuard() {
    const path = page.url.pathname;
    if (session.status === 'signed-out' && path !== '/login') void goto('/login');
    if (session.status === 'signed-in' && path === '/login' && session.hold === null) void goto('/');
  }

  if (browser) {
    void session.restore(page.url.pathname).then(() => {
      routeGuard();
      ready = true;
    });
  }

  afterNavigate(() => {
    if (!ready) return;
    routeGuard();
  });

  async function renew() {
    await session.renew();
    routeGuard();
  }

  async function signOut() {
    const left = await session.signOut();
    if (left) await goto('/login');
  }
</script>

<svelte:window onfocus={() => void renew()} />

{#if !ready}
  <div class="h-dvh bg-canvas"></div>
{:else if session.status === 'signed-in'}
  <Shell>
    {#snippet account()}
      <Button variant="quiet" onclick={() => void signOut()}>退出</Button>
    {/snippet}
    {#snippet notice()}
      <SessionNotice failure={session.hold} onRetry={() => void renew()} />
    {/snippet}
    {@render children()}
  </Shell>
{:else if page.url.pathname === '/login'}
  {@render children()}
{:else}
  <div class="h-dvh bg-canvas"></div>
{/if}

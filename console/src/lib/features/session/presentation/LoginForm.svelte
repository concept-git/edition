<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '#lib/shared/ui/Button.svelte';
  import type { LoginFailure } from '../domain/auth';
  import { loginFailureMessage, refreshFailureMessage } from './messages';
  import { getSession } from './session.svelte';

  const session = getSession();
  const field = $props.id();
  let email = $state('');
  let password = $state('');
  let pending = $state(false);
  let failure = $state<LoginFailure | null>(null);

  const message = $derived(
    failure ? loginFailureMessage(failure) : session.hold ? refreshFailureMessage(session.hold) : ''
  );
  const retryHold = $derived(!failure && (session.hold?.kind === 'server' || session.hold?.kind === 'network'));
  const retryLogin = $derived(failure?.kind === 'server' || failure?.kind === 'network');
  const control =
    'h-10 w-full rounded-nav border border-transparent bg-chip px-3 text-sm text-ink placeholder:text-faint hover:border-stroke disabled:pointer-events-none disabled:opacity-60';

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    if (pending) return;
    pending = true;
    failure = null;
    const result = await session.signIn(email, password);
    pending = false;
    if (result.ok) {
      await goto('/');
      return;
    }
    failure = result.failure;
  }

  async function retry() {
    if (failure) {
      failure = null;
      pending = true;
      const result = await session.signIn(email, password);
      pending = false;
      if (result.ok) {
        await goto('/');
        return;
      }
      failure = result.failure;
      return;
    }
    await session.renew();
    if (session.status === 'signed-in' && session.hold === null) await goto('/');
  }
</script>

<div class="relative flex min-h-dvh flex-col overflow-hidden">
  <img
    src="/login-scene.jpg"
    alt=""
    class="pointer-events-none absolute inset-0 h-full w-full object-cover object-[center_72%]"
  />
  <main class="relative z-10 flex flex-1 items-center justify-center px-4 py-8">
    <div class="w-full max-w-[400px] rounded-[16px] bg-surface px-7 py-8 shadow-[0_18px_50px_rgba(72,52,120,0.16)] sm:px-9 sm:py-10">
      <header class="mb-6 text-center">
        <h1 class="text-lg leading-7 font-medium text-ink">登录</h1>
        <p class="mt-1 text-xs leading-5 text-faint">使用邮箱和密码登录。</p>
      </header>
      <form class="flex flex-col gap-4" onsubmit={submit}>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-muted" for="{field}-email">邮箱</label>
          <input
            id="{field}-email"
            name="email"
            type="email"
            autocomplete="username"
            required
            disabled={pending}
            placeholder="请输入邮箱"
            bind:value={email}
            class={control}
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-muted" for="{field}-password">密码</label>
          <input
            id="{field}-password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            disabled={pending}
            placeholder="请输入密码"
            bind:value={password}
            class={control}
          />
        </div>
        {#if message}
          <div role="alert" class="flex flex-wrap items-center gap-3 text-sm text-ink">
            <p>{message}</p>
            {#if retryLogin || retryHold}
              <Button variant="quiet" onclick={() => void retry()}>重试</Button>
            {/if}
          </div>
        {/if}
        <Button type="submit" wide disabled={pending}>登录</Button>
      </form>
    </div>
  </main>
  <footer class="relative z-10 px-4 pb-5 text-center text-xs text-[#4e4860]/75">Edition · 文档与知识交付</footer>
</div>

<script lang="ts">
  import { goto } from '$app/navigation';
  import Button from '#lib/shared/ui/Button.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import TextField from '#lib/shared/ui/TextField.svelte';
  import type { LoginFailure } from '../domain/auth';
  import { loginFailureMessage, refreshFailureMessage } from './messages';
  import { getSession } from './session.svelte';

  const session = getSession();
  let email = $state('');
  let password = $state('');
  let pending = $state(false);
  let failure = $state<LoginFailure | null>(null);

  const message = $derived(
    failure ? loginFailureMessage(failure) : session.hold ? refreshFailureMessage(session.hold) : ''
  );
  const retryHold = $derived(!failure && (session.hold?.kind === 'server' || session.hold?.kind === 'network'));
  const retryLogin = $derived(failure?.kind === 'server' || failure?.kind === 'network');

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

<div class="flex min-h-dvh items-center justify-center bg-canvas px-6 py-10">
  <div class="w-full max-w-sm rounded-card border border-line bg-surface p-6">
    <PageHeader title="登录" description="使用邮箱和密码进入管理控制台。" />
    <form class="flex flex-col gap-4" onsubmit={submit}>
      <TextField label="邮箱" type="email" name="email" autocomplete="username" required bind:value={email} />
      <TextField label="密码" type="password" name="password" autocomplete="current-password" required bind:value={password} />
      {#if message}
        <div role="alert" class="flex flex-wrap items-center gap-3 text-sm text-ink">
          <p>{message}</p>
          {#if retryLogin || retryHold}
            <Button variant="quiet" onclick={() => void retry()}>重试</Button>
          {/if}
        </div>
      {/if}
      <div>
        <Button type="submit" disabled={pending}>登录</Button>
      </div>
    </form>
  </div>
</div>

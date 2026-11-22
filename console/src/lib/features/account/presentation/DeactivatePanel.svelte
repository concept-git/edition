<script lang="ts">
  import { api } from '#lib/shared/api/client';
  import Button from '#lib/shared/ui/Button.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import TextField from '#lib/shared/ui/TextField.svelte';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import { canRetry, confirmFeedback, keyForIntent } from '../domain/account';

  const session = getSession();
  let email = $state('');
  let currentPassword = $state('');
  let pending = $state(false);
  let stopped = $state(false);
  let restored = $state(false);
  let error = $state('');
  let retryable = $state(false);
  let deactivateIntent = $state({ key: '', fingerprint: '' });
  let restoreIntent = $state({ key: '', fingerprint: '' });

  async function loadProfile() {
    const token = session.accessToken;
    if (!token) return;
    const result = await api<{ email?: string; status?: string }>(token, '/api/v1/me');
    if (!result.ok) {
      error = confirmFeedback(result.failure);
      retryable = canRetry(result.failure);
      return;
    }
    email = result.body.email ?? '';
    if (result.body.status === 'deactivated') stopped = true;
  }

  async function deactivate(event?: SubmitEvent) {
    event?.preventDefault();
    const token = session.accessToken;
    if (!token || pending) return;
    pending = true;
    error = '';
    retryable = false;
    deactivateIntent = keyForIntent(deactivateIntent, `${email}\n${currentPassword}`);
    const result = await api(token, '/api/v1/me:deactivate', {
      method: 'POST',
      idempotencyKey: deactivateIntent.key,
      body: { confirmationEmail: email, currentPassword }
    });
    pending = false;
    if (!result.ok) {
      error = confirmFeedback(result.failure);
      retryable = canRetry(result.failure);
      return;
    }
    stopped = true;
    restored = false;
  }

  async function restore() {
    const token = session.accessToken;
    if (!token || pending) return;
    pending = true;
    error = '';
    retryable = false;
    restoreIntent = keyForIntent(restoreIntent, 'reactivate');
    const result = await api(token, '/api/v1/me:reactivate', {
      method: 'POST',
      idempotencyKey: restoreIntent.key
    });
    pending = false;
    if (!result.ok) {
      error = confirmFeedback(result.failure);
      retryable = canRetry(result.failure);
      return;
    }
    restored = true;
    stopped = false;
  }

  $effect(() => {
    void loadProfile();
  });
</script>

<PageHeader title="停用" description="停用可逆，并结束全部会话。停用不是注销。" />
{#if restored}
  <p class="text-sm text-ink">账号已恢复。可以继续登录。</p>
{:else if stopped}
  <div class="flex max-w-md flex-col items-start gap-3">
    <p class="text-sm leading-6 text-ink">账号已停用。停用可以恢复，这不是注销。</p>
    <Button disabled={pending} onclick={() => void restore()}>恢复账号</Button>
  </div>
{:else}
  <form class="flex max-w-sm flex-col gap-4" onsubmit={deactivate}>
    <TextField label="当前密码" type="password" autocomplete="current-password" bind:value={currentPassword} />
    {#if error}
      <div role="alert" class="flex flex-wrap items-center gap-3 text-sm text-ink">
        <p>{error}</p>
        {#if retryable}
          <Button variant="quiet" onclick={() => void deactivate()}>重试</Button>
        {/if}
      </div>
    {/if}
    <div>
      <Button type="submit" disabled={pending || !email}>停用账号</Button>
    </div>
  </form>
{/if}

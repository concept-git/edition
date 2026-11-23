<script lang="ts">
  import { api } from '#lib/shared/api/client';
  import Button from '#lib/shared/ui/Button.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import TextField from '#lib/shared/ui/TextField.svelte';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import { canRetry, passwordFeedback } from '../domain/account';
  import { leaveConsole } from './leave';

  const session = getSession();
  let oldPassword = $state('');
  let newPassword = $state('');
  let pending = $state(false);
  let oldError = $state('');
  let newError = $state('');
  let formError = $state('');
  let retryable = $state(false);

  async function submit(event?: SubmitEvent) {
    event?.preventDefault();
    const token = session.accessToken;
    if (!token || pending) return;
    pending = true;
    oldError = '';
    newError = '';
    formError = '';
    retryable = false;
    const result = await api(token, '/api/v1/me/password:change', {
      method: 'POST',
      body: { oldPassword, newPassword }
    });
    pending = false;
    if (result.ok) {
      await leaveConsole(session);
      return;
    }
    const feedback = passwordFeedback(result.failure);
    retryable = canRetry(result.failure);
    if (feedback.target === 'old') oldError = feedback.message;
    else if (feedback.target === 'new') newError = feedback.message;
    else formError = feedback.message;
  }
</script>

<PageHeader title="密码" description="用来证明你就是这个用户。改成之后，这次会话会结束。" />
<form onsubmit={submit}>
  <TextField layout="line" label="当前密码" type="password" autocomplete="current-password" hint="用来证明现在是你本人。" bind:value={oldPassword} error={oldError} />
  <TextField layout="line" label="新密码" type="password" autocomplete="new-password" hint="改成之后，这次会话会结束。" bind:value={newPassword} error={newError} />
  {#if formError}
    <div role="alert" class="mt-3 flex flex-wrap items-center gap-3 text-sm text-ink">
      <p>{formError}</p>
      {#if retryable}
        <Button variant="quiet" onclick={() => void submit()}>重试</Button>
      {/if}
    </div>
  {/if}
  <div class="pt-4">
    <Button type="submit" variant="ink" disabled={pending}>修改密码</Button>
    <p class="mt-2 text-xs text-faint">保存后需要重新登录。</p>
  </div>
</form>

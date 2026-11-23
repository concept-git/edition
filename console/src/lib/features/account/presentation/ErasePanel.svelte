<script lang="ts">
  import { api } from '#lib/shared/api/client';
  import Button from '#lib/shared/ui/Button.svelte';
  import Dialog from '#lib/shared/ui/Dialog.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import TextField from '#lib/shared/ui/TextField.svelte';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import { canRetry, confirmFeedback, keyForIntent } from '../domain/account';
  import { leaveConsole } from './leave';

  const session = getSession();
  let open = $state(false);
  let confirmationEmail = $state('');
  let currentPassword = $state('');
  let pending = $state(false);
  let error = $state('');
  let retryable = $state(false);
  let intent = $state({ key: '', fingerprint: '' });

  function start() {
    intent = keyForIntent({ key: '', fingerprint: '' }, 'erase');
    error = '';
    open = true;
  }

  function cancel() {
    open = false;
    error = '';
  }

  async function confirm() {
    const token = session.accessToken;
    if (!token || pending) return;
    pending = true;
    error = '';
    retryable = false;
    intent = keyForIntent(intent, `${confirmationEmail}\n${currentPassword}`);
    const result = await api(token, '/api/v1/me:erase', {
      method: 'POST',
      idempotencyKey: intent.key,
      body: { confirmationEmail, currentPassword }
    });
    pending = false;
    if (!result.ok) {
      error = confirmFeedback(result.failure);
      retryable = canRetry(result.failure);
      return;
    }
    open = false;
    await leaveConsole(session);
  }
</script>

<PageHeader title="注销" description="注销不可逆。确认前，用户还在。取消则用户仍在。" />
<Button variant="danger" onclick={start}>继续注销</Button>

{#if open}
<Dialog bind:open title="确认注销" description="注销不可逆。确认后不能再登录，个人资料会被抹去。">
  <TextField label="确认邮箱" type="email" autocomplete="username" bind:value={confirmationEmail} />
  <TextField label="当前密码" type="password" autocomplete="current-password" bind:value={currentPassword} />
  {#if error}
    <div role="alert" class="flex flex-wrap items-center gap-3 text-sm text-ink">
      <p>{error}</p>
      {#if retryable}
        <Button variant="quiet" onclick={() => void confirm()}>重试</Button>
      {/if}
    </div>
  {/if}
  {#snippet actions()}
    <Button variant="quiet" onclick={cancel}>取消</Button>
    <Button variant="danger" disabled={pending || !confirmationEmail || !currentPassword} onclick={() => void confirm()}>确认注销</Button>
  {/snippet}
</Dialog>
{/if}

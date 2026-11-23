<script lang="ts">
  import type { ApiFailure } from '#lib/shared/api/client';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import Button from '#lib/shared/ui/Button.svelte';
  import Switch from '#lib/shared/ui/Switch.svelte';
  import { updateAutoRelease } from '../data/http-spaces';
  import { sameIntent, type WriteIntent } from '../domain/space';
  import { canRetry, saveRejection } from './messages';

  let { tenantId, spaceId, saved }: { tenantId: string; spaceId: string; saved: boolean } = $props();
  const session = getSession();
  let checked = $derived(saved);
  let pending = $state(false);
  let failure = $state<ApiFailure | null>(null);
  let desired: boolean | null = null;
  let intent: WriteIntent | null = null;

  const message = $derived(failure ? saveRejection(failure) : '');
  const retryable = $derived(failure !== null && canRetry(failure));

  function changed(next: boolean) {
    if (pending || next === saved) return;
    const fingerprint = `autoRelease:${String(next)}`;
    intent = sameIntent(intent, fingerprint);
    desired = next;
    pending = true;
    void commit(next, intent.key);
  }

  function retry() {
    if (pending || intent === null || desired === null) return;
    pending = true;
    void commit(desired, intent.key);
  }

  async function commit(next: boolean, key: string) {
    const token = session.accessToken;
    if (!token) {
      checked = saved;
      pending = false;
      return;
    }
    failure = null;
    const result = await updateAutoRelease(token, tenantId, spaceId, next, key);
    if (!result.ok) {
      checked = saved;
      failure = result.failure;
      pending = false;
      return;
    }
    checked = result.body.autoRelease === true;
    failure = null;
    pending = false;
  }
</script>

<div class="mt-3 flex flex-col items-start gap-2">
  <Switch label="自动发版" bind:checked onCheckedChange={changed} disabled={pending} />
  {#if message}
    <div role="alert" class="flex flex-wrap items-center gap-3 text-sm text-ink">
      <p>{message}</p>
      {#if retryable}
        <Button variant="quiet" onclick={retry}>重试</Button>
      {/if}
    </div>
  {/if}
</div>

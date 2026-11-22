<script lang="ts">
  import Button from '#lib/shared/ui/Button.svelte';
  import type { SessionFailure } from '../domain/auth';
  import { refreshFailureMessage } from './messages';

  let { failure, onRetry }: { failure: SessionFailure | null; onRetry: () => void } = $props();
  const message = $derived(failure ? refreshFailureMessage(failure) : '');
  const retry = $derived(failure?.kind === 'server' || failure?.kind === 'network');
</script>

{#if failure && message}
  <div role="alert" class="mb-4 flex flex-wrap items-center gap-3 text-sm text-ink">
    <p>{message}</p>
    {#if retry}
      <Button variant="quiet" onclick={onRetry}>重试</Button>
    {/if}
  </div>
{/if}

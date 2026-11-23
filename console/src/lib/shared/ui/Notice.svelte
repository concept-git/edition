<script lang="ts">
  import Button from '#lib/shared/ui/Button.svelte';

  let {
    tone = 'failure',
    text,
    onRetry
  }: {
    tone?: 'failure' | 'success';
    text: string;
    onRetry?: () => void;
  } = $props();
</script>

<div role={tone === 'failure' ? 'alert' : 'status'} class="mb-4 flex flex-wrap items-center gap-3 text-sm {tone === 'failure' ? 'text-danger' : 'text-ink'}">
  <p>{text}</p>
  {#if onRetry}
    <Button variant="quiet" onclick={onRetry}>重试</Button>
  {/if}
</div>

<script lang="ts">
  import { Dialog } from 'bits-ui';
  import type { Snippet } from 'svelte';

  let {
    open = $bindable(false),
    title,
    description,
    children,
    actions
  }: {
    open?: boolean;
    title: string;
    description: string;
    children?: Snippet;
    actions: Snippet;
  } = $props();
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay class="fixed inset-0 z-10 bg-ink/20" />
    <Dialog.Content
      class="edition-rise fixed top-1/2 left-1/2 z-10 w-[min(100%-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-card border border-line bg-surface p-5 shadow-[0_8px_24px_rgba(31,35,41,0.08)] outline-none"
    >
      <Dialog.Title level={2} class="text-base font-medium text-ink">{title}</Dialog.Title>
      <Dialog.Description class="mt-2 text-sm leading-6 text-muted">{description}</Dialog.Description>
      {#if children}
        <div class="mt-4 flex flex-col gap-3">
          {@render children()}
        </div>
      {/if}
      <div class="mt-5 flex items-center gap-2">
        {@render actions()}
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

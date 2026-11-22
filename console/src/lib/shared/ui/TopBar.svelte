<script lang="ts">
  import type { Snippet } from 'svelte';

  let { onOverview, account }: { onOverview: () => void; account?: Snippet } = $props();
</script>

<header class="flex h-[56px] shrink-0 items-center justify-between border-b border-line bg-surface px-5">
  <a href="/" class="flex items-center gap-2" onclick={onOverview}>
    <span class="flex h-7 w-7 items-center justify-center rounded-nav bg-mint text-sm font-semibold text-accent">E</span>
    <span class="text-sm font-semibold text-ink">Edition</span>
    <span class="text-sm text-muted">管理控制台</span>
  </a>
  <div class="flex items-center gap-3">
    <a href="/account/password" class="text-sm text-ink" onclick={onOverview}>账号</a>
    {#if account}{@render account()}{/if}
  </div>
</header>

<script lang="ts">
  import { page } from '$app/state';
  import type { Snippet } from 'svelte';
  import NavItem from '#lib/shared/ui/NavItem.svelte';

  let {
    spaceId,
    title = '',
    controls,
    children
  }: {
    spaceId: string;
    title?: string;
    controls?: Snippet;
    children: Snippet;
  } = $props();
  const heading = $derived(title || (spaceId === 'example' ? '示例空间' : spaceId));
  const pathname = $derived(page.url.pathname);
  const tabs = [
    ['pages', '页面'],
    ['toc', '目录'],
    ['tags', '标签'],
    ['releases', '发版'],
    ['imports', '导入'],
    ['grants', '授权'],
    ['trash', '回收']
  ] as const;
</script>

<p class="text-xs text-muted">当前空间</p>
<h1 class="mt-1 text-xl font-semibold text-ink">{heading}</h1>
{#if controls}
  {@render controls()}
{/if}
<nav aria-label="空间" class="mt-4 mb-6 flex flex-wrap gap-1">
  {#each tabs as [slug, label] (slug)}
    {@const href = `/content/spaces/${spaceId}/${slug}`}
    <NavItem {href} {label} layout="row" active={pathname === href} />
  {/each}
</nav>
{@render children()}

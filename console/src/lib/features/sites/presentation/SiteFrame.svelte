<script lang="ts">
  import { page } from '$app/state';
  import type { Snippet } from 'svelte';
  import NavItem from '#lib/shared/ui/NavItem.svelte';
  import SiteName from './SiteName.svelte';

  let { siteId, children }: { siteId: string; children: Snippet } = $props();
  const pathname = $derived(page.url.pathname);
  const tabs = [
    ['mounts', '挂载'],
    ['domains', '域名'],
    ['redirects', '重定向'],
    ['search', '搜索'],
    ['grants', '授权'],
    ['webhooks', 'Webhook']
  ] as const;
</script>

<p class="text-xs text-muted">当前站点</p>
{#key siteId}
  <SiteName {siteId} />
{/key}
<nav aria-label="站点" class="mt-4 mb-6 flex flex-wrap gap-1">
  {#each tabs as [slug, label] (slug)}
    {@const href = `/sites/${siteId}/${slug}`}
    <NavItem {href} {label} layout="row" active={pathname === href} />
  {/each}
</nav>
{@render children()}

<script lang="ts">
  import { onDestroy } from 'svelte';
  import { currentTenant, loadSite } from '../data/sites-api';
  import { getSession } from '#lib/features/session/presentation/session.svelte';

  let { siteId }: { siteId: string } = $props();
  const session = getSession();
  let loadedName = $state<string | null>(null);
  const title = $derived(siteId === 'example' ? '示例站点' : (loadedName ?? '站点'));
  let alive = true;
  onDestroy(() => {
    alive = false;
  });

  async function load() {
    if (siteId === 'example') return;
    const token = session.accessToken;
    if (!token) return;
    const tenant = await currentTenant(token);
    if (!alive || !tenant.ok) return;
    const site = await loadSite(token, tenant.body, siteId);
    if (!alive || !site.ok) return;
    loadedName = site.body.name;
  }

  void load();
</script>

<h1 class="mt-1 text-xl font-semibold text-ink">{title}</h1>

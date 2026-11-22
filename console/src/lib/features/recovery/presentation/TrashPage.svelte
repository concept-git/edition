<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import Button from '#lib/shared/ui/Button.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import { listTrash, resolveTenant, restorePage } from '../data/http-trash';
  import { sameIntent, type TrashedPage, type WriteIntent } from '../domain/trash';
  import { queryFailureMessage, restoreRejection } from './messages';

  let { spaceId }: { spaceId: string } = $props();
  const session = getSession();

  let tenantId = $state<string | null>(null);
  let items = $state<TrashedPage[] | null>(null);
  let queryMessage = $state('');
  let restoreMessage = $state('');
  let restoring = $state('');
  let intent: WriteIntent | null = null;
  let generation = 0;

  async function load(id: string) {
    const request = ++generation;
    items = null;
    queryMessage = '';
    const token = session.accessToken;
    if (!token) {
      queryMessage = '回收页没有载入。';
      return;
    }
    const tenant = await resolveTenant(token);
    if (request !== generation) return;
    if (!tenant.ok) {
      queryMessage = queryFailureMessage(tenant.failure);
      return;
    }
    tenantId = tenant.body;
    const page = await listTrash(token, tenant.body, id);
    if (request !== generation) return;
    if (!page.ok) {
      queryMessage = queryFailureMessage(page.failure);
      return;
    }
    items = page.body;
    queryMessage = '';
  }

  async function restore(page: TrashedPage) {
    const token = session.accessToken;
    if (restoring || !token || !tenantId) return;
    intent = sameIntent(intent, page.id);
    const key = intent.key;
    restoring = page.id;
    restoreMessage = '';
    const result = await restorePage(token, tenantId, spaceId, page.id, key);
    restoring = '';
    if (!result.ok) {
      restoreMessage = restoreRejection(result.failure);
      return;
    }
    intent = null;
    items = (items ?? []).filter((item) => item.id !== page.id);
  }

  onDestroy(() => {
    generation += 1;
  });

  void load(untrack(() => spaceId));
</script>

<PageHeader level={2} title="回收" description="回收的页面可以恢复。恢复后页面回到这个空间。" />

{#if queryMessage}
  <div role="alert" class="mb-4 flex flex-wrap items-center gap-3 text-sm text-ink">
    <p>{queryMessage}</p>
    <Button variant="quiet" onclick={() => void load(spaceId)}>重试</Button>
  </div>
{/if}

{#if restoreMessage}
  <p role="alert" class="mb-4 text-sm text-ink">{restoreMessage}</p>
{/if}

{#if items !== null && items.length === 0 && queryMessage === ''}
  <EmptyState title="没有数据" description="回收的页面会列在这里，恢复后回到空间的页面列表。" />
{:else if items !== null && items.length > 0}
  <ul class="flex flex-col gap-2" aria-label="回收页">
    {#each items as item (item.id)}
      <li class="flex items-center justify-between gap-3 rounded-nav border border-line bg-surface px-3 py-2">
        <span class="text-sm text-ink">{item.title}</span>
        <Button type="button" variant="quiet" disabled={restoring === item.id} onclick={() => void restore(item)}>恢复</Button>
      </li>
    {/each}
  </ul>
{/if}

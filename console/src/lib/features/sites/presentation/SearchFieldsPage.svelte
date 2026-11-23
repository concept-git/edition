<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { ApiFailure } from '#lib/shared/api/client';
  import Button from '#lib/shared/ui/Button.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import { currentTenant, loadSearchFields, saveSearchFields } from '../data/sites-api';
  import { IntentKey, moveField, queryFailureMessage, searchFieldLabel, writeFailureMessage, type SearchField } from '../domain/sites';

  let { siteId }: { siteId: string } = $props();
  const session = getSession();
  const intent = new IntentKey();
  let fields = $state<SearchField[] | null>(null);
  let pending = $state(false);
  let saved = $state(false);
  let queryFailure = $state<ApiFailure | null>(null);
  let saveFailure = $state<ApiFailure | null>(null);
  let alive = true;

  onDestroy(() => {
    alive = false;
  });

  async function load() {
    const token = session.accessToken;
    if (!token) {
      queryFailure = { status: 0, code: null, traceId: null, retryAfter: null };
      return;
    }
    const tenant = await currentTenant(token);
    if (!alive) return;
    if (!tenant.ok) {
      queryFailure = tenant.failure;
      return;
    }
    const result = await loadSearchFields(token, tenant.body, siteId);
    if (!alive) return;
    if (!result.ok) {
      queryFailure = result.failure;
      return;
    }
    queryFailure = null;
    fields = result.body;
    saved = false;
  }

  function shift(index: number, direction: -1 | 1) {
    if (!fields) return;
    fields = moveField(fields, index, direction);
    saved = false;
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    const token = session.accessToken;
    if (!token || pending || !fields) return;
    pending = true;
    saveFailure = null;
    const order = fields;
    const tenant = await currentTenant(token);
    if (!alive) return;
    if (!tenant.ok) {
      saveFailure = tenant.failure;
      pending = false;
      return;
    }
    const key = intent.take(`${siteId}\n${order.join(',')}`);
    const result = await saveSearchFields(token, tenant.body, siteId, order, key);
    if (!alive) return;
    pending = false;
    if (!result.ok) {
      saveFailure = result.failure;
      return;
    }
    intent.finish();
    fields = result.body;
    saved = true;
  }

  void load();
</script>

<PageHeader level={2} title="搜索" description="排定搜索字段的优先顺序。搜索不索引工作稿。" />

{#if queryFailure}
  <div role="alert" class="flex flex-wrap items-center gap-3 text-sm text-ink">
    <p>{queryFailureMessage(queryFailure)}</p>
    <Button variant="quiet" onclick={() => void load()}>重试</Button>
  </div>
{:else if fields}
  <form aria-label="搜索字段" class="flex max-w-md flex-col gap-3" onsubmit={submit}>
    <ol aria-label="搜索字段顺序" class="flex flex-col gap-2">
      {#each fields as field, index (field)}
        <li class="flex flex-wrap items-center gap-2 text-sm text-ink">
          <span class="w-16">{searchFieldLabel[field]}</span>
          <Button type="button" variant="quiet" disabled={pending || index === 0} onclick={() => shift(index, -1)}>上移</Button>
          <Button type="button" variant="quiet" disabled={pending || index === fields.length - 1} onclick={() => shift(index, 1)}>下移</Button>
        </li>
      {/each}
    </ol>
    {#if saveFailure}
      <p role="alert" class="text-sm text-ink">{writeFailureMessage(saveFailure)}</p>
    {/if}
    {#if saved}
      <p role="status" class="text-sm text-ink">已保存</p>
    {/if}
    <div>
      <Button type="submit" variant="ink" disabled={pending}>保存顺序</Button>
    </div>
  </form>
{/if}

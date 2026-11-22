<script lang="ts">
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import Button from '#lib/shared/ui/Button.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import TextField from '#lib/shared/ui/TextField.svelte';
  import { createSpace, listSpaces, resolveTenant } from '../data/http-spaces';
  import { mergeSpace, sameIntent, type SpaceMode, type SpaceSummary, type WriteIntent } from '../domain/space';
  import { createRejection, queryFailureMessage } from './messages';

  const session = getSession();
  let tenantId = $state<string | null>(null);
  let items = $state<SpaceSummary[] | null>(null);
  let canCreate = $state(false);
  let queryMessage = $state('');
  let name = $state('');
  let mode = $state<SpaceMode>('authored');
  let pending = $state(false);
  let rejection = $state('');
  let intent: WriteIntent | null = null;

  const modes = [
    ['authored', 'authored'],
    ['synced', 'synced']
  ] as const;

  async function load() {
    const token = session.accessToken;
    if (!token) {
      items = null;
      queryMessage = '空间列表没有载入。';
      return;
    }
    const tenant = await resolveTenant(token);
    if (!tenant.ok) {
      items = null;
      queryMessage = queryFailureMessage(tenant.failure);
      return;
    }
    tenantId = tenant.body;
    const page = await listSpaces(token, tenant.body);
    if (!page.ok) {
      items = null;
      queryMessage = queryFailureMessage(page.failure);
      return;
    }
    items = page.body.items;
    canCreate = page.body.canCreate;
    queryMessage = '';
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    const token = session.accessToken;
    if (pending || !token || !tenantId) return;
    const fingerprint = `${mode}\n${name}`;
    intent = sameIntent(intent, fingerprint);
    const key = intent.key;
    pending = true;
    rejection = '';
    const result = await createSpace(token, tenantId, { name, mode }, key);
    pending = false;
    if (!result.ok) {
      rejection = createRejection(result.failure);
      return;
    }
    intent = null;
    name = '';
    rejection = '';
    mode = 'authored';
    items = mergeSpace(items ?? [], result.body);
    const refreshed = await listSpaces(token, tenantId);
    if (!refreshed.ok) {
      queryMessage = queryFailureMessage(refreshed.failure);
      return;
    }
    items = mergeSpace(refreshed.body.items, result.body);
    canCreate = refreshed.body.canCreate;
    queryMessage = '';
  }

  function choose(next: SpaceMode) {
    mode = next;
  }

  void load();
</script>

<PageHeader title="空间" description="空间是一组页面的家。来源模式分为 authored 与 synced。" />

{#if queryMessage}
  <div role="alert" class="mb-4 flex flex-wrap items-center gap-3 text-sm text-ink">
    <p>{queryMessage}</p>
    <Button variant="quiet" onclick={() => void load()}>重试</Button>
  </div>
{/if}

{#if items !== null && items.length === 0 && queryMessage === ''}
  <EmptyState title="没有数据" description="打开示例空间可以查看页面、目录、标签、发版、导入、授权和回收。">
    {#snippet actions()}
      <Button href="/content/spaces/example/pages">打开示例空间</Button>
    {/snippet}
  </EmptyState>
{:else if items !== null && items.length > 0}
  <ul class="mb-6 flex flex-col gap-2" aria-label="空间">
    {#each items as space (space.id)}
      <li class="flex items-center justify-between gap-3 rounded-nav border border-line bg-surface px-3 py-2">
        <Button href={`/content/spaces/${space.id}/pages`}>{space.name}</Button>
        <span class="rounded-nav bg-mint px-2 py-0.5 text-xs font-medium text-accent">{space.mode}</span>
      </li>
    {/each}
  </ul>
{/if}

{#if canCreate}
  <form aria-label="创建空间" class="mt-6 flex max-w-md flex-col gap-4" onsubmit={submit}>
    <TextField label="名称" name="name" required bind:value={name} />
    <div role="group" aria-label="来源模式" class="flex gap-2">
      {#each modes as [value, label] (value)}
        <Button type="button" variant={mode === value ? 'primary' : 'quiet'} onclick={() => choose(value)}>{label}</Button>
      {/each}
    </div>
    {#if rejection}
      <p role="alert" class="text-sm text-ink">{rejection}</p>
    {/if}
    <div>
      <Button type="submit" disabled={pending}>创建</Button>
    </div>
  </form>
{/if}

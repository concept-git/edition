<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import { TRIGGERS, type DndEvent } from 'svelte-dnd-action';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import Button from '#lib/shared/ui/Button.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import SelectField from '#lib/shared/ui/SelectField.svelte';
  import TextField from '#lib/shared/ui/TextField.svelte';
  import { addTocEntry, listTargetPages, moveTocEntry, resolveTenant, viewToc } from '../data/http-toc';
  import {
    copyTree,
    findEntry,
    flatten,
    isKind,
    replaceChildren,
    sameIntent,
    type PageOption,
    type TocNode,
    type WriteIntent
  } from '../domain/toc';
  import { directoryRejection, queryFailureMessage } from './messages';
  import TocList from './TocList.svelte';

  let { spaceId }: { spaceId: string } = $props();
  const session = getSession();
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const flipDurationMs = reduceMotion ? 0 : 180;

  let tenantId = $state<string | null>(null);
  let entries = $state<TocNode[] | null>(null);
  let pages = $state<PageOption[]>([]);
  let canEdit = $state(false);
  let queryMessage = $state('');
  let rejection = $state('');
  let kind = $state('group');
  let label = $state('');
  let parentId = $state('');
  let pageId = $state('');
  let url = $state('');
  let entryId = $state('');
  let nextParentId = $state('');
  let positionText = $state('0');
  let adding = $state(false);
  let moving = $state(false);
  let addIntent: WriteIntent | null = null;
  let moveIntent: WriteIntent | null = null;
  let dragSnapshot: TocNode[] | null = null;
  let generation = 0;

  const tree = $derived(entries ?? []);
  const listed = $derived(flatten(tree));
  const parentOptions = $derived([{ value: '', label: '根' }, ...listed.map((entry) => ({ value: entry.id, label: entry.label }))]);
  const entryOptions = $derived(listed.map((entry) => ({ value: entry.id, label: entry.label })));
  const pageOptions = $derived(pages.map((page) => ({ value: page.id, label: page.title })));

  function keepSelections(next: TocNode[], nextPages: PageOption[]) {
    const flat = flatten(next);
    if (parentId !== '' && !flat.some((entry) => entry.id === parentId)) parentId = '';
    if (!flat.some((entry) => entry.id === entryId)) entryId = flat[0]?.id ?? '';
    if (nextParentId !== '' && !flat.some((entry) => entry.id === nextParentId)) nextParentId = '';
    if (!nextPages.some((page) => page.id === pageId)) pageId = nextPages[0]?.id ?? '';
  }

  async function load(id: string) {
    const request = ++generation;
    entries = null;
    queryMessage = '';
    rejection = '';
    const token = session.accessToken;
    if (!token) {
      queryMessage = '目录没有载入。';
      return;
    }
    const tenant = await resolveTenant(token);
    if (request !== generation) return;
    if (!tenant.ok) {
      queryMessage = queryFailureMessage(tenant.failure);
      return;
    }
    tenantId = tenant.body;
    const [directory, targets] = await Promise.all([
      viewToc(token, tenant.body, id),
      listTargetPages(token, tenant.body, id)
    ]);
    if (request !== generation) return;
    if (!directory.ok) {
      queryMessage = queryFailureMessage(directory.failure);
      return;
    }
    if (!targets.ok) {
      entries = directory.body.entries;
      canEdit = directory.body.canEdit;
      queryMessage = queryFailureMessage(targets.failure);
      return;
    }
    entries = directory.body.entries;
    canEdit = directory.body.canEdit;
    pages = targets.body;
    keepSelections(entries, pages);
    queryMessage = '';
  }

  async function submitAdd(event: SubmitEvent) {
    event.preventDefault();
    const token = session.accessToken;
    if (adding || !token || !tenantId || entries === null) return;
    if (!isKind(kind)) return;
    const parent = parentId || null;
    const siblings = parent === null ? flatten(entries).filter((entry) => entry.parentId === null) : (findEntry(entries, parent)?.children ?? []);
    const fingerprint = `${kind}\n${label.trim()}\n${parent ?? ''}\n${pageId}\n${url.trim()}\n${siblings.length}`;
    addIntent = sameIntent(addIntent, fingerprint);
    const key = addIntent.key;
    adding = true;
    rejection = '';
    const result = await addTocEntry(
      token,
      tenantId,
      spaceId,
      {
        label: label.trim(),
        kind,
        parentId: parent,
        position: siblings.length,
        targetId: pageId,
        url: url.trim()
      },
      key
    );
    adding = false;
    if (entries === null) return;
    if (!result.ok) {
      rejection = directoryRejection(result.failure);
      return;
    }
    addIntent = null;
    label = '';
    url = '';
    rejection = '';
    entries = result.body.entries;
    canEdit = result.body.canEdit;
    keepSelections(entries, pages);
  }

  function consider(zoneParent: string | null, event: CustomEvent<DndEvent<TocNode>>) {
    if (entries === null) return;
    if (event.detail.info.trigger === TRIGGERS.DRAG_STARTED && dragSnapshot === null) dragSnapshot = copyTree(entries);
    entries = replaceChildren(entries, zoneParent, event.detail.items);
  }

  function finalize(zoneParent: string | null, event: CustomEvent<DndEvent<TocNode>>) {
    if (entries === null) return;
    const info = event.detail.info;
    if (info.trigger !== TRIGGERS.DROPPED_INTO_ZONE) {
      if (!moving) entries = replaceChildren(entries, zoneParent, event.detail.items);
      return;
    }
    const position = event.detail.items.findIndex((item) => item.id === info.id && !item.isDndShadowItem);
    const before = dragSnapshot;
    if (position < 0) {
      if (before) entries = before;
      dragSnapshot = null;
      return;
    }
    const original = before ? findEntry(before, info.id) : null;
    if (original && (original.parentId ?? null) === zoneParent && original.position === position) {
      entries = before ?? entries;
      dragSnapshot = null;
      return;
    }
    entries = replaceChildren(entries, zoneParent, event.detail.items);
    void commitMove(info.id, zoneParent, position, before);
  }

  function nudge(id: string, zoneParent: string | null, position: number) {
    void commitMove(id, zoneParent, position, null);
  }

  async function submitMove(event: SubmitEvent) {
    event.preventDefault();
    const position = Number(positionText);
    if (!Number.isInteger(position) || position < 0) {
      rejection = '这个位置不合法。';
      return;
    }
    await commitMove(entryId, nextParentId || null, position, null);
  }

  async function commitMove(id: string, zoneParent: string | null, position: number, before: TocNode[] | null) {
    const token = session.accessToken;
    if (moving || !token || !tenantId || !id || entries === null) return;
    const prior = before ?? copyTree(entries);
    const fingerprint = `${id}\n${zoneParent ?? ''}\n${position}`;
    moveIntent = sameIntent(moveIntent, fingerprint);
    const key = moveIntent.key;
    moving = true;
    rejection = '';
    const result = await moveTocEntry(token, tenantId, spaceId, id, zoneParent, position, key);
    moving = false;
    dragSnapshot = null;
    if (!result.ok) {
      entries = prior;
      rejection = directoryRejection(result.failure);
      keepSelections(entries, pages);
      return;
    }
    moveIntent = null;
    rejection = '';
    entries = result.body.entries;
    canEdit = result.body.canEdit;
    keepSelections(entries, pages);
  }

  onDestroy(() => {
    generation += 1;
  });

  void load(untrack(() => spaceId));
</script>

<PageHeader level={2} title="目录" description="目录最多 7 级。把目标、分组和外链排成读者要走的顺序。" />

{#if queryMessage}
  <div role="alert" class="mb-4 flex flex-wrap items-center gap-3 text-sm text-ink">
    <p>{queryMessage}</p>
    <Button variant="quiet" onclick={() => void load(spaceId)}>重试</Button>
  </div>
{/if}

<section aria-label="目录" class="mb-6">
  {#if entries !== null && entries.length === 0 && queryMessage === ''}
    <EmptyState title="没有数据" description="把目标、分组和外链排进目录。" />
  {:else if entries !== null && entries.length > 0}
    <TocList
      items={entries}
      parentId={null}
      {flipDurationMs}
      {canEdit}
      onconsider={consider}
      onfinalize={finalize}
      onnudge={nudge}
    />
  {:else if !queryMessage}
    <p class="text-sm text-muted">正在载入目录。</p>
  {/if}
  {#if rejection}
    <p role="alert" class="mt-3 text-sm text-ink">{rejection}</p>
  {/if}
</section>

{#if canEdit && entries !== null}
  <form aria-label="加入目录" class="flex max-w-md flex-col gap-4" onsubmit={submitAdd}>
    <SelectField
      label="种类"
      bind:value={kind}
      options={[
        { value: 'group', label: '分组' },
        { value: 'target', label: '目标' },
        { value: 'link', label: '外链' }
      ]}
    />
    <TextField label="标签" name="label" required bind:value={label} />
    {#if kind === 'target'}
      <SelectField label="页面" bind:value={pageId} options={pageOptions} />
    {/if}
    {#if kind === 'link'}
      <TextField label="地址" name="url" required bind:value={url} />
    {/if}
    <SelectField label="上级" bind:value={parentId} options={parentOptions} />
    <div>
      <Button type="submit" disabled={adding}>加入</Button>
    </div>
  </form>

  {#if entryOptions.length > 0}
    <form aria-label="移动目录项" class="mt-6 flex max-w-md flex-col gap-4" onsubmit={submitMove}>
      <SelectField label="条目" bind:value={entryId} options={entryOptions} />
      <SelectField label="新的上级" bind:value={nextParentId} options={parentOptions} />
      <TextField label="位置" name="position" bind:value={positionText} />
      <div>
        <Button type="submit" disabled={moving}>移动</Button>
      </div>
    </form>
  {/if}
{/if}

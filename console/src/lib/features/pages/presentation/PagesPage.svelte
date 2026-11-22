<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import Button from '#lib/shared/ui/Button.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import SourceEditor from '#lib/shared/ui/SourceEditor.svelte';
  import TextField from '#lib/shared/ui/TextField.svelte';
  import { createPage, editPage, listPages, publishPage, resolveTenant, unpublishPage, viewPageContent } from '../data/http-pages';
  import {
    applyReadiness,
    exceedsContentLimit,
    FORMATS,
    mergePage,
    pageAddress,
    readinessOf,
    sameIntent,
    type PageFormat,
    type PageReadiness,
    type PageSource,
    type PageSummary,
    type WriteIntent
  } from '../domain/page';
  import { clearMarkRejection, createRejection, limitRejection, markRejection, queryFailureMessage, saveRejection } from './messages';

  let { spaceId }: { spaceId: string } = $props();
  const session = getSession();

  let tenantId = $state<string | null>(null);
  let items = $state<PageSummary[] | null>(null);
  let canCreate = $state(false);
  let queryMessage = $state('');
  let title = $state('');
  let format = $state<PageFormat>('markdown');
  let creating = $state(false);
  let createMessage = $state('');
  let createIntent: WriteIntent | null = null;
  let address = '';

  let editing = $state<PageSource | null>(null);
  let draft = $state('');
  let opening = $state(false);
  let saving = $state(false);
  let saveMessage = $state('');
  let saveIntent: WriteIntent | null = null;
  let readiness = $state<PageReadiness>('draft');
  let marking = $state(false);
  let markMessage = $state('');
  let markIntent: WriteIntent | null = null;
  let generation = 0;

  async function load(id: string) {
    const request = ++generation;
    items = null;
    queryMessage = '';
    editing = null;
    const token = session.accessToken;
    if (!token) {
      queryMessage = '页面没有载入。';
      return;
    }
    const tenant = await resolveTenant(token);
    if (request !== generation) return;
    if (!tenant.ok) {
      queryMessage = queryFailureMessage(tenant.failure);
      return;
    }
    tenantId = tenant.body;
    const page = await listPages(token, tenant.body, id);
    if (request !== generation) return;
    if (!page.ok) {
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
    if (creating || !token || !tenantId) return;
    const fingerprint = `${format}\n${title}`;
    if (createIntent === null || createIntent.fingerprint !== fingerprint) address = pageAddress(title, format);
    createIntent = sameIntent(createIntent, fingerprint);
    const key = createIntent.key;
    creating = true;
    createMessage = '';
    const result = await createPage(token, tenantId, spaceId, { title: title.trim(), format, slug: address }, key);
    creating = false;
    if (!result.ok) {
      createMessage = createRejection(result.failure);
      return;
    }
    createIntent = null;
    title = '';
    createMessage = '';
    format = 'markdown';
    items = mergePage(items ?? [], result.body);
    const refreshed = await listPages(token, tenantId, spaceId);
    if (!refreshed.ok) {
      queryMessage = queryFailureMessage(refreshed.failure);
      return;
    }
    items = mergePage(refreshed.body.items, result.body);
    canCreate = refreshed.body.canCreate;
    queryMessage = '';
  }

  async function open(id: string) {
    const request = ++generation;
    const token = session.accessToken;
    if (!token || !tenantId) return;
    opening = true;
    editing = null;
    saveMessage = '';
    saveIntent = null;
    markMessage = '';
    markIntent = null;
    readiness = readinessOf(items?.find((item) => item.id === id)?.status);
    const result = await viewPageContent(token, tenantId, spaceId, id);
    if (request !== generation) return;
    opening = false;
    if (!result.ok) {
      queryMessage = queryFailureMessage(result.failure);
      return;
    }
    draft = result.body.content;
    editing = result.body;
  }

  async function save() {
    const current = editing;
    const token = session.accessToken;
    if (!current || saving || !token || !tenantId) return;
    if (exceedsContentLimit(draft)) {
      saveMessage = limitRejection();
      return;
    }
    const fingerprint = `${current.id}\n${current.etag}\n${draft}`;
    saveIntent = sameIntent(saveIntent, fingerprint);
    const key = saveIntent.key;
    const body = draft;
    saving = true;
    saveMessage = '';
    const result = await editPage(token, tenantId, spaceId, current.id, body, current.etag, key);
    saving = false;
    if (editing?.id !== current.id) return;
    if (!result.ok) {
      saveMessage = saveRejection(result.failure);
      return;
    }
    saveIntent = null;
    editing = result.body;
    if (draft === body) draft = result.body.content;
  }

  async function setReady(next: PageReadiness) {
    const current = editing;
    const token = session.accessToken;
    if (!current || marking || !token || !tenantId || next === readiness) return;
    const fingerprint = `${current.id}\n${next}`;
    markIntent = sameIntent(markIntent, fingerprint);
    const key = markIntent.key;
    marking = true;
    markMessage = '';
    const result =
      next === 'published'
        ? await publishPage(token, tenantId, spaceId, current.id, key)
        : await unpublishPage(token, tenantId, spaceId, current.id, key);
    marking = false;
    if (!result.ok) {
      if (editing?.id === current.id) markMessage = next === 'published' ? markRejection(result.failure) : clearMarkRejection(result.failure);
      return;
    }
    markIntent = null;
    if (editing?.id === current.id) readiness = result.body;
    items = applyReadiness(items ?? [], current.id, result.body);
  }

  function close() {
    generation += 1;
    opening = false;
    editing = null;
    draft = '';
    saveMessage = '';
    saveIntent = null;
    markMessage = '';
    markIntent = null;
    marking = false;
  }

  function choose(next: PageFormat) {
    format = next;
  }

  onDestroy(() => {
    generation += 1;
  });

  void load(untrack(() => spaceId));
</script>

<PageHeader level={2} title="页面" description="可以创建 markdown、html、txt、json 和 xml 五种页面，并用源码编辑器保存原文。" />

{#if queryMessage}
  <div role="alert" class="mb-4 flex flex-wrap items-center gap-3 text-sm text-ink">
    <p>{queryMessage}</p>
    <Button variant="quiet" onclick={() => void load(spaceId)}>重试</Button>
  </div>
{/if}

{#if editing}
  <section aria-label="正文编辑" class="flex max-w-3xl flex-col gap-3">
    <p class="text-sm text-muted">{editing.format}</p>
    <section aria-label="进版" class="flex flex-col items-start gap-2">
      <p class="text-sm text-muted">这还不是读者可见。进版只表示可以进入下一份发版。</p>
      <div class="flex items-center gap-2">
        {#if readiness === 'published'}
          <span class="rounded-nav bg-mint px-2 py-0.5 text-xs font-medium text-accent">可发版</span>
          <Button type="button" variant="quiet" disabled={marking} onclick={() => void setReady('draft')}>取消进版</Button>
        {:else}
          <Button type="button" disabled={marking} onclick={() => void setReady('published')}>进版</Button>
        {/if}
      </div>
      {#if markMessage}
        <p role="alert" class="text-sm text-ink">{markMessage}</p>
      {/if}
    </section>
    {#key editing.id}
      <SourceEditor bind:value={draft} label="正文" language={editing.format} />
    {/key}
    {#if saveMessage}
      <p role="alert" class="text-sm text-ink">{saveMessage}</p>
    {/if}
    <div class="flex gap-2">
      <Button type="button" disabled={saving} onclick={() => void save()}>保存</Button>
      <Button type="button" variant="quiet" onclick={close}>返回</Button>
    </div>
  </section>
{:else if opening}
  <p class="text-sm text-muted">正在载入页面。</p>
{:else}
  {#if items !== null && items.length === 0 && queryMessage === ''}
    <EmptyState title="没有数据" description="创建一种格式的页面后，可以在源码编辑器里保存正文。" />
  {:else if items !== null && items.length > 0}
    <ul class="mb-6 flex flex-col gap-2" aria-label="源码页面">
      {#each items as item (item.id)}
        <li class="flex items-center justify-between gap-3 rounded-nav border border-line bg-surface px-3 py-2">
          <Button type="button" variant="quiet" onclick={() => void open(item.id)}>{item.title}</Button>
          <span class="flex items-center gap-2">
            {#if item.status === 'published'}
              <span class="rounded-nav bg-mint px-2 py-0.5 text-xs font-medium text-accent">可发版</span>
            {/if}
            <span class="rounded-nav bg-mint px-2 py-0.5 text-xs font-medium text-accent">{item.format}</span>
          </span>
        </li>
      {/each}
    </ul>
  {/if}

  {#if canCreate}
    <form aria-label="按格式创建" class="mt-6 flex max-w-md flex-col gap-4" onsubmit={submit}>
      <TextField label="标题" name="title" required bind:value={title} />
      <div role="group" aria-label="格式" class="flex flex-wrap gap-2">
        {#each FORMATS as option (option)}
          <Button type="button" variant={format === option ? 'primary' : 'quiet'} onclick={() => choose(option)}>{option}</Button>
        {/each}
      </div>
      {#if createMessage}
        <p role="alert" class="text-sm text-ink">{createMessage}</p>
      {/if}
      <div>
        <Button type="submit" disabled={creating}>创建</Button>
      </div>
    </form>
  {/if}
{/if}

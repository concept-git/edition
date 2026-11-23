<script lang="ts">
  import { onDestroy } from 'svelte';
  import { keyedDiff } from '#lib/shared/api/copy';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import Button from '#lib/shared/ui/Button.svelte';
  import SourceEditor from '#lib/shared/ui/SourceEditor.svelte';
  import { diffRevisions, listRevisions, revertPage, viewRevision } from '../data/http-revisions';
  import { sameIntent, type PageSource, type WriteIntent } from '../domain/page';
  import type { DiffLine, RevisionDetail, RevisionEntry } from '../domain/revision';
  import { revertRejection, revisionOpenFailure, revisionQueryFailure } from './messages';

  let {
    tenantId,
    spaceId,
    source,
    onRestored
  }: {
    tenantId: string;
    spaceId: string;
    source: PageSource;
    onRestored: (next: PageSource) => void;
  } = $props();

  const session = getSession();
  let shown = $state(false);
  let items = $state<RevisionEntry[] | null>(null);
  let queryMessage = $state('');
  let selected = $state<RevisionDetail | null>(null);
  let historical = $state('');
  let lines = $state<DiffLine[] | null>(null);
  let openMessage = $state('');
  let restoreMessage = $state('');
  let restoring = $state(false);
  let intent: WriteIntent | null = null;
  let generation = 0;

  const clock = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  });

  async function show() {
    shown = true;
    await load();
  }

  async function load() {
    const request = ++generation;
    const token = session.accessToken;
    queryMessage = '';
    if (!token) {
      items = null;
      queryMessage = '修订没有载入。';
      return;
    }
    const result = await listRevisions(token, tenantId, spaceId, source.id);
    if (request !== generation) return;
    if (!result.ok) {
      items = null;
      queryMessage = revisionQueryFailure(result.failure);
      return;
    }
    items = result.body;
  }

  async function openRevision(n: number, current = source.revision) {
    const request = ++generation;
    const token = session.accessToken;
    openMessage = '';
    restoreMessage = '';
    if (!token) {
      openMessage = '这份修订没有打开。';
      return;
    }
    const detail = await viewRevision(token, tenantId, spaceId, source.id, n);
    const compared = current >= 1 ? await diffRevisions(token, tenantId, spaceId, source.id, n, current) : null;
    if (request !== generation) return;
    if (!detail.ok) {
      openMessage = revisionOpenFailure(detail.failure);
      return;
    }
    if (compared && !compared.ok) {
      openMessage = revisionOpenFailure(compared.failure);
      return;
    }
    historical = detail.body.content;
    selected = detail.body;
    lines = compared && compared.ok ? compared.body : [];
  }

  async function restore(n: number) {
    const token = session.accessToken;
    const baseline = source.etag;
    if (restoring || !token) return;
    const fingerprint = `${source.id}\n${baseline}\n${n}`;
    intent = sameIntent(intent, fingerprint);
    const key = intent.key;
    restoring = true;
    restoreMessage = '';
    const result = await revertPage(token, tenantId, spaceId, source.id, n, baseline, key);
    restoring = false;
    if (!result.ok) {
      restoreMessage = revertRejection(result.failure);
      return;
    }
    intent = null;
    onRestored(result.body);
    await load();
    await openRevision(n, result.body.revision);
  }

  function lineLabel(type: DiffLine['type']) {
    if (type === 'delete') return '删除';
    if (type === 'add') return '增加';
    return '相同';
  }

  onDestroy(() => {
    generation += 1;
  });
</script>

<div class="flex flex-col gap-3">
  {#if !shown}
    <div>
      <Button type="button" variant="quiet" onclick={() => void show()}>查看修订</Button>
    </div>
  {:else if queryMessage}
    <div role="alert" class="flex flex-wrap items-center gap-3 text-sm text-ink">
      <p>{queryMessage}</p>
      <Button type="button" variant="quiet" onclick={() => void load()}>重试</Button>
    </div>
  {:else if items === null}
    <p class="text-sm text-muted">正在载入修订。</p>
  {:else if items.length === 0}
    <p class="text-sm text-muted">还没有修订。</p>
  {:else}
    <ul aria-label="修订" class="flex flex-col gap-2">
      {#each items as item (item.n)}
        <li class="flex flex-wrap items-center justify-between gap-3 rounded-nav border border-line bg-surface px-3 py-2">
          <Button type="button" variant="quiet" onclick={() => void openRevision(item.n)}>修订 {item.n}</Button>
          <time class="text-sm text-muted" datetime={item.createdAt}>{clock.format(new Date(item.createdAt))}</time>
        </li>
      {/each}
    </ul>
    {#if openMessage}
      <p role="alert" class="text-sm text-ink">{openMessage}</p>
    {/if}
    {#if selected && lines}
      <section aria-label="修订差异" class="flex flex-col gap-2">
        <h3 class="text-sm font-medium text-ink">与当前正文的差异</h3>
        {#if lines.length === 0}
          <p class="text-sm text-muted">与当前正文相同。</p>
        {:else}
          <ul class="flex flex-col gap-1" aria-label="差异行">
            {#each keyedDiff(lines) as line (line.key)}
              <li class={`rounded-nav px-2 py-1 text-sm text-ink ${line.type === 'add' ? 'bg-mint' : ''}`}>{lineLabel(line.type)} {line.content}</li>
            {/each}
          </ul>
        {/if}
      </section>
      {#key selected.n}
        <SourceEditor bind:value={historical} label="修订正文" language={source.format} />
      {/key}
      {#if restoreMessage}
        <p role="alert" class="text-sm text-ink">{restoreMessage}</p>
      {/if}
      <div>
        <Button type="button" disabled={restoring} onclick={() => selected && void restore(selected.n)}>取回</Button>
      </div>
    {/if}
  {/if}
</div>

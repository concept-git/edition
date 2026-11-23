<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import type { ApiFailure } from '#lib/shared/api/client';
  import { keyedText } from '#lib/shared/api/copy';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import Button from '#lib/shared/ui/Button.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import FileField from '#lib/shared/ui/FileField.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import { beginImport, listSpacePages, loadImportSpace, retryImport, viewImportJob } from '../data/http-imports';
  import {
    canRunAgain,
    IntentKey,
    reportLines,
    statusLabel,
    type ImportedPage,
    type ImportJob
  } from '../domain/import-job';
  import { canRetry, importFailureMessage, loadFailureMessage, retryFailureMessage } from './messages';

  let { spaceId }: { spaceId: string } = $props();
  const session = getSession();
  const importIntent = new IntentKey();
  const retryIntent = new IntentKey();

  let mode = $state<'authored' | 'synced' | null>(null);
  let tenantId = $state<string | null>(null);
  let loadFailure = $state<ApiFailure | null>(null);
  let submitFailure = $state<ApiFailure | null>(null);
  let retryFailure = $state<ApiFailure | null>(null);
  let job = $state<ImportJob | null>(null);
  let imported = $state<ImportedPage[]>([]);
  let file = $state<File | null>(null);
  let pending = $state(false);
  let generation = 0;
  let alive = true;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const busy = $derived(pending || (job !== null && !job.terminal));
  const lines = $derived(job ? reportLines(job) : []);

  onDestroy(() => {
    alive = false;
    generation += 1;
    clearTimeout(timer);
  });

  async function load() {
    loadFailure = null;
    mode = null;
    const token = session.accessToken;
    if (!token) {
      loadFailure = { status: 0, code: null, traceId: null, retryAfter: null };
      return;
    }
    const space = await loadImportSpace(token, spaceId);
    if (!alive) return;
    if (!space.ok) {
      loadFailure = space.failure;
      return;
    }
    tenantId = space.body.tenantId;
    mode = space.body.mode;
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    if (busy || !file) return;
    const token = session.accessToken;
    if (!token || !tenantId) return;
    const chosen = file;
    const key = importIntent.take(`${spaceId}\n${chosen.name}\n${chosen.size}\n${chosen.lastModified}`);
    pending = true;
    submitFailure = null;
    const accepted = await beginImport(token, tenantId, spaceId, chosen, key);
    pending = false;
    if (!alive) return;
    if (!accepted.ok) {
      submitFailure = accepted.failure;
      return;
    }
    importIntent.finish();
    await follow(accepted.body);
  }

  async function runAgain() {
    if (!job || !canRunAgain(job) || pending || !tenantId) return;
    const token = session.accessToken;
    if (!token) return;
    const jobId = job.id;
    const key = retryIntent.take(jobId);
    pending = true;
    retryFailure = null;
    const retried = await retryImport(token, tenantId, jobId, key);
    if (!alive) return;
    if (!retried.ok) {
      pending = false;
      retryFailure = retried.failure;
      return;
    }
    retryIntent.finish();
    const viewed = await viewImportJob(token, tenantId, spaceId, jobId);
    pending = false;
    if (!alive) return;
    if (!viewed.ok) {
      retryFailure = viewed.failure;
      return;
    }
    await follow(viewed.body);
  }

  async function follow(initial: ImportJob) {
    const watch = ++generation;
    clearTimeout(timer);
    let current = initial;
    job = current;
    imported = [];
    await tick();
    while (!current.terminal) {
      const seconds = current.nextPollAfterSeconds;
      if (seconds === null) return;
      const keepGoing = await pause(Math.max(0, seconds) * 1000, watch);
      if (!keepGoing || watch !== generation) return;
      const token = session.accessToken;
      if (!token || !tenantId) return;
      const next = await viewImportJob(token, tenantId, spaceId, current.id);
      if (watch !== generation) return;
      if (!next.ok) {
        loadFailure = next.failure;
        return;
      }
      current = next.body;
      job = current;
      await tick();
    }
    if (!current.successful) return;
    const token = session.accessToken;
    if (!token || !tenantId) return;
    const listed = await listSpacePages(token, tenantId, spaceId);
    if (watch !== generation || !alive) return;
    if (!listed.ok) {
      loadFailure = listed.failure;
      return;
    }
    imported = listed.body;
  }

  function pause(ms: number, watch: number) {
    return new Promise<boolean>((resolve) => {
      timer = setTimeout(() => resolve(watch === generation), ms);
    });
  }

  void load();
</script>

<PageHeader level={2} title="导入" description="上传发版包，查看作业进度和问题报告。" />

{#if mode === null && !loadFailure}
  <p class="text-sm text-muted">正在载入导入。</p>
{:else if loadFailure && !job}
  <div role="alert" class="flex flex-wrap items-center gap-3 text-sm text-ink">
    <p>{loadFailureMessage(loadFailure)}</p>
    <Button variant="quiet" onclick={() => void load()}>重试</Button>
  </div>
{:else}
  {#if !job}
    <EmptyState title="没有数据" description="上传发版包后可以看到作业进度。" />
  {/if}
  <form aria-label="导入发版包" class="mt-4 flex max-w-md flex-col gap-3" onsubmit={submit}>
    <FileField label="发版包" bind:file disabled={busy} />
    {#if submitFailure}
      <div role="alert" class="flex flex-wrap items-center gap-3 text-sm text-ink">
        <p>{importFailureMessage(submitFailure)}</p>
        {#if canRetry(submitFailure)}
          <Button type="submit" variant="quiet" disabled={busy}>重试</Button>
        {/if}
      </div>
    {/if}
    <div>
      <Button type="submit" disabled={busy || file === null}>导入</Button>
    </div>
  </form>
  {#if job}
    <div class="mt-6 flex max-w-md flex-col gap-3">
      <p role="status" class="text-sm font-medium text-ink">{job.outcome === 'flagged' ? '待确认' : statusLabel(job.status)}</p>
      {#if job.progress.total !== null}
        <p class="text-sm text-muted">{job.progress.done ?? 0} / {job.progress.total}</p>
      {/if}
      {#if lines.length > 0}
        <ul aria-label="问题报告" class="flex flex-col gap-1 text-sm text-ink">
          {#each keyedText(lines) as line (line.key)}
            <li>{line.text}</li>
          {/each}
        </ul>
      {/if}
      {#if retryFailure}
        <p role="alert" class="text-sm text-ink">{retryFailureMessage(retryFailure)}</p>
      {/if}
      {#if canRunAgain(job)}
        <div>
          <Button variant="quiet" disabled={pending} onclick={() => void runAgain()}>再次执行</Button>
        </div>
      {/if}
      {#if job.successful && imported.length > 0}
        <ul aria-label="导入产生的内容" class="flex flex-col gap-1 text-sm text-ink">
          {#each imported as item (item.id)}
            <li>{item.title}</li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
  {#if loadFailure && job}
    <div role="alert" class="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink">
      <p>{loadFailureMessage(loadFailure)}</p>
    </div>
  {/if}
{/if}

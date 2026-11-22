<script lang="ts">
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import Button from '#lib/shared/ui/Button.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import TextField from '#lib/shared/ui/TextField.svelte';
  import { queryAudit } from '../data/http-audit';
  import {
    actionLabel,
    canRetry,
    failureMessage,
    formatTime,
    outcomeLabel,
    type AuditFailure,
    type AuditRecord
  } from '../domain/audit';

  const session = getSession();
  let action = $state('');
  let records = $state<AuditRecord[] | null>(null);
  let failure = $state<AuditFailure | null>(null);
  let pending = $state(false);
  let generation = 0;

  async function load() {
    const current = ++generation;
    const token = session.accessToken;
    const requested = action;
    if (!token) {
      records = null;
      failure = { kind: 'unavailable', traceId: null };
      return;
    }
    pending = true;
    const result = await queryAudit(token, requested);
    if (current !== generation) return;
    pending = false;
    if (!result.ok) {
      records = null;
      failure = result.failure;
      return;
    }
    failure = null;
    records = result.records;
  }

  function submit(event: SubmitEvent) {
    event.preventDefault();
    void load();
  }
</script>

<PageHeader title="审计" description="按操作查阅审计。已注销的主体不再被重新认出。" />
<form class="mb-5 flex items-end gap-3" onsubmit={submit}>
  <div class="w-64">
    <TextField label="操作" bind:value={action} />
  </div>
  <Button type="submit">查询</Button>
</form>

{#if failure}
  <div role="alert" class="flex flex-wrap items-center gap-3 text-sm text-ink">
    <p>{failureMessage(failure)}</p>
    {#if canRetry(failure)}
      <Button variant="quiet" disabled={pending} onclick={() => void load()}>重试</Button>
    {/if}
  </div>
{:else if records === null || records.length === 0}
  <EmptyState title="没有数据" description="没有符合该操作的审计记录。" />
{:else}
  <ul aria-label="审计记录" class="max-w-3xl">
    {#each records as record (record.id)}
      <li class="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-b border-line py-3 text-sm">
        <div class="min-w-40">
          <p class="font-medium text-ink">{actionLabel(record.action)}</p>
          <p class="mt-1 text-xs text-muted">{record.action}</p>
        </div>
        <p class="text-ink">{record.actorName}</p>
        <p class="text-muted">{outcomeLabel(record.outcome)}</p>
        <time class="text-xs text-muted" datetime={record.time}>{formatTime(record.time)}</time>
      </li>
    {/each}
  </ul>
{/if}

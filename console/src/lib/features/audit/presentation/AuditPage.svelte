<script lang="ts">
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import Button from '#lib/shared/ui/Button.svelte';
  import DataTable from '#lib/shared/ui/DataTable.svelte';
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

<PageHeader title="审计日志" description="按操作查阅审计。已注销的主体不再被重新认出。" />
<form class="mb-6" onsubmit={submit}>
  <TextField layout="line" label="操作" hint="填写操作标识，例如 Space.create。" bind:value={action} />
  <div class="pt-4">
    <Button type="submit" disabled={pending}>查询记录</Button>
    <p class="mt-2 text-xs text-faint">只列出匹配的记录。查询失败时保留错误，不把结果画成空表。</p>
  </div>
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
  <DataTable label="审计记录" columns={['操作', '标识', '操作者', '结果', '时间']} total={records.length}>
    {#snippet rows()}
      {#each records as record (record.id)}
        <tr class="border-b border-line">
          <td class="px-3 py-3">{actionLabel(record.action)}</td>
          <td class="px-3 py-3 text-faint">{record.action}</td>
          <td class="px-3 py-3">{record.actorName}</td>
          <td class="px-3 py-3 text-muted">{outcomeLabel(record.outcome)}</td>
          <td class="px-3 py-3 text-faint"><time datetime={record.time}>{formatTime(record.time)}</time></td>
        </tr>
      {/each}
    {/snippet}
  </DataTable>
{/if}

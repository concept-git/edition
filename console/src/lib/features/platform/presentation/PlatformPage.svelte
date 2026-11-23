<script lang="ts">
  import { api, type ApiResult } from '#lib/shared/api/client';
  import { healthRows, type HealthReport } from '#lib/features/platform/domain/health-status';
  import { readOperator } from '#lib/features/platform/domain/operator.svelte';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import { keyedText } from '#lib/shared/api/copy';
  import Button from '#lib/shared/ui/Button.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import TextField from '#lib/shared/ui/TextField.svelte';

  let { view }: { view: 'tenants' | 'users' | 'health' | 'mail' } = $props();
  const session = getSession();

  const pages = {
    tenants: {
      title: '租户',
      description: '平台运营员查看租户。这里不展示租户正文。',
      empty: '还没有租户。'
    },
    users: {
      title: '用户',
      description: '按邮箱或姓名查找用户。这里不展示租户正文。',
      empty: '输入至少 3 个字符后查找用户。'
    },
    health: {
      title: '运行状态',
      description: '查看进程与交付健康。这里没有租户正文。',
      empty: '还没有进程心跳。'
    },
    mail: {
      title: '邮件作业',
      description: '查看邮件作业。这里不展示租户正文。',
      empty: '还没有邮件作业。'
    }
  };

  type Phase = 'loading' | 'ready' | 'rejected' | 'error';

  let phase = $state<Phase>(view === 'users' ? 'ready' : 'loading');
  let traceId = $state<string | null>(null);
  let lines = $state<string[]>([]);
  let query = $state('');

  const current = $derived(pages[view]);
  const access = $derived.by(() => readOperator(session.accessToken));

  if (view !== 'users') void load(session.accessToken, pathFor(view));

  function pathFor(currentView: 'tenants' | 'health' | 'mail') {
    if (currentView === 'tenants') return '/admin/tenants';
    if (currentView === 'health') return '/admin/health';
    return '/ops/mail-jobs';
  }

  async function load(token: string | null, path: string) {
    if (!token) {
      phase = 'error';
      traceId = null;
      lines = [];
      return;
    }
    const result = await api<unknown>(token, path);
    show(result, () => linesFrom(result));
  }

  async function search(event: SubmitEvent) {
    event.preventDefault();
    const token = session.accessToken;
    const needle = query.trim();
    if (!token || needle.length < 3) return;
    phase = 'loading';
    const result = await api<{ users?: Array<{ name?: string; email?: string }> }>(
      token,
      `/admin/users?q=${encodeURIComponent(needle)}`
    );
    show(result, () =>
      (result.ok ? (result.body.users ?? []) : []).map((user) => [user.name, user.email].filter(Boolean).join(' '))
    );
  }

  function show(result: ApiResult<unknown>, project: () => string[]) {
    if (!result.ok) {
      phase = result.failure.status === 403 ? 'rejected' : 'error';
      traceId = result.failure.traceId;
      lines = [];
      return;
    }
    lines = project();
    phase = 'ready';
  }

  function linesFrom(result: ApiResult<unknown>): string[] {
    if (!result.ok) return [];
    if (view === 'tenants') {
      const tenants = (result.body as { tenants?: Array<{ name?: string; status?: string }> }).tenants ?? [];
      return tenants.map((tenant) => [tenant.name, tenant.status].filter(Boolean).join(' '));
    }
    if (view === 'mail') {
      const items =
        (result.body as { items?: Array<{ kind?: string; recipient?: string; status?: string }> }).items ?? [];
      return items.map((item) => [item.kind, item.recipient, item.status].filter(Boolean).join(' '));
    }
    if (view === 'health') return healthRows(result.body as HealthReport).map((row) => `${row.service} ${row.status}`);
    return [];
  }
</script>

<PageHeader title={current.title} description={current.description} />
{#await access}
  <p class="text-sm text-muted">正在读取。</p>
{:then status}
  {@const denied = phase === 'rejected' || (!status.failure && !status.allowed)}
  {#if view === 'users' && !denied}
    <form class="mb-4 flex items-end gap-3" onsubmit={search}>
      <TextField label="查找用户" bind:value={query} />
      <Button type="submit">查找</Button>
    </form>
  {/if}
  {#if denied}
    <p role="alert" class="text-sm text-ink">直接访问被拒绝。</p>
  {:else if phase === 'error'}
    <p role="alert" class="text-sm text-ink">{traceId ? `没有完成。追踪号 ${traceId}。` : '没有完成。'}</p>
  {:else if phase === 'loading'}
    <p class="text-sm text-muted">正在读取。</p>
  {:else if lines.length === 0}
    <EmptyState title="没有数据" description={current.empty} />
  {:else}
    <ul class="flex flex-col gap-2 text-sm text-ink">
      {#each keyedText(lines) as line (line.key)}
        <li>{line.text}</li>
      {/each}
    </ul>
  {/if}
{/await}

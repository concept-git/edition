<script lang="ts">
  import { api, type ApiFailure } from '#lib/shared/api/client';
  import Button from '#lib/shared/ui/Button.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import { keptDraft } from '../domain/account';
  import { leaveConsole } from './leave';

  type Device = { name?: string; browser?: string; os?: string };
  type DeviceSession = {
    id: string;
    device: Device;
    current: boolean;
  };

  const session = getSession();
  let sessions = $state<DeviceSession[] | null>(null);
  let failure = $state<ApiFailure | null>(null);
  let ending = $state<string | null>(null);

  async function load() {
    const token = session.accessToken;
    if (!token) return;
    failure = null;
    const result = await api<{ sessions: DeviceSession[] }>(token, '/api/v1/me/sessions');
    if (!result.ok) {
      sessions = null;
      failure = result.failure;
      return;
    }
    sessions = result.body.sessions;
  }

  async function end(item: DeviceSession) {
    const token = session.accessToken;
    if (!token || ending) return;
    ending = item.id;
    const result = await api(token, `/api/v1/me/sessions/${item.id}`, { method: 'DELETE' });
    ending = null;
    if (!result.ok) {
      failure = result.failure;
      return;
    }
    if (item.current) {
      await leaveConsole(session);
      return;
    }
    sessions = sessions?.filter((entry) => entry.id !== item.id) ?? [];
  }

  $effect(() => {
    void load();
  });
</script>

<PageHeader title="会话" description="查看并结束自己的会话。结束后不能再续期。" />
{#if failure}
  <div role="alert" class="flex max-w-lg flex-wrap items-center gap-3 text-sm text-ink">
    <p>{keptDraft('会话没有读出来', failure)}</p>
    <Button variant="quiet" onclick={() => void load()}>重试</Button>
  </div>
{:else if sessions}
  <ul class="flex max-w-lg flex-col gap-3">
    {#each sessions as item (item.id)}
      <li class="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface px-4 py-3">
        <div>
          <p class="text-sm font-normal text-ink">
            <span>{item.device.name}</span>
            {#if item.current}<span class="ml-2 rounded-nav bg-chip px-2 py-0.5 text-xs font-normal text-ink">当前</span>{/if}
          </p>
          <p class="mt-1 text-xs text-muted">{item.device.browser} · {item.device.os}</p>
        </div>
        <Button variant="danger-quiet" disabled={ending === item.id} onclick={() => void end(item)}>结束会话</Button>
      </li>
    {/each}
  </ul>
{:else}
  <p class="text-sm text-muted">正在读取会话。</p>
{/if}

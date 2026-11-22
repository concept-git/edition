<script lang="ts">
  import { onMount } from 'svelte';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import Button from '#lib/shared/ui/Button.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import TextField from '#lib/shared/ui/TextField.svelte';
  import {
    idempotencyKey,
    membershipFailure,
    readFailure,
    retrySameIntent,
    type Invitation,
    type Team,
    type TeamMember
  } from '../domain/membership';
  import {
    createTeam,
    currentTenant,
    inviteTeamMember,
    listTeamInvitations,
    listTeamMembers,
    listTeams
  } from '../data/http-membership';
  import TeamRow from './TeamRow.svelte';

  type TeamRowModel = {
    team: Team;
    members: TeamMember[];
    invitations: Invitation[];
  };

  const session = getSession();

  let tenantId = '';
  let name = $state('');
  let teams = $state.raw<TeamRowModel[] | null>(null);
  let issued = $state<Record<string, string>>({});
  let notice = $state('');
  let loadError = $state('');
  let pending = $state(false);
  let createKey: string | null = null;
  const placeKeys: Record<string, string> = {};

  onMount(() => {
    void reload();
  });

  async function reload() {
    const token = session.accessToken;
    if (!token) {
      loadError = readFailure({ status: 0, code: null, traceId: null, retryAfter: null }, '用户组');
      return;
    }
    if (!tenantId) {
      const tenant = await currentTenant(token);
      if (!tenant.ok) {
        loadError = readFailure(tenant.failure, '用户组');
        return;
      }
      tenantId = tenant.body;
    }
    const page = await listTeams(token, tenantId);
    if (!page.ok) {
      loadError = readFailure(page.failure, '用户组');
      return;
    }
    const rows: TeamRowModel[] = [];
    for (const team of page.body.items ?? []) {
      const [people, invites] = await Promise.all([
        listTeamMembers(token, tenantId, team.id),
        listTeamInvitations(token, tenantId, team.id)
      ]);
      if (!people.ok) {
        loadError = readFailure(people.failure, '用户组');
        return;
      }
      if (!invites.ok) {
        loadError = readFailure(invites.failure, '用户组');
        return;
      }
      rows.push({ team, members: people.body.items ?? [], invitations: invites.body.items ?? [] });
    }
    teams = rows;
    loadError = '';
  }

  async function submitTeam(event: SubmitEvent) {
    event.preventDefault();
    const token = session.accessToken;
    if (pending || !token || !tenantId) return;
    pending = true;
    notice = '';
    createKey ??= idempotencyKey();
    const result = await createTeam(token, tenantId, name.trim(), createKey);
    pending = false;
    if (!result.ok) {
      if (!retrySameIntent(result.failure.status)) createKey = null;
      notice = membershipFailure(result.failure);
      return;
    }
    createKey = null;
    name = '';
    await reload();
  }

  async function place(teamId: string, email: string): Promise<boolean> {
    const token = session.accessToken;
    if (pending || !token || !tenantId) return false;
    pending = true;
    notice = '';
    const slot = `${teamId}:${email}`;
    const key = placeKeys[slot] ?? idempotencyKey();
    placeKeys[slot] = key;
    const result = await inviteTeamMember(token, tenantId, teamId, email, 'member', key);
    pending = false;
    if (!result.ok) {
      if (!retrySameIntent(result.failure.status)) delete placeKeys[slot];
      notice = membershipFailure(result.failure);
      return false;
    }
    delete placeKeys[slot];
    issued[teamId] = result.body.token;
    await reload();
    return true;
  }
</script>

<PageHeader title="用户组" description="用户组把多个用户收成一个可授权的主体。" />

{#if loadError}
  <p role="alert" class="text-sm text-ink">{loadError}</p>
{:else if teams === null}
  <p class="text-sm text-muted">正在载入</p>
{:else}
  {#if notice}
    <p role="alert" class="mb-4 text-sm text-ink">{notice}</p>
  {/if}
  <form class="flex max-w-md flex-col gap-3" onsubmit={submitTeam}>
    <TextField label="用户组名称" required bind:value={name} />
    <div>
      <Button type="submit" disabled={pending}>创建用户组</Button>
    </div>
  </form>
  {#if teams.length === 0}
    <div class="mt-4">
      <EmptyState title="没有数据" description="登录后可以创建用户组，并把成员放进去。" />
    </div>
  {:else}
    <ul aria-label="用户组" class="mt-4 flex flex-col gap-4">
      {#each teams as row (row.team.id)}
        <TeamRow
          name={row.team.name}
          members={row.members}
          invitations={row.invitations}
          token={issued[row.team.id] ?? null}
          {pending}
          onPlace={(email) => place(row.team.id, email)}
        />
      {/each}
    </ul>
  {/if}
{/if}

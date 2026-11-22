<script lang="ts">
  import { onMount } from 'svelte';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import Button from '#lib/shared/ui/Button.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import SectionCard from '#lib/shared/ui/SectionCard.svelte';
  import TextField from '#lib/shared/ui/TextField.svelte';
  import {
    idempotencyKey,
    invitationStatus,
    membershipFailure,
    readFailure,
    retrySameIntent,
    roleLabel,
    type Invitation,
    type MemberRole,
    type TenantMember
  } from '../domain/membership';
  import { currentTenant, inviteMember, listInvitations, listMembers, removeMember } from '../data/http-membership';

  const session = getSession();

  let tenantId = '';
  let members = $state.raw<TenantMember[] | null>(null);
  let invitations = $state.raw<Invitation[] | null>(null);
  let email = $state('');
  let role = $state<MemberRole>('member');
  let issuedToken = $state<string | null>(null);
  let confirmingId = $state<string | null>(null);
  let notice = $state('');
  let loadError = $state('');
  let pending = $state(false);
  let inviteKey: string | null = null;
  let removeKey: string | null = null;

  onMount(() => {
    void reload();
  });

  async function reload() {
    const token = session.accessToken;
    if (!token) {
      loadError = readFailure({ status: 0, code: null, traceId: null, retryAfter: null }, '成员');
      return;
    }
    if (!tenantId) {
      const tenant = await currentTenant(token);
      if (!tenant.ok) {
        loadError = readFailure(tenant.failure, '成员');
        return;
      }
      tenantId = tenant.body;
    }
    const [memberPage, invitePage] = await Promise.all([listMembers(token, tenantId), listInvitations(token, tenantId)]);
    if (!memberPage.ok) {
      loadError = readFailure(memberPage.failure, '成员');
      return;
    }
    if (!invitePage.ok) {
      loadError = readFailure(invitePage.failure, '邀请');
      return;
    }
    members = memberPage.body.items ?? [];
    invitations = invitePage.body.items ?? [];
    loadError = '';
  }

  async function submitInvite(event: SubmitEvent) {
    event.preventDefault();
    const token = session.accessToken;
    if (pending || !token || !tenantId) return;
    pending = true;
    notice = '';
    inviteKey ??= idempotencyKey();
    const result = await inviteMember(token, tenantId, email.trim(), role, inviteKey);
    pending = false;
    if (result.ok) {
      inviteKey = null;
      issuedToken = result.body.token;
      email = '';
      await reload();
      return;
    }
    if (!retrySameIntent(result.failure.status)) inviteKey = null;
    notice = membershipFailure(result.failure);
  }

  async function confirmRemove(member: TenantMember) {
    const token = session.accessToken;
    if (pending || !token || !tenantId) return;
    pending = true;
    notice = '';
    removeKey ??= idempotencyKey();
    const result = await removeMember(token, tenantId, member.id, removeKey);
    pending = false;
    confirmingId = null;
    if (result.ok) {
      removeKey = null;
      await reload();
      return;
    }
    if (!retrySameIntent(result.failure.status)) removeKey = null;
    notice = membershipFailure(result.failure);
  }
</script>

<PageHeader title="成员" description="邀请同事加入当前租户。成员角色是所有者或成员。" />

{#if loadError}
  <p role="alert" class="text-sm text-ink">{loadError}</p>
{:else if members === null || invitations === null}
  <p class="text-sm text-muted">正在载入</p>
{:else}
  {#if notice}
    <p role="alert" class="mb-4 text-sm text-ink">{notice}</p>
  {/if}
  <div class="flex flex-col gap-4">
    <SectionCard title="成员">
      <ul aria-label="成员" class="flex flex-col gap-2">
        {#each members as member (member.id)}
          <li class="flex items-center justify-between gap-3 border-b border-line py-2 last:border-b-0">
            <div>
              <p class="text-sm text-ink">{member.name}</p>
              <p class="text-xs text-muted">{roleLabel(member.role)}</p>
            </div>
            {#if confirmingId === member.id}
              <span class="flex gap-2">
                <Button type="button" disabled={pending} onclick={() => void confirmRemove(member)}>确认移除</Button>
                <Button type="button" variant="quiet" disabled={pending} onclick={() => (confirmingId = null)}>取消</Button>
              </span>
            {:else}
              <Button type="button" variant="quiet" onclick={() => (confirmingId = member.id)}>移除</Button>
            {/if}
          </li>
        {/each}
      </ul>
    </SectionCard>
    <SectionCard title="邀请">
      <form class="flex flex-col gap-3" onsubmit={submitInvite}>
        <TextField label="邮箱" type="email" required bind:value={email} />
        <div class="flex gap-2" role="group" aria-label="角色">
          <Button type="button" variant={role === 'member' ? 'primary' : 'quiet'} onclick={() => (role = 'member')}>成员</Button>
          <Button type="button" variant={role === 'owner' ? 'primary' : 'quiet'} onclick={() => (role = 'owner')}>所有者</Button>
        </div>
        <div>
          <Button type="submit" disabled={pending}>邀请</Button>
        </div>
      </form>
      {#if issuedToken}
        <div class="mt-4">
          <p class="text-xs text-muted">邀请令牌只显示这一次。</p>
          <p role="status" aria-label="邀请令牌" class="mt-1 break-all text-sm text-ink">{issuedToken}</p>
        </div>
      {/if}
      {#if invitations.length === 0}
        <div class="mt-4">
          <EmptyState title="没有数据" description="登录后可以邀请成员，并看到邀请状态。" />
        </div>
      {:else}
        <ul aria-label="邀请" class="mt-4 flex flex-col gap-2">
          {#each invitations as invite (invite.id)}
            <li class="flex flex-wrap gap-3 border-b border-line py-2 text-sm text-ink last:border-b-0">
              <span>{invite.email}</span>
              <span>{roleLabel(invite.role)}</span>
              <span>{invitationStatus(invite.expiresAt)}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </SectionCard>
  </div>
{/if}

<script lang="ts">
  import { onMount } from 'svelte';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import Button from '#lib/shared/ui/Button.svelte';
  import DataTable from '#lib/shared/ui/DataTable.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import SearchBox from '#lib/shared/ui/SearchBox.svelte';
  import SelectField from '#lib/shared/ui/SelectField.svelte';
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
  let query = $state('');
  const roles = [
    { value: 'member', label: '成员' },
    { value: 'owner', label: '所有者' }
  ];
  const visibleMembers = $derived((members ?? []).filter((member) => member.name.includes(query.trim())));
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
  <div class="mb-3 flex justify-end">
    <SearchBox label="搜索成员" placeholder="请输入成员名称" bind:value={query} />
  </div>
  {#if visibleMembers.length === 0}
    <EmptyState title="没有数据" description="没有符合名称的成员。" />
  {:else}
    <DataTable label="成员" columns={['名称', '角色', ' ']} total={visibleMembers.length}>
      {#snippet rows()}
        {#each visibleMembers as member (member.id)}
          <tr class="border-b border-line">
            <td class="px-3 py-3">{member.name}</td>
            <td class="px-3 py-3 text-muted">{roleLabel(member.role)}</td>
            <td class="px-3 py-3 text-right">
              {#if confirmingId === member.id}
                <span class="inline-flex items-center gap-3">
                  <Button type="button" variant="danger" disabled={pending} onclick={() => void confirmRemove(member)}>确认移除</Button>
                  <Button type="button" variant="quiet" disabled={pending} onclick={() => (confirmingId = null)}>取消</Button>
                </span>
              {:else}
                <Button type="button" variant="danger-quiet" onclick={() => (confirmingId = member.id)}>移除</Button>
              {/if}
            </td>
          </tr>
        {/each}
      {/snippet}
    </DataTable>
  {/if}
  <section class="mt-8" aria-label="邀请成员">
    <h2 class="text-sm font-medium text-ink">邀请</h2>
    <form class="mt-2" onsubmit={submitInvite}>
      <TextField layout="line" label="邮箱" type="email" required hint="同事用这个地址接受邀请。" bind:value={email} />
      <SelectField
        layout="line"
        label="角色"
        hint="所有者决定这个租户的成员。成员使用被授予的空间。"
        options={roles}
        value={role}
        onchange={(value) => {
          if (value === 'owner' || value === 'member') role = value;
        }}
      />
      <div class="pt-4">
        <Button type="submit" disabled={pending}>邀请成员</Button>
        <p class="mt-2 text-xs text-faint">邀请令牌只显示这一次。</p>
      </div>
    </form>
    {#if issuedToken}
      <p role="status" aria-label="邀请令牌" class="mt-3 break-all text-sm text-ink">{issuedToken}</p>
    {/if}
    {#if invitations.length === 0}
      <div class="mt-4">
        <EmptyState title="没有数据" description="登录后可以邀请成员，并看到邀请状态。" />
      </div>
    {:else}
      <div class="mt-4">
        <DataTable label="邀请" columns={['邮箱', '角色', '状态']} total={invitations.length}>
          {#snippet rows()}
            {#each invitations as invite (invite.id)}
              <tr class="border-b border-line">
                <td class="px-3 py-3">{invite.email}</td>
                <td class="px-3 py-3 text-muted">{roleLabel(invite.role)}</td>
                <td class="px-3 py-3 text-faint">{invitationStatus(invite.expiresAt)}</td>
              </tr>
            {/each}
          {/snippet}
        </DataTable>
      </div>
    {/if}
  </section>
{/if}

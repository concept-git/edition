<script lang="ts">
  import Button from '#lib/shared/ui/Button.svelte';
  import TextField from '#lib/shared/ui/TextField.svelte';
  import { invitationStatus, roleLabel, type Invitation, type TeamMember } from '../domain/membership';

  let {
    name,
    members,
    invitations,
    token,
    pending,
    onPlace
  }: {
    name: string;
    members: TeamMember[];
    invitations: Invitation[];
    token: string | null;
    pending: boolean;
    onPlace: (email: string) => Promise<boolean>;
  } = $props();

  let email = $state('');

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    const placed = await onPlace(email.trim());
    if (placed) email = '';
  }
</script>

<li class="rounded-card border border-line bg-surface p-5">
  <h2 class="text-base font-medium text-ink">{name}</h2>
  <ul aria-label="用户组成员" class="mt-3 flex flex-col gap-2">
    {#each members as member (member.id)}
      <li class="flex flex-wrap gap-3 text-sm text-ink">
        <span>{member.name}</span>
        <span>{roleLabel(member.role)}</span>
      </li>
    {/each}
  </ul>
  <form class="mt-4 flex flex-col gap-3" onsubmit={submit}>
    <TextField label="成员邮箱" type="email" required bind:value={email} />
    <div>
      <Button type="submit" disabled={pending}>放入</Button>
    </div>
  </form>
  {#if token}
    <div class="mt-4">
      <p class="text-xs text-muted">邀请令牌只显示这一次。</p>
      <p role="status" aria-label="邀请令牌" class="mt-1 break-all text-sm text-ink">{token}</p>
    </div>
  {/if}
  {#if invitations.length > 0}
    <ul aria-label="用户组邀请" class="mt-4 flex flex-col gap-2">
      {#each invitations as invite (invite.id)}
        <li class="flex flex-wrap gap-3 text-sm text-ink">
          <span>{invite.email}</span>
          <span>{roleLabel(invite.role)}</span>
          <span>{invitationStatus(invite.expiresAt)}</span>
        </li>
      {/each}
    </ul>
  {/if}
</li>

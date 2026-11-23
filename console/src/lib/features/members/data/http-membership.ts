import { api, type ApiResult } from '#lib/shared/api/client';
import { currentTenant as tenantOf } from '#lib/shared/api/tenant';
import type {
  IssuedInvitation,
  MemberRole,
  Page,
  Team,
  TeamMember,
  TenantMember,
  Invitation
} from '../domain/membership';

export async function currentTenant(token: string): Promise<ApiResult<string>> {
  const profile = await tenantOf(token);
  if (profile.ok) return profile;
  const context = await api<{ tenantId?: string | null }>(token, '/api/v1/auth/context');
  if (context.ok && context.body.tenantId) return { ok: true, status: context.status, body: context.body.tenantId, etag: context.etag };
  if (!context.ok) return profile.failure.status === 200 ? context : profile;
  return profile;
}

export function listMembers(token: string, tenantId: string) {
  return api<Page<TenantMember>>(token, `/api/v1/tenants/${tenantId}/members`);
}

export function listInvitations(token: string, tenantId: string) {
  return api<Page<Invitation>>(token, `/api/v1/tenants/${tenantId}/invitations`);
}

export function inviteMember(token: string, tenantId: string, email: string, role: MemberRole, idempotencyKey: string) {
  return api<IssuedInvitation>(token, `/api/v1/tenants/${tenantId}/invitations`, {
    method: 'POST',
    body: { email, role },
    idempotencyKey
  });
}

export function removeMember(token: string, tenantId: string, userId: string, idempotencyKey: string) {
  return api<void>(token, `/api/v1/tenants/${tenantId}/members/${userId}`, {
    method: 'DELETE',
    idempotencyKey
  });
}

export function listTeams(token: string, tenantId: string) {
  return api<Page<Team>>(token, `/api/v1/tenants/${tenantId}/teams`);
}

export function createTeam(token: string, tenantId: string, name: string, idempotencyKey: string) {
  return api<Team>(token, `/api/v1/tenants/${tenantId}/teams`, {
    method: 'POST',
    body: { name },
    idempotencyKey
  });
}

export function listTeamMembers(token: string, tenantId: string, teamId: string) {
  return api<Page<TeamMember>>(token, `/api/v1/tenants/${tenantId}/teams/${teamId}/members`);
}

export function listTeamInvitations(token: string, tenantId: string, teamId: string) {
  return api<Page<Invitation>>(token, `/api/v1/tenants/${tenantId}/teams/${teamId}/invitations`);
}

export function inviteTeamMember(
  token: string,
  tenantId: string,
  teamId: string,
  email: string,
  role: MemberRole,
  idempotencyKey: string
) {
  return api<IssuedInvitation>(token, `/api/v1/tenants/${tenantId}/teams/${teamId}/invitations`, {
    method: 'POST',
    body: { email, role },
    idempotencyKey
  });
}

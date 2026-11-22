export type MemberRole = 'owner' | 'member';

export type TenantMember = {
  id: string;
  name: string;
  role: string;
  joinedAt: string;
};

export type Invitation = {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  createdAt: string;
};

export type IssuedInvitation = {
  invite: Invitation;
  token: string;
};

export type Team = {
  id: string;
  tenantId: string;
  name: string;
  callerRole: string;
  memberCount: number;
  ownerCount: number;
  createdAt: string;
  updatedAt: string;
};

export type TeamMember = {
  id: string;
  name: string;
  avatar: string | null;
  email: string;
  role: string;
  joinedAt: string;
};

export type Page<T> = {
  items: T[];
  nextCursor: string | null;
};

export type Profile = {
  id: string;
  tenants?: Array<{ id: string; role?: string; status?: string }>;
};

export type MembershipFailure = {
  status: number;
  code: string | null;
  traceId: string | null;
  retryAfter: number | null;
};

/** The invitation list has no status field. A future expiresAt is still waiting to be accepted. */
export function invitationStatus(expiresAt: string, now = Date.now()): '待接受' | '已过期' {
  const expires = Date.parse(expiresAt);
  if (!Number.isFinite(expires) || expires > now) return '待接受';
  return '已过期';
}

export function roleLabel(role: string): string {
  return role === 'owner' ? '所有者' : '成员';
}

export function idempotencyKey(): string {
  return crypto.randomUUID();
}

export function retrySameIntent(status: number): boolean {
  return status === 0 || status >= 500;
}

export function membershipFailure(failure: MembershipFailure): string {
  if (failure.code === 'last_owner' || failure.code === 'team_last_owner') return '不能移除最后一位所有者。';
  if (failure.code === 'already_member') return '这位用户已经是成员。';
  if (failure.code === 'tenant_membership_required') return '只能放入当前租户的成员。';
  if (failure.status === 429) {
    return failure.retryAfter === null ? '尝试过于频繁，请稍后再试。' : `尝试过于频繁，请在 ${failure.retryAfter} 秒后再试。`;
  }
  if (failure.status === 0) return '网络失败。页面上的内容仍保留。';
  if (failure.traceId) return `没有完成。追踪号 ${failure.traceId}。`;
  return '没有完成。';
}

export function readFailure(failure: MembershipFailure, subject: string): string {
  if (failure.status === 429) {
    return failure.retryAfter === null ? `${subject}没有载入。请稍后再试。` : `${subject}没有载入。请在 ${failure.retryAfter} 秒后再试。`;
  }
  if (failure.status === 0) return `网络失败，${subject}没有载入。`;
  if (failure.traceId) return `${subject}没有载入。追踪号 ${failure.traceId}。`;
  return `${subject}没有载入。`;
}

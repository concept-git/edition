import type { ApiFailure } from '#lib/shared/api/client';

export type TokenKind = 'api' | 'management';

export type Profile = {
  tenants?: Array<{ id: string; name: string; role: string; status: string }>;
};

export type SpaceOption = { id: string; name: string };

export type SpacePage = { items: SpaceOption[] };

/** TokenView. `secret` is not part of the list shape. */
export type ApiTokenView = {
  id: string;
  name: string;
  ownerId: string;
  tenantId: string;
  spaceId: string;
  role: string;
  scopes: string[];
  expiry: string;
  status: string;
  createdAt: string;
};

export type ApiTokenPage = { tokens: ApiTokenView[] };

/** IssuedToken adds `secret` only on the 201 response. */
export type IssuedApiToken = ApiTokenView & { secret: string };

export type IssueApiTokenRequest = {
  name: string;
  spaceId: string;
  role: string;
  scopes: string[];
  expiry: string;
};

/** ManagementTokenView. List responses omit the secret. */
export type ManagementTokenView = {
  id: string;
  name: string;
  scopes: string[];
  tenantId: string | null;
  expiry: string;
  status: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

export type ManagementTokenPage = { items: ManagementTokenView[] };

/** IssuedManagementToken: the secret sits beside the view, not inside it. */
export type IssuedManagementToken = {
  token: ManagementTokenView;
  secret: string;
};

/**
 * IssueRequest from issueManagementToken.
 * Required: name, scopes, expiry. tenantId is optional and is omitted when the token is not narrowed.
 */
export type IssueManagementTokenRequest = {
  name: string;
  scopes: string[];
  expiry: string;
};

export type IntentKey = { key: string; fingerprint: string };

export const apiRoles = [
  { value: 'reader', label: '读者' },
  { value: 'author', label: '作者' },
  { value: 'maintainer', label: '维护者' },
  { value: 'admin', label: '管理员' }
] as const;

export const apiScopes = [
  { value: 'read', label: '读取' },
  { value: 'write', label: '写入' },
  { value: 'publish', label: '发布' }
] as const;

export const managementScopes = [
  { value: 'content:read', label: '内容读取' },
  { value: 'content:write', label: '内容写入' },
  { value: 'content:publish', label: '内容发布' },
  { value: 'members:read', label: '成员读取' },
  { value: 'members:write', label: '成员写入' },
  { value: 'permissions:read', label: '授权读取' },
  { value: 'permissions:write', label: '授权写入' },
  { value: 'hosting:read', label: '站点读取' },
  { value: 'hosting:write', label: '站点写入' },
  { value: 'audit:read', label: '审计读取' },
  { value: 'operations:read', label: '运维读取' },
  { value: 'operations:write', label: '运维写入' },
  { value: 'account:read', label: '账号读取' },
  { value: 'account:write', label: '账号写入' },
  { value: 'platform:read', label: '平台读取' },
  { value: 'platform:write', label: '平台写入' },
  { value: 'platform:erase', label: '平台注销' }
] as const;

export function expiryAfterDays(days: number, now = Date.now()): string {
  return new Date(now + days * 24 * 60 * 60 * 1000).toISOString();
}

export function sameIntentKey(current: IntentKey | null, fingerprint: string): IntentKey {
  if (current?.fingerprint === fingerprint) return current;
  return { key: crypto.randomUUID(), fingerprint };
}

export function chosenScopes(catalog: ReadonlyArray<{ value: string }>, selected: readonly string[]): string[] {
  return catalog.map((item) => item.value).filter((value) => selected.includes(value));
}

export function usability(status: string): string {
  if (status === 'active') return '可用';
  if (status === 'revoked') return '不可用';
  if (status === 'expired') return '已过期';
  return status;
}

export function roleLabel(role: string): string {
  return apiRoles.find((item) => item.value === role)?.label ?? role;
}

export function scopeLabel(kind: TokenKind, value: string): string {
  const catalog = kind === 'api' ? apiScopes : managementScopes;
  return catalog.find((item) => item.value === value)?.label ?? value;
}

export function tokenFailureMessage(failure: ApiFailure): string {
  if (failure.status === 0) return '网络失败。页面和已填写的内容仍保留。';
  if (failure.status === 429) {
    return failure.retryAfter === null ? '尝试过于频繁，请稍后再试。' : `尝试过于频繁，请在 ${failure.retryAfter} 秒后再试。`;
  }
  switch (failure.code) {
    case 'invalid_token_scope':
    case 'invalid_management_token_scope':
      return '范围不被接受。';
    case 'invalid_token_expiry':
      return '到期时间不被接受。';
    case 'invalid_token_role':
      return '角色不被接受。';
    case 'space_not_found':
      return '找不到该空间。';
    case 'token_not_found':
      return '找不到该令牌。';
    case 'idempotency_key_reused':
      return '这个幂等键已经用于另一份请求。';
    default:
      return failure.traceId ? `没有完成。追踪号 ${failure.traceId}。` : '没有完成。';
  }
}

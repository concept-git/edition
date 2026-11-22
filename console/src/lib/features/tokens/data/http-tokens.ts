import { api, type ApiResult } from '#lib/shared/api/client';
import type {
  ApiTokenPage,
  ApiTokenView,
  IssueApiTokenRequest,
  IssueManagementTokenRequest,
  IssuedApiToken,
  IssuedManagementToken,
  ManagementTokenPage,
  ManagementTokenView,
  Profile,
  SpaceOption,
  SpacePage
} from '../domain/token';

export type Issuer = { tenantId: string; spaces: SpaceOption[] };

export async function loadIssuer(token: string): Promise<ApiResult<Issuer>> {
  const profile = await api<Profile>(token, '/api/v1/me');
  if (!profile.ok) return profile;
  const tenants = profile.body.tenants ?? [];
  const tenant = tenants.find((item) => item.status === 'active') ?? tenants[0];
  if (!tenant) return { ok: false, failure: { status: 404, code: 'tenant_not_found', traceId: null, retryAfter: null } };
  const spaces = await api<SpacePage>(token, `/api/v1/tenants/${tenant.id}/spaces`);
  if (!spaces.ok) return spaces;
  return {
    ok: true,
    status: 200,
    etag: null,
    body: { tenantId: tenant.id, spaces: spaces.body.items.map((item) => ({ id: item.id, name: item.name })) }
  };
}

export async function listApiTokens(token: string, tenantId: string): Promise<ApiResult<ApiTokenPage>> {
  const result = await api<ApiTokenPage>(token, `/api/v1/tenants/${tenantId}/tokens`);
  if (!result.ok) return result;
  return { ...result, body: { ...result.body, tokens: result.body.tokens.map(withoutSecret) } };
}

export function issueApiToken(token: string, tenantId: string, body: IssueApiTokenRequest, idempotencyKey: string) {
  return api<IssuedApiToken>(token, `/api/v1/tenants/${tenantId}/tokens`, { method: 'POST', body, idempotencyKey });
}

export function revokeApiToken(token: string, tenantId: string, tokenId: string, idempotencyKey: string) {
  return api<void>(token, `/api/v1/tenants/${tenantId}/tokens/${tokenId}`, { method: 'DELETE', idempotencyKey });
}

export async function listManagementTokens(token: string): Promise<ApiResult<ManagementTokenPage>> {
  const result = await api<ManagementTokenPage>(token, '/api/v1/me/access-tokens');
  if (!result.ok) return result;
  return { ...result, body: { ...result.body, items: result.body.items.map(withoutSecret) } };
}

export function issueManagementToken(token: string, body: IssueManagementTokenRequest, idempotencyKey: string) {
  return api<IssuedManagementToken>(token, '/api/v1/me/access-tokens', { method: 'POST', body, idempotencyKey });
}

export function revokeManagementToken(token: string, tokenId: string, idempotencyKey: string) {
  return api<void>(token, `/api/v1/me/access-tokens/${tokenId}`, { method: 'DELETE', idempotencyKey });
}

function withoutSecret<T extends object>(value: T): T {
  if (!('secret' in value)) return value;
  const copy = { ...value };
  delete (copy as { secret?: unknown }).secret;
  return copy;
}

export type ListedApiToken = ApiTokenView;
export type ListedManagementToken = ManagementTokenView;

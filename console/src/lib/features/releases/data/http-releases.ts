import { api, type ApiResult } from '#lib/shared/api/client';
import { readBuild, readList, type ConfirmedBuild, type ReleaseSummary } from '../domain/release';

export async function resolveTenant(token: string): Promise<ApiResult<string>> {
  const me = await api<{ tenants?: Array<{ id?: unknown }> }>(token, '/api/v1/me');
  if (!me.ok) return me;
  const tenantId = me.body.tenants?.find((tenant) => typeof tenant.id === 'string')?.id;
  if (typeof tenantId !== 'string') return malformed(me.status);
  return { ok: true, status: me.status, body: tenantId, etag: me.etag };
}

export async function listReleases(token: string, tenantId: string, spaceId: string): Promise<ApiResult<ReleaseSummary[]>> {
  const result = await api<unknown>(token, collection(tenantId, spaceId));
  if (!result.ok) return result;
  const items = readList(result.body);
  if (!items) return malformed(result.status);
  return { ok: true, status: result.status, body: items, etag: result.etag };
}

export async function buildRelease(
  token: string,
  tenantId: string,
  spaceId: string,
  idempotencyKey: string
): Promise<ApiResult<ConfirmedBuild>> {
  const result = await api<unknown>(token, `${collection(tenantId, spaceId)}:build`, {
    method: 'POST',
    idempotencyKey
  });
  if (!result.ok) return result;
  const confirmed = readBuild(result.body);
  if (!confirmed) return malformed(result.status);
  return { ok: true, status: result.status, body: confirmed, etag: result.etag };
}

function collection(tenantId: string, spaceId: string) {
  return `/api/v1/tenants/${encodeURIComponent(tenantId)}/spaces/${encodeURIComponent(spaceId)}/releases`;
}

function malformed(status: number): ApiResult<never> {
  return { ok: false, failure: { status, code: null, traceId: null, retryAfter: null } };
}

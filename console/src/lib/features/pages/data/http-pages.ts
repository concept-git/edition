import { api, type ApiResult } from '#lib/shared/api/client';
import { readPages, type SpacePage } from '../domain/page';

export async function listPages(token: string, spaceId: string): Promise<ApiResult<SpacePage[]>> {
  const me = await api<{ tenants?: Array<{ id?: unknown }> }>(token, '/api/v1/me');
  if (!me.ok) return me;
  const tenantId = me.body.tenants?.find((tenant) => typeof tenant.id === 'string')?.id;
  if (typeof tenantId !== 'string') return malformed(me.status);
  const result = await api<unknown>(
    token,
    `/api/v1/tenants/${encodeURIComponent(tenantId)}/spaces/${encodeURIComponent(spaceId)}/pages`
  );
  if (!result.ok) return result;
  const pages = readPages(result.body);
  if (!pages) return malformed(result.status);
  return { ok: true, status: result.status, body: pages, etag: result.etag };
}

function malformed(status: number): ApiResult<never> {
  return { ok: false, failure: { status, code: null, traceId: null, retryAfter: null } };
}

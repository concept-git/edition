import { api, type ApiResult } from '#lib/shared/api/client';
import { readTrashedPage, type TrashedPage } from '../domain/trash';

type Profile = {
  tenants?: Array<{ id?: unknown }>;
};

const tenants = new Map<string, string>();

export async function resolveTenant(token: string): Promise<ApiResult<string>> {
  const cached = tenants.get(token);
  if (cached) return { ok: true, status: 200, body: cached, etag: null };
  const me = await api<Profile>(token, '/api/v1/me');
  if (!me.ok) return me;
  const tenantId = me.body.tenants?.find((tenant) => typeof tenant.id === 'string')?.id;
  if (typeof tenantId !== 'string') {
    return { ok: false, failure: { status: me.status, code: null, traceId: null, retryAfter: null } };
  }
  tenants.set(token, tenantId);
  return { ok: true, status: 200, body: tenantId, etag: null };
}

export async function listTrash(token: string, tenantId: string, spaceId: string): Promise<ApiResult<TrashedPage[]>> {
  const result = await api<{ items?: unknown }>(token, trashPath(tenantId, spaceId));
  if (!result.ok) return result;
  if (!Array.isArray(result.body.items)) return malformed(result.status);
  const items: TrashedPage[] = [];
  for (const item of result.body.items) {
    const page = readTrashedPage(item);
    if (!page) return malformed(result.status);
    items.push(page);
  }
  return { ok: true, status: result.status, body: items, etag: result.etag };
}

export async function restorePage(
  token: string,
  tenantId: string,
  spaceId: string,
  pageId: string,
  idempotencyKey: string
): Promise<ApiResult<true>> {
  const result = await api<unknown>(token, `${pagePath(tenantId, spaceId, pageId)}:restore`, {
    method: 'POST',
    idempotencyKey
  });
  if (!result.ok) return result;
  return { ok: true, status: result.status, body: true, etag: result.etag };
}

function trashPath(tenantId: string, spaceId: string) {
  return `/api/v1/tenants/${encodeURIComponent(tenantId)}/spaces/${encodeURIComponent(spaceId)}/trash`;
}

function pagePath(tenantId: string, spaceId: string, pageId: string) {
  return `/api/v1/tenants/${encodeURIComponent(tenantId)}/spaces/${encodeURIComponent(spaceId)}/pages/${encodeURIComponent(pageId)}`;
}

function malformed(status: number): ApiResult<never> {
  return { ok: false, failure: { status, code: null, traceId: null, retryAfter: null } };
}

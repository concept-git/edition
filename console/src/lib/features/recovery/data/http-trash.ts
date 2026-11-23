import { api, type ApiResult } from '#lib/shared/api/client';
import { readTrashedPage, type TrashedPage } from '../domain/trash';

export { currentTenant as resolveTenant } from '#lib/shared/api/tenant';


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

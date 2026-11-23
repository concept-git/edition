import { api, type ApiResult } from '#lib/shared/api/client';
import { readPage, readPageList, readTaggedList, type TaggedHit, type TagPageItem } from '../domain/tag';

export { currentTenant as resolveTenant } from '#lib/shared/api/tenant';


export async function listPages(token: string, tenantId: string, spaceId: string): Promise<ApiResult<TagPageItem[]>> {
  const result = await api<unknown>(token, `${spaceRoot(tenantId, spaceId)}/pages`);
  if (!result.ok) return result;
  const pages = readPageList(result.body);
  if (!pages) return malformed(result.status);
  return { ok: true, status: result.status, body: pages, etag: result.etag };
}

export async function tagPage(
  token: string,
  tenantId: string,
  spaceId: string,
  pageId: string,
  label: string,
  idempotencyKey: string
): Promise<ApiResult<TagPageItem>> {
  const path = `${spaceRoot(tenantId, spaceId)}/pages/${encodeURIComponent(pageId)}/tags/${encodeURIComponent(label)}`;
  const result = await api<unknown>(token, path, { method: 'PUT', idempotencyKey });
  if (!result.ok) return result;
  const page = readPage(result.body);
  if (!page) return malformed(result.status);
  return { ok: true, status: result.status, body: page, etag: result.etag };
}

export async function pagesByTag(token: string, tenantId: string, label: string): Promise<ApiResult<TaggedHit[]>> {
  const path = `/api/v1/tenants/${encodeURIComponent(tenantId)}/tags/${encodeURIComponent(label)}/pages`;
  const result = await api<unknown>(token, path);
  if (!result.ok) return result;
  const hits = readTaggedList(result.body);
  if (!hits) return malformed(result.status);
  return { ok: true, status: result.status, body: hits, etag: result.etag };
}

function spaceRoot(tenantId: string, spaceId: string) {
  return `/api/v1/tenants/${encodeURIComponent(tenantId)}/spaces/${encodeURIComponent(spaceId)}`;
}

function malformed(status: number): ApiResult<never> {
  return { ok: false, failure: { status, code: null, traceId: null, retryAfter: null } };
}

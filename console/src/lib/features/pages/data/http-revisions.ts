import { api, type ApiResult } from '#lib/shared/api/client';
import { readSource, type PageSource } from '../domain/page';
import { readRevisionDetail, readRevisionDiff, readRevisionList, type DiffLine, type RevisionDetail, type RevisionEntry } from '../domain/revision';

export async function listRevisions(token: string, tenantId: string, spaceId: string, pageId: string): Promise<ApiResult<RevisionEntry[]>> {
  const result = await api<unknown>(token, `${pagePath(tenantId, spaceId, pageId)}/revisions`);
  if (!result.ok) return result;
  const items = readRevisionList(result.body);
  if (!items) return malformed(result.status);
  return { ok: true, status: result.status, body: items, etag: result.etag };
}

export async function viewRevision(
  token: string,
  tenantId: string,
  spaceId: string,
  pageId: string,
  n: number
): Promise<ApiResult<RevisionDetail>> {
  const result = await api<unknown>(token, `${pagePath(tenantId, spaceId, pageId)}/revisions/${n}`);
  if (!result.ok) return result;
  const detail = readRevisionDetail(result.body);
  if (!detail) return malformed(result.status);
  return { ok: true, status: result.status, body: detail, etag: result.etag };
}

export async function diffRevisions(
  token: string,
  tenantId: string,
  spaceId: string,
  pageId: string,
  from: number,
  to: number
): Promise<ApiResult<DiffLine[]>> {
  const result = await api<unknown>(token, `${pagePath(tenantId, spaceId, pageId)}/revisions:diff?from=${from}&to=${to}`);
  if (!result.ok) return result;
  const lines = readRevisionDiff(result.body);
  if (!lines) return malformed(result.status);
  return { ok: true, status: result.status, body: lines, etag: result.etag };
}

export async function revertPage(
  token: string,
  tenantId: string,
  spaceId: string,
  pageId: string,
  n: number,
  ifMatch: string,
  idempotencyKey: string
): Promise<ApiResult<PageSource>> {
  const result = await api<unknown>(token, `${pagePath(tenantId, spaceId, pageId)}:revert`, {
    method: 'POST',
    body: { n },
    ifMatch,
    idempotencyKey
  });
  if (!result.ok) return result;
  const source = readSource(result.body, result.etag);
  if (!source) return malformed(result.status);
  return { ok: true, status: result.status, body: source, etag: result.etag };
}

function pagePath(tenantId: string, spaceId: string, pageId: string) {
  return `/api/v1/tenants/${encodeURIComponent(tenantId)}/spaces/${encodeURIComponent(spaceId)}/pages/${encodeURIComponent(pageId)}`;
}

function malformed(status: number): ApiResult<never> {
  return { ok: false, failure: { status, code: null, traceId: null, retryAfter: null } };
}

import { api, type ApiResult } from '#lib/shared/api/client';
import {
  readReadiness,
  readSource,
  readSummary,
  type PageFormat,
  type PageList,
  type PageReadiness,
  type PageSource,
  type SavedPage,
  type PageSummary
} from '../domain/page';

export { currentTenant as resolveTenant } from '#lib/shared/api/tenant';


export async function listPages(token: string, tenantId: string, spaceId: string): Promise<ApiResult<PageList>> {
  const result = await api<{ items?: unknown; allowedActions?: unknown }>(token, collection(tenantId, spaceId));
  if (!result.ok) return result;
  if (!Array.isArray(result.body.items)) return malformed(result.status);
  const items: PageSummary[] = [];
  for (const item of result.body.items) {
    const summary = readSummary(item);
    if (!summary) return malformed(result.status);
    items.push(summary);
  }
  const allowed = Array.isArray(result.body.allowedActions)
    ? result.body.allowedActions.filter((action) => typeof action === 'string')
    : [];
  return { ok: true, status: result.status, body: { items, canCreate: allowed.includes('create') }, etag: result.etag };
}

export async function createPage(
  token: string,
  tenantId: string,
  spaceId: string,
  input: { title: string; format: PageFormat; slug: string },
  idempotencyKey: string
): Promise<ApiResult<PageSummary>> {
  const result = await api<unknown>(token, collection(tenantId, spaceId), {
    method: 'POST',
    body: input,
    idempotencyKey
  });
  if (!result.ok) return result;
  const summary = readSummary(result.body);
  if (!summary) return malformed(result.status);
  return { ok: true, status: result.status, body: summary, etag: result.etag };
}

export async function viewPageContent(
  token: string,
  tenantId: string,
  spaceId: string,
  pageId: string
): Promise<ApiResult<PageSource>> {
  const result = await api<unknown>(token, contentPath(tenantId, spaceId, pageId));
  if (!result.ok) return result;
  const source = readSource(result.body, result.etag);
  if (!source) return malformed(result.status);
  return { ok: true, status: result.status, body: source, etag: result.etag };
}

export async function readSpaceMode(token: string, tenantId: string, spaceId: string): Promise<ApiResult<'authored' | 'synced'>> {
  const result = await api<{ mode?: unknown }>(token, spacePath(tenantId, spaceId));
  if (!result.ok) return result;
  const mode = result.body.mode;
  if (mode !== 'authored' && mode !== 'synced') return malformed(result.status);
  return { ok: true, status: result.status, body: mode, etag: result.etag };
}

export async function editPage(
  token: string,
  tenantId: string,
  spaceId: string,
  pageId: string,
  content: string,
  ifMatch: string,
  idempotencyKey: string,
  intent: 'draft_only' | 'hotfix'
): Promise<ApiResult<SavedPage>> {
  const result = await api<unknown>(token, contentPath(tenantId, spaceId, pageId), {
    method: 'PUT',
    body: { content, intent },
    ifMatch,
    idempotencyKey
  });
  if (!result.ok) return result;
  const source = readSource(result.body, result.etag);
  if (!source) return malformed(result.status);
  const drift = !!result.body && typeof result.body === 'object' && (result.body as { driftFlag?: unknown }).driftFlag === true;
  return { ok: true, status: result.status, body: { ...source, drift }, etag: result.etag };
}

export async function trashPage(
  token: string,
  tenantId: string,
  spaceId: string,
  pageId: string,
  idempotencyKey: string
): Promise<ApiResult<true>> {
  const result = await api<unknown>(token, `${pagePath(tenantId, spaceId, pageId)}:trash`, {
    method: 'POST',
    idempotencyKey
  });
  if (!result.ok) return result;
  return { ok: true, status: result.status, body: true, etag: result.etag };
}

export async function publishPage(
  token: string,
  tenantId: string,
  spaceId: string,
  pageId: string,
  idempotencyKey: string
): Promise<ApiResult<PageReadiness>> {
  return mark(token, tenantId, spaceId, pageId, 'publish', idempotencyKey);
}

export async function unpublishPage(
  token: string,
  tenantId: string,
  spaceId: string,
  pageId: string,
  idempotencyKey: string
): Promise<ApiResult<PageReadiness>> {
  return mark(token, tenantId, spaceId, pageId, 'unpublish', idempotencyKey);
}

async function mark(
  token: string,
  tenantId: string,
  spaceId: string,
  pageId: string,
  action: 'publish' | 'unpublish',
  idempotencyKey: string
): Promise<ApiResult<PageReadiness>> {
  const result = await api<{ page?: unknown }>(token, `${pagePath(tenantId, spaceId, pageId)}:${action}`, {
    method: 'POST',
    idempotencyKey
  });
  if (!result.ok) return result;
  const status = readReadiness(result.body.page);
  if (!status) return malformed(result.status);
  return { ok: true, status: result.status, body: status, etag: result.etag };
}

function spacePath(tenantId: string, spaceId: string) {
  return `/api/v1/tenants/${encodeURIComponent(tenantId)}/spaces/${encodeURIComponent(spaceId)}`;
}

function collection(tenantId: string, spaceId: string) {
  return `${spacePath(tenantId, spaceId)}/pages`;
}

function pagePath(tenantId: string, spaceId: string, pageId: string) {
  return `${collection(tenantId, spaceId)}/${encodeURIComponent(pageId)}`;
}

function contentPath(tenantId: string, spaceId: string, pageId: string) {
  return `${pagePath(tenantId, spaceId, pageId)}/content`;
}

function malformed(status: number): ApiResult<never> {
  return { ok: false, failure: { status, code: null, traceId: null, retryAfter: null } };
}

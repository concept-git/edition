import { api, type ApiResult } from '#lib/shared/api/client';
import { readSource, readSummary, type PageFormat, type PageList, type PageSource, type PageSummary } from '../domain/page';

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

export async function editPage(
  token: string,
  tenantId: string,
  spaceId: string,
  pageId: string,
  content: string,
  ifMatch: string,
  idempotencyKey: string
): Promise<ApiResult<PageSource>> {
  const result = await api<unknown>(token, contentPath(tenantId, spaceId, pageId), {
    method: 'PUT',
    body: { content },
    ifMatch,
    idempotencyKey
  });
  if (!result.ok) return result;
  const source = readSource(result.body, result.etag);
  if (!source) return malformed(result.status);
  return { ok: true, status: result.status, body: source, etag: result.etag };
}

export async function trashPage(
  token: string,
  tenantId: string,
  spaceId: string,
  pageId: string,
  idempotencyKey: string
): Promise<ApiResult<true>> {
  const result = await api<unknown>(token, `${collection(tenantId, spaceId)}/${encodeURIComponent(pageId)}:trash`, {
    method: 'POST',
    idempotencyKey
  });
  if (!result.ok) return result;
  return { ok: true, status: result.status, body: true, etag: result.etag };
}

function collection(tenantId: string, spaceId: string) {
  return `/api/v1/tenants/${encodeURIComponent(tenantId)}/spaces/${encodeURIComponent(spaceId)}/pages`;
}

function contentPath(tenantId: string, spaceId: string, pageId: string) {
  return `${collection(tenantId, spaceId)}/${encodeURIComponent(pageId)}/content`;
}

function malformed(status: number): ApiResult<never> {
  return { ok: false, failure: { status, code: null, traceId: null, retryAfter: null } };
}

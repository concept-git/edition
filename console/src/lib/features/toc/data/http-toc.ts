import { api, type ApiResult } from '#lib/shared/api/client';
import { readPages, readTree, type PageOption, type TocKind, type TocTree } from '../domain/toc';

export type AddEntry = {
  label: string;
  kind: TocKind;
  parentId: string | null;
  position: number;
  targetId?: string;
  url?: string;
};

export { currentTenant as resolveTenant } from '#lib/shared/api/tenant';


export async function viewToc(token: string, tenantId: string, spaceId: string): Promise<ApiResult<TocTree>> {
  const result = await api<unknown>(token, entriesPath(tenantId, spaceId));
  if (!result.ok) return result;
  const tree = readTree(result.body);
  if (!tree) return malformed(result.status);
  return { ok: true, status: result.status, body: tree, etag: result.etag };
}

export async function listTargetPages(token: string, tenantId: string, spaceId: string): Promise<ApiResult<PageOption[]>> {
  const result = await api<unknown>(token, `/api/v1/tenants/${encodeURIComponent(tenantId)}/spaces/${encodeURIComponent(spaceId)}/pages`);
  if (!result.ok) return result;
  const pages = readPages(result.body);
  if (!pages) return malformed(result.status);
  return { ok: true, status: result.status, body: pages, etag: result.etag };
}

export async function addTocEntry(
  token: string,
  tenantId: string,
  spaceId: string,
  input: AddEntry,
  idempotencyKey: string
): Promise<ApiResult<TocTree>> {
  const body: Record<string, unknown> = {
    label: input.label,
    kind: input.kind,
    position: input.position
  };
  if (input.parentId) body.parentId = input.parentId;
  if (input.kind === 'target') body.targetId = input.targetId;
  if (input.kind === 'link') body.url = input.url;
  return write(token, entriesPath(tenantId, spaceId), body, idempotencyKey);
}

export async function moveTocEntry(
  token: string,
  tenantId: string,
  spaceId: string,
  entryId: string,
  parentId: string | null,
  position: number,
  idempotencyKey: string
): Promise<ApiResult<TocTree>> {
  const body: Record<string, unknown> = { position };
  if (parentId) body.parentId = parentId;
  return write(token, `${entriesPath(tenantId, spaceId)}/${encodeURIComponent(entryId)}:move`, body, idempotencyKey);
}

async function write(token: string, path: string, body: Record<string, unknown>, idempotencyKey: string): Promise<ApiResult<TocTree>> {
  const result = await api<unknown>(token, path, { method: 'POST', body, idempotencyKey });
  if (!result.ok) return result;
  const tree = readTree(result.body);
  if (!tree) return malformed(result.status);
  return { ok: true, status: result.status, body: tree, etag: result.etag };
}

function entriesPath(tenantId: string, spaceId: string) {
  return `/api/v1/tenants/${encodeURIComponent(tenantId)}/spaces/${encodeURIComponent(spaceId)}/toc/entries`;
}

function malformed(status: number): ApiResult<never> {
  return { ok: false, failure: { status, code: null, traceId: null, retryAfter: null } };
}

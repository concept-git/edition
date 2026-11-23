import { api, type ApiFailure, type ApiResult } from '#lib/shared/api/client';
import type { SearchField, SiteList, SiteView, SpaceChoice } from '../domain/sites';

function broken(status: number): ApiResult<never> {
  const failure: ApiFailure = { status, code: null, traceId: null, retryAfter: null };
  return { ok: false, failure };
}

function tenantPath(tenant: string): string {
  return `/api/v1/tenants/${encodeURIComponent(tenant)}`;
}

export { currentTenant as currentTenant } from '#lib/shared/api/tenant';


export async function loadSiteList(token: string, tenant: string): Promise<ApiResult<SiteList>> {
  const result = await api<unknown>(token, `${tenantPath(tenant)}/sites`);
  if (!result.ok) return result;
  const list = readSiteList(result.body);
  if (!list) return broken(result.status);
  return { ok: true, status: result.status, body: list, etag: result.etag };
}

export async function createSite(token: string, tenant: string, name: string, idempotencyKey: string): Promise<ApiResult<SiteView>> {
  const result = await api<unknown>(token, `${tenantPath(tenant)}/sites`, {
    method: 'POST',
    body: { name },
    idempotencyKey
  });
  if (!result.ok) return result;
  const site = readSite(result.body);
  if (!site) return broken(result.status);
  return { ok: true, status: result.status, body: site, etag: result.etag };
}

export async function deleteSite(
  token: string,
  tenant: string,
  siteId: string,
  confirmationName: string,
  idempotencyKey: string
): Promise<ApiResult<true>> {
  const result = await api<unknown>(token, `${tenantPath(tenant)}/sites/${encodeURIComponent(siteId)}`, {
    method: 'DELETE',
    body: { confirmationName },
    idempotencyKey
  });
  if (!result.ok) return result;
  return { ok: true, status: result.status, body: true, etag: result.etag };
}

export async function loadSite(token: string, tenant: string, siteId: string): Promise<ApiResult<SiteView>> {
  const result = await api<unknown>(token, `${tenantPath(tenant)}/sites/${encodeURIComponent(siteId)}`);
  if (!result.ok) return result;
  const site = readSite(result.body);
  if (!site) return broken(result.status);
  return { ok: true, status: result.status, body: site, etag: result.etag };
}

export async function loadSpaces(token: string, tenant: string): Promise<ApiResult<SpaceChoice[]>> {
  const result = await api<unknown>(token, `${tenantPath(tenant)}/spaces`);
  if (!result.ok) return result;
  const spaces = readSpaces(result.body);
  if (!spaces) return broken(result.status);
  return { ok: true, status: result.status, body: spaces, etag: result.etag };
}

export async function mountSpace(
  token: string,
  tenant: string,
  siteId: string,
  slug: string,
  spaceId: string,
  idempotencyKey: string
): Promise<ApiResult<SiteView>> {
  const result = await api<unknown>(
    token,
    `${tenantPath(tenant)}/sites/${encodeURIComponent(siteId)}/mounts/${encodeURIComponent(slug)}`,
    { method: 'PUT', body: { spaceId }, idempotencyKey }
  );
  if (!result.ok) return result;
  const site = readSite(result.body);
  if (!site) return broken(result.status);
  return { ok: true, status: result.status, body: site, etag: result.etag };
}

export async function loadSearchFields(token: string, tenant: string, siteId: string): Promise<ApiResult<SearchField[]>> {
  const result = await api<unknown>(token, `${tenantPath(tenant)}/sites/${encodeURIComponent(siteId)}/search`);
  if (!result.ok) return result;
  const fields = readFields(result.body);
  if (!fields) return broken(result.status);
  return { ok: true, status: result.status, body: fields, etag: result.etag };
}

export async function saveSearchFields(
  token: string,
  tenant: string,
  siteId: string,
  fields: readonly SearchField[],
  idempotencyKey: string
): Promise<ApiResult<SearchField[]>> {
  const result = await api<unknown>(token, `${tenantPath(tenant)}/sites/${encodeURIComponent(siteId)}/search`, {
    method: 'PUT',
    body: { fields },
    idempotencyKey
  });
  if (!result.ok) return result;
  const saved = readFields(result.body);
  if (!saved) return broken(result.status);
  return { ok: true, status: result.status, body: saved, etag: result.etag };
}

function readSiteList(body: unknown): SiteList | null {
  if (!isRecord(body) || !Array.isArray(body.items)) return null;
  const items = [];
  for (const item of body.items) {
    if (!isRecord(item) || typeof item.id !== 'string' || typeof item.name !== 'string') return null;
    items.push({ id: item.id, name: item.name });
  }
  return { items, canCreate: includesAction(body.allowedActions, 'create') };
}

function readSite(body: unknown): SiteView | null {
  if (!isRecord(body) || typeof body.id !== 'string' || typeof body.name !== 'string' || !Array.isArray(body.mounts)) return null;
  const mounts = [];
  for (const mount of body.mounts) {
    if (!isRecord(mount) || typeof mount.spaceId !== 'string' || typeof mount.slug !== 'string') return null;
    mounts.push({ spaceId: mount.spaceId, slug: mount.slug });
  }
  return { id: body.id, name: body.name, mounts, canMount: includesAction(body.allowedActions, 'mount') };
}

function readSpaces(body: unknown): SpaceChoice[] | null {
  if (!isRecord(body) || !Array.isArray(body.items)) return null;
  const spaces = [];
  for (const item of body.items) {
    if (!isRecord(item) || typeof item.id !== 'string' || typeof item.name !== 'string') return null;
    spaces.push({ id: item.id, name: item.name });
  }
  return spaces;
}

function readFields(body: unknown): SearchField[] | null {
  if (!isRecord(body) || !Array.isArray(body.fields) || body.fields.length !== 3) return null;
  if (!body.fields.every(isSearchField)) return null;
  if (new Set(body.fields).size !== 3) return null;
  return [...body.fields];
}

function isSearchField(value: unknown): value is SearchField {
  return value === 'title' || value === 'headings' || value === 'body';
}

function includesAction(value: unknown, action: string): boolean {
  return Array.isArray(value) && value.includes(action);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

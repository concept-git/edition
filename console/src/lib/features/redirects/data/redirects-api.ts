import { api, type ApiFailure, type ApiResult } from '#lib/shared/api/client';
import type { MountAddress, PageAddress, RedirectRule } from '../domain/redirects';

function broken(status: number): ApiResult<never> {
  const failure: ApiFailure = { status, code: null, traceId: null, retryAfter: null };
  return { ok: false, failure };
}

function tenantPath(tenant: string): string {
  return `/api/v1/tenants/${encodeURIComponent(tenant)}`;
}

export { currentTenant as currentTenant } from '#lib/shared/api/tenant';


export async function loadMounts(token: string, tenant: string, siteId: string): Promise<ApiResult<MountAddress[]>> {
  const [site, spaces] = await Promise.all([
    api<unknown>(token, `${tenantPath(tenant)}/sites/${encodeURIComponent(siteId)}`),
    api<unknown>(token, `${tenantPath(tenant)}/spaces`)
  ]);
  if (!site.ok) return site;
  if (!spaces.ok) return spaces;
  const mounts = readMounts(site.body, spaces.body);
  if (!mounts) return broken(site.status);
  return { ok: true, status: site.status, body: mounts, etag: site.etag };
}

export async function loadPages(token: string, tenant: string, spaceId: string): Promise<ApiResult<PageAddress[]>> {
  const result = await api<unknown>(token, `${tenantPath(tenant)}/spaces/${encodeURIComponent(spaceId)}/pages`);
  if (!result.ok) return result;
  const pages = readPages(result.body, spaceId);
  if (!pages) return broken(result.status);
  return { ok: true, status: result.status, body: pages, etag: result.etag };
}

export async function loadRedirects(token: string, tenant: string, siteId: string): Promise<ApiResult<RedirectRule[]>> {
  const result = await api<unknown>(token, `${tenantPath(tenant)}/sites/${encodeURIComponent(siteId)}/redirects`);
  if (!result.ok) return result;
  const rules = readRedirects(result.body);
  if (!rules) return broken(result.status);
  return { ok: true, status: result.status, body: rules, etag: result.etag };
}

export async function remountSpace(
  token: string,
  tenant: string,
  siteId: string,
  slug: string,
  newSlug: string,
  idempotencyKey: string
): Promise<ApiResult<{ spaceId: string; slug: string }[]>> {
  const result = await api<unknown>(
    token,
    `${tenantPath(tenant)}/sites/${encodeURIComponent(siteId)}/mounts/${encodeURIComponent(slug)}:remount`,
    { method: 'POST', body: { newSlug }, idempotencyKey }
  );
  if (!result.ok) return result;
  const mounts = readSlugMounts(result.body);
  if (!mounts) return broken(result.status);
  return { ok: true, status: result.status, body: mounts, etag: result.etag };
}

export async function reslugPage(
  token: string,
  tenant: string,
  spaceId: string,
  pageId: string,
  slug: string,
  idempotencyKey: string
): Promise<ApiResult<PageAddress>> {
  const result = await api<unknown>(
    token,
    `${tenantPath(tenant)}/spaces/${encodeURIComponent(spaceId)}/pages/${encodeURIComponent(pageId)}:reslug`,
    { method: 'POST', body: { slug }, idempotencyKey }
  );
  if (!result.ok) return result;
  const page = readPage(result.body, spaceId);
  if (!page) return broken(result.status);
  return { ok: true, status: result.status, body: page, etag: result.etag };
}

export function deleteRedirect(token: string, tenant: string, siteId: string, path: string, idempotencyKey: string) {
  const query = new URLSearchParams({ path });
  return api<void>(token, `${tenantPath(tenant)}/sites/${encodeURIComponent(siteId)}/redirects?${query}`, {
    method: 'DELETE',
    idempotencyKey
  });
}

function readMounts(site: unknown, spaces: unknown): MountAddress[] | null {
  if (!isRecord(site) || !Array.isArray(site.mounts) || !isRecord(spaces) || !Array.isArray(spaces.items)) return null;
  const names = new Map<string, string>();
  for (const item of spaces.items) {
    if (!isRecord(item) || typeof item.id !== 'string' || typeof item.name !== 'string') return null;
    names.set(item.id, item.name);
  }
  const mounts: MountAddress[] = [];
  for (const mount of site.mounts) {
    if (!isRecord(mount) || typeof mount.spaceId !== 'string' || typeof mount.slug !== 'string') return null;
    mounts.push({ spaceId: mount.spaceId, slug: mount.slug, spaceName: names.get(mount.spaceId) ?? mount.spaceId });
  }
  return mounts;
}

function readSlugMounts(site: unknown): { spaceId: string; slug: string }[] | null {
  if (!isRecord(site) || !Array.isArray(site.mounts)) return null;
  const mounts = [];
  for (const mount of site.mounts) {
    if (!isRecord(mount) || typeof mount.spaceId !== 'string' || typeof mount.slug !== 'string') return null;
    mounts.push({ spaceId: mount.spaceId, slug: mount.slug });
  }
  return mounts;
}

function readPages(body: unknown, spaceId: string): PageAddress[] | null {
  if (!isRecord(body) || !Array.isArray(body.items)) return null;
  const pages: PageAddress[] = [];
  for (const item of body.items) {
    const page = readPage(item, spaceId);
    if (!page) return null;
    pages.push(page);
  }
  return pages;
}

function readPage(body: unknown, spaceId: string): PageAddress | null {
  if (!isRecord(body) || typeof body.id !== 'string' || typeof body.title !== 'string' || typeof body.slug !== 'string') return null;
  return { id: body.id, spaceId, title: body.title, slug: body.slug };
}

function readRedirects(body: unknown): RedirectRule[] | null {
  if (!isRecord(body) || !Array.isArray(body.items)) return null;
  const rules: RedirectRule[] = [];
  for (const item of body.items) {
    if (!isRecord(item) || typeof item.path !== 'string' || typeof item.targetId !== 'string') return null;
    if (item.targetType !== 'space' && item.targetType !== 'page') return null;
    if (item.origin !== 'auto' && item.origin !== 'manual') return null;
    rules.push({
      path: item.path,
      targetId: item.targetId,
      targetType: item.targetType,
      origin: item.origin,
      currentPath: typeof item.currentPath === 'string' ? item.currentPath : null,
      targetLabel: typeof item.targetLabel === 'string' ? item.targetLabel : null
    });
  }
  return rules;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

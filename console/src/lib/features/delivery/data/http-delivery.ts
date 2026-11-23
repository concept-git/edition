import { api, type ApiResult } from '#lib/shared/api/client';
import { readDelivery, readMounts, readSiteName, type SiteRollout } from '../domain/delivery';

export { currentTenant as resolveTenant } from '#lib/shared/api/tenant';


export async function loadRollouts(token: string, tenantId: string, spaceId: string): Promise<ApiResult<SiteRollout[]>> {
  const listed = await api<unknown>(token, mountsPath(tenantId, spaceId));
  if (!listed.ok) return listed;
  const mounts = readMounts(listed.body);
  if (!mounts) return malformed(listed.status);
  const rows = await Promise.all(mounts.map((mount) => readRollout(token, tenantId, mount.siteId, mount.slug)));
  for (const row of rows) {
    if (!row.ok) return row;
  }
  return { ok: true, status: listed.status, body: rows.flatMap((row) => (row.ok ? [row.body] : [])), etag: listed.etag };
}

async function readRollout(token: string, tenantId: string, siteId: string, slug: string): Promise<ApiResult<SiteRollout>> {
  const [site, delivery] = await Promise.all([
    api<unknown>(token, sitePath(tenantId, siteId)),
    api<unknown>(token, `${sitePath(tenantId, siteId)}/delivery`)
  ]);
  if (!delivery.ok) return delivery;
  const snapshot = readDelivery(delivery.body);
  if (!snapshot) return malformed(delivery.status);
  const name = site.ok ? readSiteName(site.body) : null;
  return {
    ok: true,
    status: delivery.status,
    body: { siteId, name: name ?? slug, slug, ...snapshot },
    etag: delivery.etag
  };
}

function mountsPath(tenantId: string, spaceId: string) {
  return `/api/v1/tenants/${encodeURIComponent(tenantId)}/spaces/${encodeURIComponent(spaceId)}/mounts`;
}

function sitePath(tenantId: string, siteId: string) {
  return `/api/v1/tenants/${encodeURIComponent(tenantId)}/sites/${encodeURIComponent(siteId)}`;
}

function malformed(status: number): ApiResult<never> {
  return { ok: false, failure: { status, code: null, traceId: null, retryAfter: null } };
}

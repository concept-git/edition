import { api, type ApiFailure, type ApiResult } from '#lib/shared/api/client';
import type { DomainDetail, DomainList } from '../domain/domains';

function broken(status: number): ApiResult<never> {
  const failure: ApiFailure = { status, code: null, traceId: null, retryAfter: null };
  return { ok: false, failure };
}

function tenantPath(tenant: string): string {
  return `/api/v1/tenants/${encodeURIComponent(tenant)}`;
}

function siteDomains(tenant: string, siteId: string): string {
  return `${tenantPath(tenant)}/sites/${encodeURIComponent(siteId)}/domains`;
}

export { currentTenant as currentTenant } from '#lib/shared/api/tenant';


export async function listDomains(token: string, tenant: string, siteId: string): Promise<ApiResult<DomainList>> {
  const result = await api<unknown>(token, `${tenantPath(tenant)}/domains?siteId=${encodeURIComponent(siteId)}`);
  if (!result.ok) return result;
  const list = readList(result.body, siteId);
  if (!list) return broken(result.status);
  return { ok: true, status: result.status, body: list, etag: result.etag };
}

export async function viewDomain(token: string, tenant: string, siteId: string, host: string): Promise<ApiResult<DomainDetail>> {
  const result = await api<unknown>(token, `${siteDomains(tenant, siteId)}/${encodeURIComponent(host)}`);
  if (!result.ok) return result;
  const domain = readDetail(result.body);
  if (!domain) return broken(result.status);
  return { ok: true, status: result.status, body: domain, etag: result.etag };
}

export async function bindDomain(
  token: string,
  tenant: string,
  siteId: string,
  host: string,
  idempotencyKey: string
): Promise<ApiResult<DomainDetail>> {
  const result = await api<unknown>(token, siteDomains(tenant, siteId), {
    method: 'POST',
    body: { host },
    idempotencyKey
  });
  if (!result.ok) return result;
  const domain = readDetail(result.body);
  if (!domain) return broken(result.status);
  return { ok: true, status: result.status, body: domain, etag: result.etag };
}

export async function verifyDomain(
  token: string,
  tenant: string,
  siteId: string,
  host: string,
  idempotencyKey: string
): Promise<ApiResult<DomainDetail>> {
  const result = await api<unknown>(token, `${siteDomains(tenant, siteId)}/${encodeURIComponent(host)}:verify`, {
    method: 'POST',
    idempotencyKey
  });
  if (!result.ok) return result;
  const domain = readDetail(result.body);
  if (!domain) return broken(result.status);
  return { ok: true, status: result.status, body: domain, etag: result.etag };
}

export async function setPrimaryDomain(
  token: string,
  tenant: string,
  siteId: string,
  host: string,
  idempotencyKey: string
): Promise<ApiResult<DomainDetail>> {
  const result = await api<unknown>(token, `${siteDomains(tenant, siteId)}/${encodeURIComponent(host)}:setPrimary`, {
    method: 'POST',
    idempotencyKey
  });
  if (!result.ok) return result;
  const domain = readDetail(result.body);
  if (!domain) return broken(result.status);
  return { ok: true, status: result.status, body: domain, etag: result.etag };
}

function readList(body: unknown, siteId: string): DomainList | null {
  if (!isRecord(body) || !Array.isArray(body.items) || !Array.isArray(body.sites)) return null;
  const items = [];
  for (const item of body.items) {
    if (!isRecord(item) || typeof item.host !== 'string' || typeof item.verified !== 'boolean' || typeof item.isPrimary !== 'boolean') {
      return null;
    }
    items.push({
      host: item.host,
      verified: item.verified,
      isPrimary: item.isPrimary,
      canUpdate: includesAction(item.allowedActions, 'update')
    });
  }
  const site = body.sites.find((entry) => isRecord(entry) && entry.id === siteId);
  return { items, canBind: isRecord(site) && includesAction(site.allowedActions, 'bind') };
}

function readDetail(body: unknown): DomainDetail | null {
  if (!isRecord(body) || typeof body.host !== 'string') return null;
  if (typeof body.verified !== 'boolean' || typeof body.isPrimary !== 'boolean') return null;
  if (typeof body.txtName !== 'string' || body.txtName.length === 0) return null;
  if (typeof body.txtValue !== 'string' || body.txtValue.length === 0) return null;
  return {
    host: body.host,
    verified: body.verified,
    isPrimary: body.isPrimary,
    txtName: body.txtName,
    txtValue: body.txtValue
  };
}

function includesAction(value: unknown, action: string): boolean {
  return Array.isArray(value) && value.includes(action);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

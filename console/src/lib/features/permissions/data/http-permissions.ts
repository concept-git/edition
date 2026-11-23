import { api, type ApiFailure, type ApiResult } from '#lib/shared/api/client';
import {
  isPermissionRole,
  operationsFor,
  restrictionMatch,
  type Grant,
  type PagePermission,
  type PermissionPage,
  type PermissionRole,
  type Principal,
  type ResourceKind
} from '../domain/access';

function broken(status: number): ApiResult<never> {
  const failure: ApiFailure = { status, code: null, traceId: null, retryAfter: null };
  return { ok: false, failure };
}

function tenantPath(tenant: string): string {
  return `/api/v1/tenants/${encodeURIComponent(tenant)}`;
}

function resourcePath(tenant: string, kind: ResourceKind, id: string): string {
  return `${tenantPath(tenant)}/${kind}/${encodeURIComponent(id)}`;
}

export { currentTenant as currentTenant } from '#lib/shared/api/tenant';


export async function listGrants(token: string, tenant: string, kind: ResourceKind, id: string): Promise<ApiResult<Grant[]>> {
  const result = await api<unknown>(token, `${resourcePath(tenant, kind, id)}/permissions`);
  if (!result.ok) return result;
  const grants = readGrants(result.body);
  if (!grants) return broken(result.status);
  return { ok: true, status: result.status, body: grants, etag: result.etag };
}

export async function searchPrincipals(
  token: string,
  tenant: string,
  kind: ResourceKind,
  id: string,
  query: string
): Promise<ApiResult<Principal[]>> {
  const result = await api<unknown>(
    token,
    `${resourcePath(tenant, kind, id)}/permissions/principals/users?q=${encodeURIComponent(query)}`
  );
  if (!result.ok) return result;
  const people = readPrincipals(result.body);
  if (!people) return broken(result.status);
  return { ok: true, status: result.status, body: people, etag: result.etag };
}

export async function putGrant(
  token: string,
  tenant: string,
  kind: ResourceKind,
  id: string,
  principalKey: string,
  role: PermissionRole
): Promise<ApiResult<Grant>> {
  const result = await api<unknown>(
    token,
    `${resourcePath(tenant, kind, id)}/permissions/grants/${encodeURIComponent(principalKey)}`,
    { method: 'PUT', body: { role } }
  );
  if (!result.ok) return result;
  const grant = readGrant(result.body);
  if (!grant) return broken(result.status);
  return { ok: true, status: result.status, body: grant, etag: result.etag };
}

export async function listPermissionPages(token: string, tenant: string, spaceId: string): Promise<ApiResult<PermissionPage[]>> {
  const result = await api<unknown>(token, `${resourcePath(tenant, 'spaces', spaceId)}/permissions/pages`);
  if (!result.ok) return result;
  const pages = readPages(result.body);
  if (!pages) return broken(result.status);
  return { ok: true, status: result.status, body: pages, etag: result.etag };
}

export async function viewPagePermission(
  token: string,
  tenant: string,
  spaceId: string,
  pageId: string
): Promise<ApiResult<PagePermission>> {
  const result = await api<unknown>(
    token,
    `${resourcePath(tenant, 'spaces', spaceId)}/pages/${encodeURIComponent(pageId)}/permissions`
  );
  if (!result.ok) return result;
  const permission = readPagePermission(result.body);
  if (!permission) return broken(result.status);
  return { ok: true, status: result.status, body: permission, etag: result.etag };
}

export async function putPageRestriction(
  token: string,
  tenant: string,
  spaceId: string,
  pageId: string,
  principals: readonly string[],
  revision: number
): Promise<ApiResult<PagePermission>> {
  const result = await api<unknown>(
    token,
    `${resourcePath(tenant, 'spaces', spaceId)}/pages/${encodeURIComponent(pageId)}/permissions/restriction`,
    {
      method: 'PUT',
      body: { principals },
      ifMatch: restrictionMatch(revision)
    }
  );
  if (!result.ok) return result;
  const permission = readPagePermission(result.body);
  if (!permission) return broken(result.status);
  return { ok: true, status: result.status, body: permission, etag: result.etag };
}

function readGrants(body: unknown): Grant[] | null {
  if (!isRecord(body) || !Array.isArray(body.items)) return null;
  const grants: Grant[] = [];
  for (const item of body.items) {
    const grant = readGrant(item);
    if (!grant) return null;
    grants.push(grant);
  }
  return grants;
}

function readGrant(body: unknown): Grant | null {
  if (!isRecord(body) || typeof body.role !== 'string' || !isPermissionRole(body.role)) return null;
  const principal = readPrincipal(body.principal);
  if (!principal) return null;
  const operations = Array.isArray(body.operations)
    ? body.operations.filter((item): item is string => typeof item === 'string')
    : [...operationsFor(body.role)];
  return { principal, role: body.role, operations };
}

function readPrincipals(body: unknown): Principal[] | null {
  if (!isRecord(body) || !Array.isArray(body.items)) return null;
  const people: Principal[] = [];
  for (const item of body.items) {
    const principal = readPrincipal(item);
    if (!principal) return null;
    people.push(principal);
  }
  return people;
}

function readPrincipal(body: unknown): Principal | null {
  if (!isRecord(body) || typeof body.key !== 'string' || typeof body.name !== 'string') return null;
  return { key: body.key, name: body.name };
}

function readPages(body: unknown): PermissionPage[] | null {
  if (!isRecord(body) || !Array.isArray(body.items)) return null;
  const pages: PermissionPage[] = [];
  for (const item of body.items) {
    if (!isRecord(item) || typeof item.id !== 'string' || typeof item.title !== 'string') return null;
    pages.push({ id: item.id, title: item.title });
  }
  return pages;
}

function readPagePermission(body: unknown): PagePermission | null {
  if (!isRecord(body) || typeof body.pageId !== 'string' || !isRecord(body.restriction)) return null;
  const restriction = body.restriction;
  if (typeof restriction.active !== 'boolean' || typeof restriction.revision !== 'number' || !Array.isArray(restriction.principals)) {
    return null;
  }
  const principals: Principal[] = [];
  for (const item of restriction.principals) {
    const principal = readPrincipal(item);
    if (!principal) return null;
    principals.push(principal);
  }
  return { pageId: body.pageId, active: restriction.active, revision: restriction.revision, principals };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

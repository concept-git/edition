import { api, type ApiResult } from '#lib/shared/api/client';
import type {
  ContentTypeState,
  ContentTypeVersion,
  PluginCatalog,
  TypeList,
  VersionList
} from '../domain/content-type';

type Profile = {
  tenants?: Array<{ id?: unknown }>;
};

type RegisterBody = {
  contentType: string;
  baseRevision: number;
  definition: ContentTypeVersion['definition'];
};

type ActivateBody = {
  contentType: string;
  baseRevision: number;
  versionRef: string;
};

type DeactivateBody = {
  contentType: string;
  baseRevision: number;
};

export async function resolveTenant(token: string): Promise<ApiResult<string>> {
  const me = await api<Profile>(token, '/api/v1/me');
  if (!me.ok) return me;
  const tenantId = me.body.tenants?.find((tenant) => typeof tenant.id === 'string')?.id;
  if (typeof tenantId !== 'string') {
    return { ok: false, failure: { status: me.status, code: null, traceId: null, retryAfter: null } };
  }
  return { ok: true, status: me.status, body: tenantId, etag: me.etag };
}

export function listContentTypes(token: string, tenantId: string) {
  return api<TypeList>(token, `${tenantBase(tenantId)}/content-types`);
}

export function listContentTypeVersions(token: string, tenantId: string, contentType: string) {
  const query = new URLSearchParams({ contentType });
  return api<VersionList>(token, `${tenantBase(tenantId)}/content-types/versions?${query}`);
}

export function viewContentTypeVersion(token: string, tenantId: string, versionRef: string) {
  return api<ContentTypeVersion>(token, `${tenantBase(tenantId)}/content-types/versions/${encodeURIComponent(versionRef)}`);
}

export function registerContentTypeVersion(token: string, tenantId: string, body: RegisterBody, idempotencyKey: string) {
  return api<ContentTypeVersion>(token, `${tenantBase(tenantId)}/content-types/versions`, {
    method: 'POST',
    body,
    idempotencyKey
  });
}

export function activateContentType(token: string, tenantId: string, body: ActivateBody, idempotencyKey: string) {
  return api<ContentTypeState>(token, `${tenantBase(tenantId)}/content-types/activate`, {
    method: 'POST',
    body,
    idempotencyKey
  });
}

export function deactivateContentType(token: string, tenantId: string, body: DeactivateBody, idempotencyKey: string) {
  return api<ContentTypeState>(token, `${tenantBase(tenantId)}/content-types/deactivate`, {
    method: 'POST',
    body,
    idempotencyKey
  });
}

export function contentPluginCatalog(token: string, tenantId: string) {
  return api<PluginCatalog>(token, `${tenantBase(tenantId)}/content-plugins`);
}

function tenantBase(tenantId: string) {
  return `/api/v1/tenants/${encodeURIComponent(tenantId)}`;
}

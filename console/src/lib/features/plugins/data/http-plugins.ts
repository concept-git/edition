import { api, type ApiResult } from '#lib/shared/api/client';
import type { CompilePluginRequest, ContentTypeState, Development, PluginSource, SavePluginRequest } from '../domain/plugin';

export type PluginWorkspace = {
  tenantId: string;
  development: Development | null;
  types: ContentTypeState[];
};

type DevelopmentList = { items?: Array<{ id?: string }> };
type TypeList = { items?: ContentTypeState[] };

export async function loadPluginWorkspace(token: string): Promise<ApiResult<PluginWorkspace>> {
  const tenant = await currentTenant(token);
  if (!tenant.ok) return tenant;
  const types = await listContentTypes(token, tenant.body);
  if (!types.ok) return types;
  const listed = await api<DevelopmentList>(token, `${tenantPath(tenant.body)}/plugin-developments`);
  if (!listed.ok) return listed;
  const id = listed.body.items?.find((item) => typeof item.id === 'string')?.id;
  if (!id) return ready(tenant.body, null, types.body);
  const development = await api<Development>(token, `${tenantPath(tenant.body)}/plugin-developments/${id}`);
  if (!development.ok) return development;
  if (!readable(development.body)) {
    return { ok: false, failure: { status: development.status, code: null, traceId: null, retryAfter: null } };
  }
  return ready(tenant.body, development.body, types.body);
}

export function savePluginDevelopment(
  token: string,
  tenantId: string,
  id: string,
  body: SavePluginRequest,
  idempotencyKey: string
) {
  return api<Development>(token, `${tenantPath(tenantId)}/plugin-developments/${id}`, {
    method: 'PUT',
    body,
    idempotencyKey
  });
}

export function compilePluginCandidate(
  token: string,
  tenantId: string,
  id: string,
  body: CompilePluginRequest,
  idempotencyKey: string
) {
  return api<unknown>(token, `${tenantPath(tenantId)}/plugin-developments/${id}/candidates`, {
    method: 'POST',
    body,
    idempotencyKey
  });
}

export async function listContentTypes(token: string, tenantId: string): Promise<ApiResult<ContentTypeState[]>> {
  const result = await api<TypeList>(token, `${tenantPath(tenantId)}/content-types`);
  if (!result.ok) return result;
  const items = (result.body.items ?? []).filter(readableType);
  return { ok: true, status: result.status, body: items, etag: result.etag };
}

async function currentTenant(token: string): Promise<ApiResult<string>> {
  const result = await api<{ tenants?: Array<{ id?: unknown }> }>(token, '/api/v1/me');
  if (!result.ok) return result;
  const id = result.body.tenants?.[0]?.id;
  if (typeof id !== 'string' || id.length === 0) {
    return { ok: false, failure: { status: 404, code: 'tenant_not_found', traceId: null, retryAfter: null } };
  }
  return { ok: true, status: result.status, body: id, etag: result.etag };
}

function ready(tenantId: string, development: Development | null, types: ContentTypeState[]): ApiResult<PluginWorkspace> {
  return { ok: true, status: 200, body: { tenantId, development, types }, etag: null };
}

function tenantPath(tenantId: string) {
  return `/api/v1/tenants/${encodeURIComponent(tenantId)}`;
}

function readable(value: Development): boolean {
  return (
    typeof value?.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.contentType === 'string' &&
    typeof value.revision === 'number' &&
    typeof value.sourceDigest === 'string' &&
    readableSource(value.source)
  );
}

function readableSource(source: PluginSource): boolean {
  return !!source && typeof source.files === 'object' && source.files !== null && typeof source.manifest === 'string';
}

function readableType(value: ContentTypeState): boolean {
  return typeof value?.contentType === 'string' && typeof value.label === 'string';
}

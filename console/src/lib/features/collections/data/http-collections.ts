import { api, type ApiResult } from '#lib/shared/api/client';
import { readSpace, readSpaceList, readTree, type CollectionTree, type PlaceableSpace } from '../domain/collection';

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

export async function viewCollections(token: string, tenantId: string): Promise<ApiResult<CollectionTree>> {
  const result = await api<unknown>(token, collectionRoot(tenantId));
  if (!result.ok) return result;
  const tree = readTree(result.body);
  if (!tree) return malformed(result.status);
  return { ok: true, status: result.status, body: tree, etag: result.etag };
}

export async function listPlaceableSpaces(token: string, tenantId: string): Promise<ApiResult<PlaceableSpace[]>> {
  const result = await api<unknown>(token, `/api/v1/tenants/${encodeURIComponent(tenantId)}/spaces`);
  if (!result.ok) return result;
  const spaces = readSpaceList(result.body);
  if (!spaces) return malformed(result.status);
  return { ok: true, status: result.status, body: spaces, etag: result.etag };
}

export async function createCollection(
  token: string,
  tenantId: string,
  input: { name: string; parentId: string | null },
  idempotencyKey: string
): Promise<ApiResult<CollectionTree>> {
  const body = input.parentId ? { name: input.name, parentId: input.parentId } : { name: input.name };
  const result = await api<unknown>(token, collectionRoot(tenantId), { method: 'POST', body, idempotencyKey });
  if (!result.ok) return result;
  const tree = readTree(result.body);
  if (!tree) return malformed(result.status);
  return { ok: true, status: result.status, body: tree, etag: result.etag };
}

export async function placeSpace(
  token: string,
  tenantId: string,
  collectionId: string,
  spaceId: string,
  idempotencyKey: string
): Promise<ApiResult<PlaceableSpace>> {
  const path = `${collectionRoot(tenantId)}/${encodeURIComponent(collectionId)}/spaces/${encodeURIComponent(spaceId)}`;
  const result = await api<unknown>(token, path, { method: 'PUT', body: { position: 0 }, idempotencyKey });
  if (!result.ok) return result;
  const space = readSpace(result.body);
  if (!space) return malformed(result.status);
  return { ok: true, status: result.status, body: space, etag: result.etag };
}

function collectionRoot(tenantId: string) {
  return `/api/v1/tenants/${encodeURIComponent(tenantId)}/collections`;
}

function malformed(status: number): ApiResult<never> {
  return { ok: false, failure: { status, code: null, traceId: null, retryAfter: null } };
}

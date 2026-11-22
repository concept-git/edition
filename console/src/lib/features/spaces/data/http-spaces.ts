import { api, type ApiResult } from '#lib/shared/api/client';
import { readDetail, readSummary, type SpaceDetail, type SpaceList, type SpaceMode } from '../domain/space';

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

export async function listSpaces(token: string, tenantId: string): Promise<ApiResult<SpaceList>> {
  const result = await api<{ items?: unknown; allowedActions?: unknown }>(token, spaceCollection(tenantId));
  if (!result.ok) return result;
  if (!Array.isArray(result.body.items)) return malformed(result.status);
  const items = [];
  for (const item of result.body.items) {
    const summary = readSummary(item);
    if (!summary) return malformed(result.status);
    items.push(summary);
  }
  const allowed = Array.isArray(result.body.allowedActions)
    ? result.body.allowedActions.filter((action) => typeof action === 'string')
    : [];
  return {
    ok: true,
    status: result.status,
    body: { items, canCreate: allowed.includes('create') },
    etag: result.etag
  };
}

export async function createSpace(
  token: string,
  tenantId: string,
  input: { name: string; mode: SpaceMode },
  idempotencyKey: string
): Promise<ApiResult<SpaceDetail>> {
  const result = await api<unknown>(token, spaceCollection(tenantId), {
    method: 'POST',
    body: input,
    idempotencyKey
  });
  if (!result.ok) return result;
  const detail = readDetail(result.body);
  if (!detail) return malformed(result.status);
  return { ok: true, status: result.status, body: detail, etag: result.etag };
}

export async function viewSpace(token: string, tenantId: string, spaceId: string): Promise<ApiResult<SpaceDetail>> {
  const result = await api<unknown>(token, spaceResource(tenantId, spaceId));
  if (!result.ok) return result;
  const detail = readDetail(result.body);
  if (!detail) return malformed(result.status);
  return { ok: true, status: result.status, body: detail, etag: result.etag };
}

export async function updateAutoRelease(
  token: string,
  tenantId: string,
  spaceId: string,
  autoRelease: boolean,
  idempotencyKey: string
): Promise<ApiResult<SpaceDetail>> {
  const result = await api<unknown>(token, spaceResource(tenantId, spaceId), {
    method: 'PATCH',
    body: { autoRelease },
    idempotencyKey
  });
  if (!result.ok) return result;
  const detail = readDetail(result.body);
  if (!detail) return malformed(result.status);
  return { ok: true, status: result.status, body: detail, etag: result.etag };
}

export async function archiveSpace(
  token: string,
  tenantId: string,
  spaceId: string,
  idempotencyKey: string
): Promise<ApiResult<SpaceDetail>> {
  const result = await api<unknown>(token, `${spaceResource(tenantId, spaceId)}:archive`, {
    method: 'POST',
    idempotencyKey
  });
  if (!result.ok) return result;
  const detail = readDetail(result.body);
  if (!detail) return malformed(result.status);
  return { ok: true, status: result.status, body: detail, etag: result.etag };
}

export async function deleteSpace(
  token: string,
  tenantId: string,
  spaceId: string,
  confirmationName: string,
  idempotencyKey: string
): Promise<ApiResult<true>> {
  const result = await api<unknown>(token, spaceResource(tenantId, spaceId), {
    method: 'DELETE',
    body: { confirmationName },
    idempotencyKey
  });
  if (!result.ok) return result;
  return { ok: true, status: result.status, body: true, etag: result.etag };
}

function spaceCollection(tenantId: string) {
  return `/api/v1/tenants/${encodeURIComponent(tenantId)}/spaces`;
}

function spaceResource(tenantId: string, spaceId: string) {
  return `${spaceCollection(tenantId)}/${encodeURIComponent(spaceId)}`;
}

function malformed(status: number): ApiResult<never> {
  return { ok: false, failure: { status, code: null, traceId: null, retryAfter: null } };
}

import { api, type ApiResult } from '#lib/shared/api/client';
import { readDetail, readSummary, type SpaceDetail, type SpaceList, type SpaceMode } from '../domain/space';

export { currentTenant as resolveTenant } from '#lib/shared/api/tenant';


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

import { api, type ApiResult } from '#lib/shared/api/client';
import {
  readBuild,
  readList,
  readPreviewDocument,
  readPreviewPages,
  readSummary,
  type ConfirmedBuild,
  type PreviewDocument,
  type PreviewPage,
  type ReleaseSummary
} from '../domain/release';

export async function resolveTenant(token: string): Promise<ApiResult<string>> {
  const me = await api<{ tenants?: Array<{ id?: unknown }> }>(token, '/api/v1/me');
  if (!me.ok) return me;
  const tenantId = me.body.tenants?.find((tenant) => typeof tenant.id === 'string')?.id;
  if (typeof tenantId !== 'string') return malformed(me.status);
  return { ok: true, status: me.status, body: tenantId, etag: me.etag };
}

export async function listReleases(token: string, tenantId: string, spaceId: string): Promise<ApiResult<ReleaseSummary[]>> {
  const result = await api<unknown>(token, collection(tenantId, spaceId));
  if (!result.ok) return result;
  const items = readList(result.body);
  if (!items) return malformed(result.status);
  return { ok: true, status: result.status, body: items, etag: result.etag };
}

export async function approveRelease(
  token: string,
  tenantId: string,
  spaceId: string,
  releaseId: string,
  idempotencyKey: string
): Promise<ApiResult<ReleaseSummary>> {
  const result = await api<unknown>(token, `${collection(tenantId, spaceId)}/${encodeURIComponent(releaseId)}:approve`, {
    method: 'POST',
    idempotencyKey
  });
  if (!result.ok) return result;
  if (!result.body || typeof result.body !== 'object') return malformed(result.status);
  const summary = readSummary((result.body as { release?: unknown }).release);
  if (!summary) return malformed(result.status);
  return { ok: true, status: result.status, body: summary, etag: result.etag };
}

export async function buildRelease(
  token: string,
  tenantId: string,
  spaceId: string,
  idempotencyKey: string
): Promise<ApiResult<ConfirmedBuild>> {
  const result = await api<unknown>(token, `${collection(tenantId, spaceId)}:build`, {
    method: 'POST',
    idempotencyKey
  });
  if (!result.ok) return result;
  const confirmed = readBuild(result.body);
  if (!confirmed) return malformed(result.status);
  return { ok: true, status: result.status, body: confirmed, etag: result.etag };
}

export async function listPreviewPages(
  token: string,
  tenantId: string,
  spaceId: string,
  releaseId: string
): Promise<ApiResult<PreviewPage[]>> {
  const result = await api<unknown>(token, `${releasePath(tenantId, spaceId, releaseId)}/preview`);
  if (!result.ok) return result;
  const pages = readPreviewPages(result.body);
  if (!pages) return malformed(result.status);
  return { ok: true, status: result.status, body: pages, etag: result.etag };
}

export async function readPreviewPage(
  token: string,
  tenantId: string,
  spaceId: string,
  releaseId: string,
  slug: string
): Promise<ApiResult<PreviewDocument>> {
  const result = await api<unknown>(
    token,
    `${releasePath(tenantId, spaceId, releaseId)}/preview/${encodeURIComponent(slug)}`
  );
  if (!result.ok) return result;
  const document = readPreviewDocument(result.body);
  if (!document) return malformed(result.status);
  return { ok: true, status: result.status, body: document, etag: result.etag };
}

export async function promoteRelease(
  token: string,
  tenantId: string,
  spaceId: string,
  releaseId: string,
  idempotencyKey: string
): Promise<ApiResult<ReleaseSummary>> {
  return switchRelease(token, tenantId, spaceId, releaseId, 'promote', idempotencyKey);
}

export async function rollbackRelease(
  token: string,
  tenantId: string,
  spaceId: string,
  releaseId: string,
  idempotencyKey: string
): Promise<ApiResult<ReleaseSummary>> {
  return switchRelease(token, tenantId, spaceId, releaseId, 'rollback', idempotencyKey);
}

async function switchRelease(
  token: string,
  tenantId: string,
  spaceId: string,
  releaseId: string,
  action: 'promote' | 'rollback',
  idempotencyKey: string
): Promise<ApiResult<ReleaseSummary>> {
  const result = await api<unknown>(token, `${releasePath(tenantId, spaceId, releaseId)}:${action}`, {
    method: 'POST',
    idempotencyKey
  });
  if (!result.ok) return result;
  const summary = readSummary(result.body);
  if (!summary) return malformed(result.status);
  return { ok: true, status: result.status, body: summary, etag: result.etag };
}

function collection(tenantId: string, spaceId: string) {
  return `/api/v1/tenants/${encodeURIComponent(tenantId)}/spaces/${encodeURIComponent(spaceId)}/releases`;
}

function releasePath(tenantId: string, spaceId: string, releaseId: string) {
  return `${collection(tenantId, spaceId)}/${encodeURIComponent(releaseId)}`;
}

function malformed(status: number): ApiResult<never> {
  return { ok: false, failure: { status, code: null, traceId: null, retryAfter: null } };
}

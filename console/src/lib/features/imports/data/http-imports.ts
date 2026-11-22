import { api, type ApiFailure, type ApiResult } from '#lib/shared/api/client';
import { readAccepted, readJob, readPages, type ImportedPage, type ImportJob } from '../domain/import-job';

type SpaceMode = 'authored' | 'synced';

export async function loadImportSpace(
  token: string,
  spaceId: string
): Promise<ApiResult<{ tenantId: string; mode: SpaceMode }>> {
  const me = await api<{ tenants?: Array<{ id?: unknown }> }>(token, '/api/v1/me');
  if (!me.ok) return me;
  const tenantId = me.body.tenants?.find((tenant) => typeof tenant.id === 'string')?.id;
  if (typeof tenantId !== 'string') return malformed(me.status);
  const space = await api<unknown>(token, `${spacePath(tenantId, spaceId)}`);
  if (!space.ok) return space;
  if (!space.body || typeof space.body !== 'object') return malformed(space.status);
  const mode = (space.body as { mode?: unknown }).mode;
  if (mode !== 'authored' && mode !== 'synced') return malformed(space.status);
  return { ok: true, status: space.status, body: { tenantId, mode }, etag: space.etag };
}

export async function beginImport(
  token: string,
  tenantId: string,
  spaceId: string,
  file: File,
  idempotencyKey: string
): Promise<ApiResult<ImportJob>> {
  const started = await api<{ putUrl?: unknown; uploadKey?: unknown }>(token, `${spacePath(tenantId, spaceId)}/releases:import-uploads`, {
    method: 'POST'
  });
  if (!started.ok) return started;
  const putUrl = started.body.putUrl;
  const uploadKey = started.body.uploadKey;
  if (typeof putUrl !== 'string' || typeof uploadKey !== 'string' || putUrl.length === 0 || uploadKey.length === 0) {
    return malformed(started.status);
  }
  const uploaded = await putBundle(putUrl, file);
  if (!uploaded.ok) return uploaded;
  const accepted = await api<unknown>(token, `${spacePath(tenantId, spaceId)}/releases:import`, {
    method: 'POST',
    body: { uploadKey },
    idempotencyKey
  });
  if (!accepted.ok) return accepted;
  const job = readAccepted(accepted.body);
  if (!job) return malformed(accepted.status);
  return { ok: true, status: accepted.status, body: job, etag: accepted.etag };
}

export async function viewImportJob(
  token: string,
  tenantId: string,
  spaceId: string,
  jobId: string
): Promise<ApiResult<ImportJob>> {
  const result = await api<unknown>(token, `${spacePath(tenantId, spaceId)}/import-jobs/${encodeURIComponent(jobId)}`);
  if (!result.ok) return result;
  const job = readJob(result.body);
  if (!job) return malformed(result.status);
  return { ok: true, status: result.status, body: job, etag: result.etag };
}

export async function retryImport(
  token: string,
  tenantId: string,
  jobId: string,
  idempotencyKey: string
): Promise<ApiResult<void>> {
  return api<void>(token, `/ops/jobs/${encodeURIComponent(jobId)}:retry`, {
    method: 'POST',
    body: { tenantId, platform: false },
    idempotencyKey
  });
}

export async function listSpacePages(token: string, tenantId: string, spaceId: string): Promise<ApiResult<ImportedPage[]>> {
  const result = await api<unknown>(token, `${spacePath(tenantId, spaceId)}/pages`);
  if (!result.ok) return result;
  const pages = readPages(result.body);
  if (!pages) return malformed(result.status);
  return { ok: true, status: result.status, body: pages, etag: result.etag };
}

async function putBundle(putUrl: string, file: File): Promise<ApiResult<void>> {
  try {
    const response = await fetch(putUrl, {
      method: 'PUT',
      headers: { 'content-type': file.type || 'application/octet-stream' },
      body: file
    });
    if (response.ok) return { ok: true, status: response.status, body: undefined, etag: response.headers.get('etag') };
    return { ok: false, failure: await readFailure(response) };
  } catch {
    return { ok: false, failure: { status: 0, code: null, traceId: null, retryAfter: null } };
  }
}

async function readFailure(response: Response): Promise<ApiFailure> {
  let code: string | null = null;
  let traceId: string | null = null;
  try {
    const body = (await response.json()) as { code?: unknown; traceId?: unknown };
    code = typeof body.code === 'string' ? body.code : null;
    traceId = typeof body.traceId === 'string' ? body.traceId : null;
  } catch {
    code = null;
  }
  const retry = Number(response.headers.get('retry-after'));
  return { status: response.status, code, traceId, retryAfter: Number.isFinite(retry) ? retry : null };
}

function spacePath(tenantId: string, spaceId: string) {
  return `/api/v1/tenants/${encodeURIComponent(tenantId)}/spaces/${encodeURIComponent(spaceId)}`;
}

function malformed(status: number): ApiResult<never> {
  return { ok: false, failure: { status, code: null, traceId: null, retryAfter: null } };
}

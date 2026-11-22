export type ApiFailure = {
  status: number;
  code: string | null;
  traceId: string | null;
  retryAfter: number | null;
};

export type ApiResult<T> = { ok: true; status: number; body: T; etag: string | null } | { ok: false; failure: ApiFailure };

export type ApiRequest = {
  method?: string;
  body?: unknown;
  idempotencyKey?: string;
  ifMatch?: string;
};

/** Calls the management API with the in-memory access token. A failed query is not an empty body. */
export async function api<T>(token: string, path: string, request: ApiRequest = {}): Promise<ApiResult<T>> {
  const method = request.method ?? 'GET';
  const headers = new Headers({ accept: 'application/json, application/problem+json', authorization: `Bearer ${token}` });
  if (request.body !== undefined) headers.set('content-type', 'application/json');
  if (request.idempotencyKey) headers.set('idempotency-key', request.idempotencyKey);
  if (request.ifMatch) headers.set('if-match', request.ifMatch);
  try {
    const response = await fetch(path, {
      method,
      headers,
      body: request.body === undefined ? undefined : JSON.stringify(request.body),
      cache: 'no-store'
    });
    if (response.ok) {
      if (response.status === 204) return { ok: true, status: response.status, body: undefined as T, etag: response.headers.get('etag') };
      return { ok: true, status: response.status, body: (await response.json()) as T, etag: response.headers.get('etag') };
    }
    return { ok: false, failure: await failure(response) };
  } catch {
    return { ok: false, failure: { status: 0, code: null, traceId: null, retryAfter: null } };
  }
}

async function failure(response: Response): Promise<ApiFailure> {
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

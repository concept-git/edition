import type { AccessGrant, AuthGateway, LoginFailure, LoginResult, LogoutResult, RefreshResult, SessionFailure } from '../domain/auth';

const accept = 'application/json, application/problem+json';

export class HttpAuth implements AuthGateway {
  async login(email: string, password: string): Promise<LoginResult> {
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers: { 'content-type': 'application/json', accept },
        body: JSON.stringify({ email, password })
      });
      if (response.ok) {
        const grant = await readGrant(response);
        return grant ? { ok: true, grant } : { ok: false, failure: { kind: 'server', traceId: null } };
      }
      if (response.status === 401) {
        await response.body?.cancel();
        return { ok: false, failure: { kind: 'invalid_credentials' } };
      }
      return { ok: false, failure: await loginFailure(response) };
    } catch {
      return { ok: false, failure: { kind: 'network' } };
    }
  }

  async refresh(): Promise<RefreshResult> {
    try {
      const response = await fetch('/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers: { accept }
      });
      if (response.ok) {
        const grant = await readGrant(response);
        return grant ? { ok: true, grant } : { ok: false, failure: { kind: 'server', traceId: null } };
      }
      return { ok: false, failure: await refreshFailure(response) };
    } catch {
      return { ok: false, failure: { kind: 'network' } };
    }
  }

  async logout(): Promise<LogoutResult> {
    try {
      const response = await fetch('/auth/logout', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers: { accept }
      });
      if (response.ok) {
        await response.body?.cancel();
        return { ok: true };
      }
      return { ok: false, failure: await refreshFailure(response) };
    } catch {
      return { ok: false, failure: { kind: 'network' } };
    }
  }
}

async function loginFailure(response: Response): Promise<LoginFailure> {
  const problem = await readProblem(response);
  if (response.status === 403) return { kind: 'forbidden' };
  if (response.status === 429) return { kind: 'rate_limited', retryAfter: retryAfter(response) };
  return { kind: 'server', traceId: problem.traceId };
}

async function refreshFailure(response: Response): Promise<SessionFailure> {
  const problem = await readProblem(response);
  if (response.status === 401 && problem.code === 'invalid_refresh') return { kind: 'invalid_refresh' };
  if (response.status === 403) return { kind: 'forbidden' };
  if (response.status === 429) return { kind: 'rate_limited', retryAfter: retryAfter(response) };
  if (response.status >= 500 || response.status === 401) return { kind: 'server', traceId: problem.traceId };
  return { kind: 'server', traceId: problem.traceId };
}

async function readGrant(response: Response): Promise<AccessGrant | null> {
  const body = (await response.json()) as Partial<AccessGrant>;
  if (typeof body.accessToken !== 'string' || typeof body.tokenType !== 'string' || typeof body.expiresIn !== 'number') return null;
  return { accessToken: body.accessToken, tokenType: body.tokenType, expiresIn: body.expiresIn };
}

async function readProblem(response: Response): Promise<{ code: string | null; traceId: string | null }> {
  try {
    const body = (await response.json()) as { code?: unknown; traceId?: unknown };
    return {
      code: typeof body.code === 'string' ? body.code : null,
      traceId: typeof body.traceId === 'string' ? body.traceId : null
    };
  } catch {
    return { code: null, traceId: null };
  }
}

function retryAfter(response: Response): number | null {
  const value = Number(response.headers.get('retry-after'));
  return Number.isFinite(value) ? value : null;
}

export type AccessGrant = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
};

export type SessionFailure =
  | { kind: 'invalid_refresh' }
  | { kind: 'forbidden' }
  | { kind: 'rate_limited'; retryAfter: number | null }
  | { kind: 'server'; traceId: string | null }
  | { kind: 'network' };

export type LoginFailure =
  | { kind: 'invalid_credentials' }
  | { kind: 'forbidden' }
  | { kind: 'rate_limited'; retryAfter: number | null }
  | { kind: 'server'; traceId: string | null }
  | { kind: 'network' };

export type LoginResult = { ok: true; grant: AccessGrant } | { ok: false; failure: LoginFailure };
export type RefreshResult = { ok: true; grant: AccessGrant } | { ok: false; failure: SessionFailure };
export type LogoutResult = { ok: true } | { ok: false; failure: SessionFailure };

/** Only a refresh that names invalid_refresh ends the signed-in page. */
export function clearsSession(failure: SessionFailure): boolean {
  return failure.kind === 'invalid_refresh';
}

export interface AuthGateway {
  login(email: string, password: string): Promise<LoginResult>;
  refresh(): Promise<RefreshResult>;
  logout(): Promise<LogoutResult>;
}

export type SessionSnapshot = Readonly<{
  token: string | null;
  expired: boolean;
  revision: number;
}>;
type Fetcher = (request: Request) => Promise<Response>;

/** A single writer owns refresh rotation. Tokens and response bodies never enter persistent storage. */
export class SessionTransport {
  private current: SessionSnapshot = {
    token: null,
    expired: false,
    revision: 0,
  };
  private listeners = new Set<() => void>();
  private pending: Promise<Response> | null = null;
  private fetcher: Fetcher;

  constructor(fetcher: Fetcher = (request) => globalThis.fetch(request)) {
    this.fetcher = fetcher;
  }
  snapshot = () => this.current;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  accept(token: string) {
    this.update(token, false);
  }
  clear() {
    this.update(null, true);
  }
  private update(token: string | null, expired: boolean) {
    this.current = { token, expired, revision: this.current.revision + 1 };
    this.listeners.forEach((listener) => listener());
  }

  async restore(origin: string): Promise<Response> {
    if (this.pending) return (await this.pending).clone();
    const revision = this.current.revision;
    const pending = this.fetcher(
      new Request(new URL('/auth/refresh', origin), {
        method: 'POST',
        credentials: 'include',
      }),
    ).then(async (response) => {
      const payload: unknown = await response
        .clone()
        .json()
        .catch(() => undefined);
      if (this.current.revision !== revision) return response;
      if (
        response.ok &&
        isRecord(payload) &&
        typeof payload.accessToken === 'string'
      )
        this.accept(payload.accessToken);
      if (
        response.status === 401 &&
        isRecord(payload) &&
        payload.code === 'invalid_refresh'
      )
        this.clear();
      return response;
    });
    this.pending = pending;
    try {
      return (await pending).clone();
    } finally {
      this.pending = null;
    }
  }

  fetch = async (request: Request): Promise<Response> => {
    const isAuth = new URL(request.url).pathname.startsWith('/auth/');
    const token = this.current.token;
    const withToken = () => {
      const headers = new Headers(request.headers);
      if (!isAuth && this.current.token)
        headers.set('Authorization', `Bearer ${this.current.token}`);
      return new Request(request.clone(), { headers, credentials: 'include' });
    };
    const response = await this.fetcher(withToken());
    if (
      response.status !== 401 ||
      isAuth ||
      !['GET', 'HEAD'].includes(request.method)
    )
      return response;
    // Another expired request may have completed rotation before this response arrived.
    if (this.current.token === token) {
      const refreshed = await this.restore(new URL(request.url).origin);
      if (!refreshed.ok) return refreshed;
    }
    if (request.signal.aborted || !this.current.token) return response;
    return this.fetcher(withToken());
  };
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

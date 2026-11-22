import { api, type ApiFailure } from '#lib/shared/api/client';

/** Read by the shell when it maps the rail. The access token is not copied into storage. */
export const platformOperator = $state<{ allowed: boolean; ready: boolean; failure: ApiFailure | null }>({
  allowed: false,
  ready: false,
  failure: null
});

let installed = false;
let generation = 0;

export function installPlatformWatch() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  const original = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await original(input, init);
    observe(response);
    return response;
  };
}

function observe(response: Response) {
  try {
    const url = response.url;
    if (!url.includes('/auth/login') && !url.includes('/auth/refresh')) return;
    void response
      .clone()
      .json()
      .then((body: { accessToken?: unknown }) => {
        if (typeof body?.accessToken === 'string') void loadPlatformOperator(body.accessToken);
      })
      .catch(() => undefined);
  } catch {
    return;
  }
}

export async function loadPlatformOperator(token: string) {
  const current = ++generation;
  const result = await api<{ platformOperator?: boolean }>(token, '/api/v1/me');
  if (current !== generation) return;
  if (!result.ok) {
    platformOperator.failure = result.failure;
    platformOperator.ready = false;
    return;
  }
  platformOperator.failure = null;
  platformOperator.allowed = result.body.platformOperator === true;
  platformOperator.ready = true;
}

export function operatorFailureText(failure: ApiFailure): string {
  if (failure.status === 429) {
    return failure.retryAfter === null ? '尝试过于频繁，请稍后再试。' : `尝试过于频繁，请在 ${failure.retryAfter} 秒后再试。`;
  }
  if (failure.status === 0) return '网络失败。';
  return failure.traceId ? `身份没有读到。追踪号 ${failure.traceId}。` : '身份没有读到。';
}

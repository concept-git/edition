import { api } from '#lib/shared/api/client';

/** Read by the shell when it maps the rail. The access token is not copied into storage. */
export const platformOperator = $state({ allowed: false, ready: false });

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
  if (!result.ok) return;
  platformOperator.allowed = result.body.platformOperator === true;
  platformOperator.ready = true;
}

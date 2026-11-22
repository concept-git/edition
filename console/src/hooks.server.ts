import type { Handle } from '@sveltejs/kit/hooks';

/** Forward audit JSON calls to Control. Document navigations stay on this route. */
export const handle: Handle = async ({ event, resolve }) => {
  if (!isAuditApi(event.url.pathname, event.request.headers.get('accept') ?? '')) return resolve(event);
  return proxyAudit(event.request, event.url);
};

function isAuditApi(pathname: string, accept: string) {
  if (!accept.includes('application/problem+json')) return false;
  return pathname === '/audit' || pathname === '/audit:export' || pathname.startsWith('/audit/exports');
}

function controlOrigin() {
  const runtime = globalThis as { process?: { env?: Record<string, string | undefined> } };
  const configured = runtime.process?.env?.EDITION_CONTROL_ORIGIN;
  return configured && configured.length > 0 ? configured : 'http://127.0.0.1:8081';
}

async function proxyAudit(request: Request, url: URL) {
  const headers = new Headers();
  for (const name of ['authorization', 'accept', 'content-type', 'idempotency-key', 'if-match']) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const target = new URL(url.pathname + url.search, controlOrigin());
  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer()
    });
    const forwarded = new Headers();
    const type = response.headers.get('content-type');
    if (type) forwarded.set('content-type', type);
    const retry = response.headers.get('retry-after');
    if (retry) forwarded.set('retry-after', retry);
    return new Response(await response.arrayBuffer(), { status: response.status, headers: forwarded });
  } catch {
    return new Response(
      JSON.stringify({
        type: 'about:blank',
        title: 'Unexpected error',
        status: 503,
        code: 'dependency_unavailable',
        detail: 'The audit service could not be reached.',
        traceId: null
      }),
      { status: 503, headers: { 'content-type': 'application/problem+json' } }
    );
  }
}

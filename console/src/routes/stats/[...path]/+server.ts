import type { RequestHandler } from '@sveltejs/kit';

/** Forward stats calls to Control. The dev server proxies /api and /auth only. */
export const GET: RequestHandler = async ({ request, url, params }) => {
  const headers = new Headers();
  for (const name of ['authorization', 'accept']) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const target = new URL(`/stats/${params.path ?? ''}${url.search}`, controlOrigin());
  try {
    const response = await fetch(target, { method: 'GET', headers });
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
        detail: 'The stats service could not be reached.',
        traceId: null
      }),
      { status: 503, headers: { 'content-type': 'application/problem+json' } }
    );
  }
};

function controlOrigin() {
  const runtime = globalThis as { process?: { env?: Record<string, string | undefined> } };
  const configured = runtime.process?.env?.EDITION_CONTROL_ORIGIN;
  return configured && configured.length > 0 ? configured : 'http://127.0.0.1:8081';
}

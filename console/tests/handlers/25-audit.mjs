/**
 * Audit facts the stub already holds, the way Control would after a management action.
 * The erased actor's old email and name are present only as fields the page must not render.
 */

const records = [
  {
    id: 42,
    eventId: '6f1c2a40-7b1e-4c1a-9a2e-0c5d1a9b7e11',
    rootId: '6f1c2a40-7b1e-4c1a-9a2e-0c5d1a9b7e11',
    time: '2026-11-22T02:15:00Z',
    kind: 'fact',
    actorType: 'user',
    actorId: '8a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d',
    actorName: '维护者',
    action: 'Space.create',
    targetType: 'space',
    targetId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    outcome: 'ok',
    ip: '203.0.113.10',
    requestId: 'req-space-create',
    credentialId: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e'
  },
  {
    id: 41,
    eventId: '7a2d3b51-8c2f-4d2b-8b3f-1d6e2b0c8f22',
    rootId: '7a2d3b51-8c2f-4d2b-8b3f-1d6e2b0c8f22',
    time: '2026-11-21T08:00:00Z',
    kind: 'fact',
    actorType: 'user',
    actorId: 'c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e6f',
    actorName: '已注销用户',
    action: 'Page.create',
    targetType: 'page',
    targetId: 'd4e5f6a7-b8c9-4d0e-8f1a-2b3c4d5e6f70',
    outcome: 'ok',
    ip: null,
    requestId: 'req-erased-page',
    credentialId: null,
    email: 'erased-reader@edition.test',
    name: '陈予安'
  }
];

let mode = 'ok';

/** @param {any} req @param {any} res @param {any} ctx */
export async function handle(req, res, ctx) {
  const { url, problem, send, readJson } = ctx;
  if (req.method === 'POST' && url.pathname === '/__stub/audit') {
    const body = await readJson(req);
    mode = body.mode === 'error' ? 'error' : 'ok';
    res.writeHead(204);
    res.end();
    return true;
  }
  if (req.method !== 'GET' || url.pathname !== '/audit') return false;
  const authorization = req.headers.authorization ?? '';
  if (!authorization.startsWith('Bearer ') || authorization.length <= 'Bearer '.length) {
    problem(res, 401, 'unauthenticated', 'Authentication rejected', 'The supplied credential is invalid.', 'trace-audit-auth');
    return true;
  }
  if (mode === 'error') {
    problem(res, 500, 'unexpected_error', 'Unexpected error', 'The request could not be completed.', 'trace-audit');
    return true;
  }
  const action = url.searchParams.get('action');
  const outcome = url.searchParams.get('outcome');
  const actor = url.searchParams.get('actor');
  const target = url.searchParams.get('target');
  const matched = records.filter((record) => {
    if (action && record.action !== action) return false;
    if (outcome && record.outcome !== outcome) return false;
    if (actor && record.actorId !== actor) return false;
    if (target && record.targetId !== target) return false;
    return true;
  });
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') ?? 20) || 20));
  const items = matched.slice(0, limit);
  const last = items[items.length - 1];
  send(res, 200, { items, nextCursor: matched.length > items.length && last ? last.id : null, total: matched.length });
  return true;
}

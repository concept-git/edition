/**
 * List responses for the overview counts.
 * Shapes follow listTenantMembers, listSpaces, and listSites.
 */

const tenant = {
  id: '6f1e0c2a-6b4d-4e3a-9c11-0a1b2c3d4e5f',
  name: '示例租户',
  role: 'owner',
  status: 'active'
};

let mode = 'counts';
let traceId = 'trace-overview';

/** @param {any} req @param {any} res @param {any} ctx */
export async function handle(req, res, ctx) {
  const path = ctx.url.pathname;
  if (req.method === 'POST' && path === '/__stub/overview') {
    const body = await ctx.readJson(req);
    mode = typeof body.mode === 'string' ? body.mode : 'counts';
    traceId = typeof body.traceId === 'string' ? body.traceId : 'trace-overview';
    res.writeHead(204);
    res.end();
    return true;
  }
  if (req.method === 'GET' && path === '/api/v1/me') {
    ctx.send(res, 200, {
      id: '8d2c1b0a-9e8f-4a7b-8c6d-5e4f3a2b1c0d',
      email: 'maintainer@edition.test',
      name: '维护者',
      verified: true,
      status: 'active',
      platformOperator: globalThis.__editionPlatformOperator !== false, // 27-platform toggles a normal member; unset stays an operator
      tenants: [tenant]
    });
    return true;
  }
  const list = listKind(path);
  if (req.method !== 'GET' || list === null) return false;
  // Unpaginated space and site lists are the editable ones used by site mounts.
  if ((list === 'spaces' || list === 'sites') && !ctx.url.searchParams.has('limit')) return false;
  if (mode === 'drop') {
    req.socket.destroy();
    return true;
  }
  if (mode === 'error') {
    ctx.problem(res, 500, 'unexpected_error', 'Unexpected error', 'The request could not be completed.', traceId);
    return true;
  }
  ctx.send(res, 200, bodyFor(list, ctx.url.searchParams.get('cursor')));
  return true;
}

/** @param {string} path @returns {'members' | 'spaces' | 'sites' | null} */
function listKind(path) {
  if (path === `/api/v1/tenants/${tenant.id}/members`) return 'members';
  if (path === `/api/v1/tenants/${tenant.id}/spaces`) return 'spaces';
  if (path === `/api/v1/tenants/${tenant.id}/sites`) return 'sites';
  return null;
}

/** @param {'members' | 'spaces' | 'sites'} list @param {string | null} cursor */
function bodyFor(list, cursor) {
  if (mode === 'empty') {
    if (list === 'members') return { items: [], nextCursor: null };
    return { items: [], nextCursor: null, total: 0, allowedActions: [] };
  }
  if (list === 'members') {
    if (cursor === 'member-page-2') {
      return {
        items: [
          { id: '33333333-3333-4333-8333-333333333333', name: '丙', role: 'member', joinedAt: '2026-03-03T00:00:00Z' },
          { id: '44444444-4444-4444-8444-444444444444', name: '丁', role: 'member', joinedAt: '2026-04-04T00:00:00Z' }
        ],
        nextCursor: null
      };
    }
    return {
      items: [
        { id: '11111111-1111-4111-8111-111111111111', name: '甲', role: 'owner', joinedAt: '2026-01-01T00:00:00Z' },
        { id: '22222222-2222-4222-8222-222222222222', name: '乙', role: 'member', joinedAt: '2026-02-02T00:00:00Z' }
      ],
      nextCursor: 'member-page-2'
    };
  }
  if (list === 'spaces') {
    return {
      items: [{ id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', name: '手册', mode: 'authored' }],
      nextCursor: null,
      total: 6,
      allowedActions: ['read']
    };
  }
  return {
    items: [{ id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', name: '文档站' }],
    nextCursor: null,
    total: 5,
    allowedActions: ['read']
  };
}

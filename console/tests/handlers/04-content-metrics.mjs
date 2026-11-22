// @ts-nocheck
/**
 * Content-home fixtures for the local auth stub.
 * Counts are small and fixed so the page can show real figures.
 * `empty` omits list bodies. `gap` leaves pageCount and publishedAt null.
 * `error` is a problem response with a trace id.
 */

const tenantId = '11111111-1111-4111-8111-111111111111';
const spaceId = '22222222-2222-4222-8222-222222222222';
const userId = '33333333-3333-4333-8333-333333333333';

let mode = 'data';

export async function handle(req, res, ctx) {
  const url = ctx.url;
  if (req.method === 'POST' && url.pathname === '/__stub/content-metrics') {
    const body = await ctx.readJson(req);
    mode = typeof body.mode === 'string' ? body.mode : 'data';
    res.writeHead(204);
    res.end();
    return true;
  }
  if (req.method !== 'GET') return false;
  if (url.pathname === '/api/v1/auth/context') return context(res, ctx);
  if (url.pathname === '/api/v1/tenants/' + tenantId + '/members') return members(res, ctx);
  if (url.pathname === '/api/v1/tenants/' + tenantId + '/spaces') return spaces(res, ctx);
  if (url.pathname === '/api/v1/tenants/' + tenantId + '/spaces/' + spaceId + '/pages') return pages(res, ctx, url);
  return false;
}

function context(res, ctx) {
  if (mode === 'error') return fail(res, ctx);
  ctx.send(res, 200, {
    credentialType: 'session',
    actorId: userId,
    credentialId: userId,
    scopes: ['content:read', 'members:read'],
    tenantId,
    expiry: null
  });
  return true;
}

function members(res, ctx) {
  if (mode === 'error') return fail(res, ctx);
  if (mode === 'empty') return none(res, ctx);
  if (mode === 'zeros') return ctx.send(res, 200, { items: [], nextCursor: null }), true;
  ctx.send(res, 200, {
    items: [
      { id: '44444444-4444-4444-8444-444444444444', name: '甲', role: 'owner', joinedAt: daysAgo(1) },
      { id: '55555555-5555-4555-8555-555555555555', name: '乙', role: 'author', joinedAt: daysAgo(10) }
    ],
    nextCursor: null
  });
  return true;
}

function spaces(res, ctx) {
  if (mode === 'error') return fail(res, ctx);
  if (mode === 'empty') return none(res, ctx);
  if (mode === 'zeros') {
    ctx.send(res, 200, { items: [], nextCursor: null, total: 0, allowedActions: [] });
    return true;
  }
  ctx.send(res, 200, {
    items: [space(mode === 'gap' ? null : 5)],
    nextCursor: null,
    total: 1,
    allowedActions: ['read']
  });
  return true;
}

function pages(res, ctx, url) {
  if (mode === 'error') return fail(res, ctx);
  if (mode === 'empty') return none(res, ctx);
  if (url.searchParams.get('status') !== 'published') return false;
  if (mode === 'zeros') {
    ctx.send(res, 200, { items: [], nextCursor: null, total: 0, allowedActions: [] });
    return true;
  }
  const items =
    mode === 'gap'
      ? [page('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', daysAgo(1)), page('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', null)]
      : [
          page('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', daysAgo(1)),
          page('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', daysAgo(4)),
          page('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3', daysAgo(4))
        ];
  ctx.send(res, 200, { items, nextCursor: null, total: items.length, allowedActions: ['read'] });
  return true;
}

function space(pageCount) {
  return {
    id: spaceId,
    tenantId,
    name: '手册',
    icon: 'book',
    mode: 'authored',
    status: 'active',
    pageCount,
    driftCount: 0,
    lastReleaseAt: null,
    createdAt: daysAgo(10),
    createdBy: userId,
    updatedAt: daysAgo(1),
    updatedBy: userId,
    collectionId: null,
    allowedActions: ['read']
  };
}

function page(id, publishedAt) {
  return {
    id,
    title: '页',
    slug: id.slice(0, 8),
    status: 'published',
    format: 'markdown',
    icon: null,
    tags: [],
    driftFlag: false,
    updatedAt: publishedAt ?? daysAgo(2),
    updatedBy: userId,
    publishedAt,
    allowedActions: ['read'],
    contentType: 'markdown',
    versionRef: null,
    interpretation: {}
  };
}

function none(res, ctx) {
  ctx.send(res, 200, { status: 'no_data' });
  return true;
}

function fail(res, ctx) {
  ctx.problem(res, 500, 'unexpected_error', 'Unexpected error', 'The request could not be completed.', 'trace-content-04');
  return true;
}

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
}

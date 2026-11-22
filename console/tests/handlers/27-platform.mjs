/**
 * Platform admin stand-in. Default profile is a platform operator with empty
 * lists so the shell can still open the placeholder pages. Tests arm a fixture
 * or a normal member through POST /__stub/platform.
 */

let operator = true;
let scenario = 'empty';
globalThis.__editionPlatformOperator = true;

const checkedAt = '2026-11-22T12:00:00.000Z';
const secret = 'SECRET_PAGE_BODY';

export async function handle(req, res, ctx) {
  const { url } = ctx;
  if (req.method === 'POST' && url.pathname === '/__stub/platform') {
    const body = await ctx.readJson(req);
    if (typeof body.operator === 'boolean') {
      operator = body.operator;
      globalThis.__editionPlatformOperator = body.operator;
    }
    if (body.scenario === 'empty' || body.scenario === 'open') scenario = body.scenario;
    res.writeHead(204);
    res.end();
    return true;
  }
  if (req.method === 'GET' && url.pathname === '/api/v1/me') {
    ctx.send(res, 200, {
      id: '018f0b3a-6c2e-7a11-8c3d-000000000001',
      email: 'maintainer@edition.test',
      name: '维护者',
      avatar: '',
      locale: 'zh-CN',
      verified: true,
      status: 'active',
      platformOperator: operator,
      tenants: []
    });
    return true;
  }
  if (req.method !== 'GET') return false;
  if (url.pathname === '/admin/tenants') return tenants(res, ctx);
  if (url.pathname === '/admin/users') return users(res, ctx, url);
  if (url.pathname === '/admin/health') return health(res, ctx);
  if (url.pathname === '/ops/mail-jobs') return mail(res, ctx);
  return false;
}

function tenants(res, ctx) {
  if (!operator) return deny(res, ctx);
  ctx.send(res, 200, {
    tenants:
      scenario === 'open'
        ? [
            {
              id: '018f0b3a-6c2e-7a11-8c3d-111111111111',
              name: '北岸租户',
              status: 'active',
              ownerCount: 1,
              createdAt: checkedAt
            }
          ]
        : [],
    nextCursor: null
  });
  return true;
}

function users(res, ctx, url) {
  if (!operator) return deny(res, ctx);
  const query = url.searchParams.get('q') ?? '';
  const matched = scenario === 'open' && query.length >= 3;
  ctx.send(res, 200, {
    users: matched
      ? [
          {
            id: '018f0b3a-6c2e-7a11-8c3d-222222222222',
            email: 'ada@edition.test',
            name: 'Ada',
            status: 'active',
            platformOperator: false,
            updatedAt: checkedAt
          }
        ]
      : [],
    nextCursor: null
  });
  return true;
}

function health(res, ctx) {
  if (!operator) return deny(res, ctx);
  ctx.send(res, 200, {
    checkedAt,
    services:
      scenario === 'open'
        ? [
            beat('edition-management', '2026-11-22T11:59:00.000Z'),
            beat('edition-index', '2026-11-22T11:58:59.999Z'),
            beat('edition-boundary', '2026-11-22T11:57:00.000Z'),
            beat('edition-worker', '2026-11-22T11:56:59.999Z'),
            {
              service: 'edition-reader',
              status: 'unconfigured',
              instances: [],
              details: { body: secret, content: secret }
            }
          ]
        : []
  });
  return true;
}

function beat(service, seenAt) {
  return {
    service,
    status: 'normal',
    instances: [
      {
        instance: `${service}-1`,
        version: '1',
        seenAt,
        status: 'normal',
        details: { body: secret, content: secret }
      }
    ],
    details: { body: secret, document: secret }
  };
}

function mail(res, ctx) {
  if (!operator) return deny(res, ctx);
  ctx.send(res, 200, {
    items:
      scenario === 'open'
        ? [
            {
              id: '018f0b3a-6c2e-7a11-8c3d-333333333333',
              kind: 'invite',
              recipient: 'mail-job@edition.test',
              tenantId: '018f0b3a-6c2e-7a11-8c3d-111111111111',
              status: 'queued',
              attempt: 1,
              nextRunAt: checkedAt,
              error: '',
              traceId: '018f0b3a-6c2e-7a11-8c3d-444444444444',
              outcome: '',
              createdAt: checkedAt,
              completedAt: null,
              canRetry: false
            }
          ]
        : [],
    nextCursor: null
  });
  return true;
}

function deny(res, ctx) {
  ctx.problem(res, 403, 'platform_operator_required', 'Request rejected', 'Caller is not a platform operator.', 'trace-platform');
  return true;
}

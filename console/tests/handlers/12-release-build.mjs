// @ts-nocheck
import { claimsReleaseList } from './13-release-live.mjs';
import { releaseItems } from './14-hotfix-drift.mjs';

const actorId = '22222222-2222-4222-8222-222222222222';
const outcomes = ['promoted', 'unchanged', 'skipped', 'held'];

/** @type {Map<string, Array<Record<string, unknown>>>} */
let lists = new Map();
/** @type {Map<string, { fingerprint: string, body: Record<string, unknown> }>} */
let records = new Map();
/** @type {string[]} */
let queue = [];
let delayMs = 0;
let failBuilds = 0;
let failLists = 0;
let sequence = 0;

export async function handle(req, res, ctx) {
  const { url } = ctx;
  if (req.method === 'POST' && url.pathname === '/__stub/releases') {
    const body = await ctx.readJson(req);
    if (body.reset) reset();
    if (typeof body.delayMs === 'number') delayMs = body.delayMs;
    if (typeof body.failBuilds === 'number') failBuilds = body.failBuilds;
    if (typeof body.failLists === 'number') failLists = body.failLists;
    if (Array.isArray(body.outcomes)) queue = body.outcomes.filter((item) => outcomes.includes(item));
    ctx.send(res, 200, { ok: true });
    return true;
  }

  const listed = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/releases$/);
  if (listed && req.method === 'GET') {
    if (claimsReleaseList(decodeURIComponent(listed[2]))) return false;
    if (failLists > 0) {
      failLists -= 1;
      ctx.problem(res, 500, 'unexpected_error', 'Unexpected error', 'The release list could not be loaded.', 'trace-release-list');
      return true;
    }
    const spaceId = decodeURIComponent(listed[2]);
    const own = lists.get(spaceId) ?? [];
    const extra = releaseItems(spaceId).filter((item) => !own.some((current) => current.id === item.id));
    const items = [...extra, ...own];
    ctx.send(res, 200, { items, nextCursor: null, total: items.length, allowedActions: ['publish'] });
    return true;
  }

  const built = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/releases:build$/);
  if (built && req.method === 'POST') {
    await build(req, res, ctx, decodeURIComponent(built[1]), decodeURIComponent(built[2]));
    return true;
  }

  return false;
}

function reset() {
  lists = new Map();
  records = new Map();
  queue = [];
  delayMs = 0;
  failBuilds = 0;
  failLists = 0;
  sequence = 0;
}

async function build(req, res, ctx, tenantId, spaceId) {
  const key = idempotencyKey(req);
  if (!key) {
    ctx.problem(res, 400, 'invalid_idempotency_key', 'Bad Request', 'Idempotency-Key is required.', 'trace-release-key');
    return;
  }
  const fingerprint = JSON.stringify({ tenantId, spaceId });
  const prior = records.get(key);
  if (delayMs > 0) {
    const wait = delayMs;
    delayMs = 0;
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
  if (prior) {
    if (prior.fingerprint !== fingerprint) {
      ctx.problem(res, 409, 'idempotency_key_reused', 'Conflict', 'This idempotency key was used for a different request.', 'trace-release-key');
      return;
    }
    ctx.send(res, 200, prior.body);
    return;
  }
  if (failBuilds > 0) {
    failBuilds -= 1;
    ctx.problem(res, 503, 'dependency_unavailable', 'Service Unavailable', 'The release service is unavailable.', 'trace-release-build');
    return;
  }
  const outcome = queue.shift() ?? 'promoted';
  const body = resultBody(spaceId, outcome);
  records.set(key, { fingerprint, body });
  ctx.send(res, 200, body);
}

function resultBody(spaceId, outcome) {
  if (outcome === 'skipped' || outcome === 'unchanged') return { outcome, release: null };
  const release = detail(outcome);
  const bucket = lists.get(spaceId) ?? [];
  bucket.unshift(summary(release));
  lists.set(spaceId, bucket);
  return { outcome, release };
}

function detail(outcome) {
  sequence += 1;
  const now = new Date().toISOString();
  const held = outcome === 'held';
  return {
    id: crypto.randomUUID(),
    label: `第 ${sequence} 份发版`,
    status: held ? 'draft' : 'live',
    source: { kind: 'build', ref: 'manual', actor: actorId },
    pageCount: 1,
    createdAt: now,
    promotedAt: held ? null : now,
    allowedActions: ['read'],
    notes: '',
    report: held
      ? {
          errors: [{ code: 'schema_invalid', path: '/guide.json', pageId: null, detail: '缺少必填字段 title' }],
          warnings: [],
          info: []
        }
      : { errors: [], warnings: [], info: [] },
    diffSummary: { added: 1, changed: 0, removed: 0 },
    size: 128
  };
}

function summary(release) {
  return {
    id: release.id,
    label: release.label,
    status: release.status,
    source: release.source,
    pageCount: release.pageCount,
    createdAt: release.createdAt,
    promotedAt: release.promotedAt,
    allowedActions: release.allowedActions
  };
}

function idempotencyKey(req) {
  const value = req.headers['idempotency-key'];
  const key = typeof value === 'string' ? value.trim() : '';
  if (!key || key.length > 128 || !/^[a-zA-Z0-9._:-]+$/.test(key)) return '';
  return key;
}

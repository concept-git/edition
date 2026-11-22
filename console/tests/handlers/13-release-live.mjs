// @ts-nocheck
const actorId = '22222222-2222-4222-8222-222222222222';
const previewable = new Set(['draft', 'flagged', 'validated', 'archived']);

/** @type {Map<string, { releases: Array<Record<string, unknown>> }>} */
let scenarios = new Map();
/** @type {Map<string, { fingerprint: string, body: Record<string, unknown> }>} */
let records = new Map();

export function claimsReleaseList(spaceId) {
  return scenarios.has(spaceId);
}

export async function handle(req, res, ctx) {
  const { url } = ctx;
  if (req.method === 'POST' && url.pathname === '/__stub/release-live') {
    const body = await ctx.readJson(req);
    if (body.reset) reset();
    if (typeof body.spaceId === 'string' && Array.isArray(body.releases)) seed(body.spaceId, body.releases);
    ctx.send(res, 200, { ok: true });
    return true;
  }

  const page = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/releases\/([^/]+)\/preview\/([^/]+)$/);
  if (page && req.method === 'GET') {
    previewDocument(res, ctx, decodeURIComponent(page[2]), decodeURIComponent(page[3]), decodeURIComponent(page[4]));
    return true;
  }

  const listed = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/releases\/([^/]+)\/preview$/);
  if (listed && req.method === 'GET') {
    previewPages(res, ctx, decodeURIComponent(listed[2]), decodeURIComponent(listed[3]));
    return true;
  }

  const action = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/releases\/([^/]+):(promote|rollback)$/);
  if (action && req.method === 'POST') {
    await switchLive(req, res, ctx, decodeURIComponent(action[1]), decodeURIComponent(action[2]), decodeURIComponent(action[3]), action[4]);
    return true;
  }

  const collection = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/releases$/);
  if (collection && req.method === 'GET' && claimsReleaseList(decodeURIComponent(collection[2]))) {
    const scenario = scenarios.get(decodeURIComponent(collection[2]));
    const items = scenario.releases.map(summary);
    ctx.send(res, 200, { items, nextCursor: null, total: items.length, allowedActions: ['build'] });
    return true;
  }

  return false;
}

function reset() {
  scenarios = new Map();
  records = new Map();
}

function seed(spaceId, releases) {
  scenarios.set(spaceId, {
    releases: releases.map((release, index) => normalize(release, index))
  });
}

function normalize(release, index) {
  const status = typeof release.status === 'string' ? release.status : 'validated';
  const pages = Array.isArray(release.pages) ? release.pages.map(normalizePage) : [];
  const now = new Date().toISOString();
  return {
    id: typeof release.id === 'string' ? release.id : crypto.randomUUID(),
    label: typeof release.label === 'string' ? release.label : `发版 ${index + 1}`,
    status,
    allowedActions: Array.isArray(release.allowedActions) ? release.allowedActions.filter((item) => typeof item === 'string') : [],
    pages,
    createdAt: now,
    promotedAt: status === 'live' ? now : null
  };
}

function normalizePage(page) {
  return {
    pageId: typeof page.pageId === 'string' ? page.pageId : crypto.randomUUID(),
    slug: typeof page.slug === 'string' ? page.slug : '',
    title: typeof page.title === 'string' ? page.title : '',
    content: typeof page.content === 'string' ? page.content : '',
    format: typeof page.format === 'string' ? page.format : 'markdown'
  };
}

function previewPages(res, ctx, spaceId, releaseId) {
  const release = find(spaceId, releaseId);
  if (!release || !previewable.has(release.status)) {
    ctx.problem(res, 404, 'release_not_found', 'Not Found', 'This release cannot be previewed.', 'trace-release-preview');
    return;
  }
  ctx.send(res, 200, {
    items: release.pages.map((page) => ({ pageId: page.pageId, slug: page.slug, title: page.title }))
  });
}

function previewDocument(res, ctx, spaceId, releaseId, slug) {
  const release = find(spaceId, releaseId);
  const page = release?.pages.find((item) => item.slug === slug);
  if (!release || !previewable.has(release.status) || !page) {
    ctx.problem(res, 404, 'release_not_found', 'Not Found', 'This release cannot be previewed.', 'trace-release-preview');
    return;
  }
  ctx.send(res, 200, {
    html: page.content,
    title: page.title,
    slug: page.slug,
    format: page.format,
    content: page.content,
    contentType: 'markdown',
    versionRef: null,
    interpretation: {}
  });
}

async function switchLive(req, res, ctx, tenantId, spaceId, releaseId, action) {
  const key = idempotencyKey(req);
  if (!key) {
    ctx.problem(res, 400, 'invalid_idempotency_key', 'Bad Request', 'Idempotency-Key is required.', 'trace-release-live');
    return;
  }
  const fingerprint = JSON.stringify({ tenantId, spaceId, releaseId, action });
  const prior = records.get(key);
  if (prior) {
    if (prior.fingerprint !== fingerprint) {
      ctx.problem(res, 409, 'idempotency_key_reused', 'Conflict', 'This idempotency key was used for a different request.', 'trace-release-live');
      return;
    }
    ctx.send(res, 200, prior.body);
    return;
  }
  const scenario = scenarios.get(spaceId);
  const chosen = scenario?.releases.find((release) => release.id === releaseId);
  if (!chosen || !allowed(chosen, action)) {
    ctx.problem(res, 409, 'release_state_conflict', 'Conflict', 'The release state has moved.', 'trace-release-live');
    return;
  }
  for (const release of scenario.releases) {
    if (release.status === 'live' && release.id !== chosen.id) {
      release.status = 'archived';
      release.promotedAt = null;
      release.allowedActions = ['rollback'];
    }
  }
  chosen.status = 'live';
  chosen.promotedAt = new Date().toISOString();
  chosen.allowedActions = ['read'];
  const body = detail(chosen);
  records.set(key, { fingerprint, body });
  ctx.send(res, 200, body);
}

function allowed(release, action) {
  if (action === 'rollback') return release.status === 'archived';
  return release.status === 'validated' || release.status === 'archived';
}

function find(spaceId, releaseId) {
  return scenarios.get(spaceId)?.releases.find((release) => release.id === releaseId) ?? null;
}

function summary(release) {
  return {
    id: release.id,
    label: release.label,
    status: release.status,
    source: source(),
    pageCount: release.pages.length,
    createdAt: release.createdAt,
    promotedAt: release.promotedAt,
    allowedActions: release.allowedActions
  };
}

function detail(release) {
  return {
    ...summary(release),
    notes: '',
    report: { errors: [], warnings: [], info: [] },
    diffSummary: { added: 0, changed: 0, removed: 0 },
    size: 128
  };
}

function source() {
  return { kind: 'build', ref: 'manual', actor: actorId };
}

function idempotencyKey(req) {
  const value = req.headers['idempotency-key'];
  const key = typeof value === 'string' ? value.trim() : '';
  if (!key || key.length > 128 || !/^[a-zA-Z0-9._:-]+$/.test(key)) return '';
  return key;
}

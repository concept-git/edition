// @ts-nocheck
const actorId = '22222222-2222-4222-8222-222222222222';

/** @type {Map<string, { fingerprint: string, body: Record<string, unknown> }>} */
let records = new Map();

export async function handle(req, res, ctx) {
  const { url } = ctx;
  if (req.method === 'POST' && url.pathname === '/__stub/publish-page') {
    records = new Map();
    ctx.send(res, 200, { ok: true });
    return true;
  }
  if (req.method !== 'POST') return false;

  const mark = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/pages\/([^/]+):(publish|unpublish)$/);
  if (!mark) return false;

  const pageId = decodeURIComponent(mark[3]);
  const action = mark[4];
  const key = idempotencyKey(req);
  if (!key) {
    ctx.problem(res, 400, 'invalid_idempotency_key', 'Bad Request', 'Idempotency-Key is required.', 'trace-publish-key');
    return true;
  }
  const status = action === 'publish' ? 'published' : 'draft';
  const fingerprint = JSON.stringify({ spaceId: decodeURIComponent(mark[2]), pageId, action });
  const prior = records.get(key);
  if (prior) {
    if (prior.fingerprint !== fingerprint) {
      ctx.problem(res, 409, 'idempotency_key_reused', 'Conflict', 'This idempotency key was used for a different request.', 'trace-publish-key');
      return true;
    }
    ctx.send(res, 200, prior.body);
    return true;
  }
  const body = {
    page: pageView(pageId, status),
    outcome: 'unchanged',
    release: null
  };
  records.set(key, { fingerprint, body });
  ctx.send(res, 200, body);
  return true;
}

function pageView(pageId, status) {
  return {
    id: pageId,
    title: '',
    slug: '',
    status,
    format: 'markdown',
    icon: null,
    tags: [],
    driftFlag: false,
    updatedAt: new Date().toISOString(),
    updatedBy: actorId,
    publishedAt: null,
    allowedActions: ['read', 'edit'],
    content: '',
    revision: 0,
    seo: { title: null, description: null, keywords: null, ogImage: null, noIndex: false },
    properties: {},
    attachments: [],
    trashedAt: null,
    revisionCount: 0,
    wordCount: 0,
    readingTime: 0,
    contentType: 'markdown',
    versionRef: null,
    interpretation: {}
  };
}

function idempotencyKey(req) {
  const value = req.headers['idempotency-key'];
  const key = typeof value === 'string' ? value.trim() : '';
  if (!key || key.length > 128 || !/^[a-zA-Z0-9._:-]+$/.test(key)) return '';
  return key;
}

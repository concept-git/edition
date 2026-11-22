import { Readable } from 'node:stream';

const actorId = '22222222-2222-4222-8222-222222222222';
const limitBytes = 2 * 1024 * 1024;

/** @type {Map<string, Array<Record<string, unknown>>>} */
let pages = new Map();
/** @type {Map<string, { fingerprint: string, status: number, body: Record<string, unknown>, etag: string }>} */
let records = new Map();
let conflictsLeft = 0;

const formats = new Set(['markdown', 'html', 'txt', 'json', 'xml']);

export async function handle(req, res, ctx) {
  const { url } = ctx;
  if (req.method === 'POST' && url.pathname === '/__stub/pages') {
    const body = await ctx.readJson(req);
    if (body.reset) {
      pages = new Map();
      records = new Map();
      conflictsLeft = 0;
    }
    if (typeof body.conflicts === 'number') conflictsLeft = body.conflicts;
    ctx.send(res, 200, { ok: true });
    return true;
  }

  if (!fromPages(req)) return false;
  if (url.searchParams.has('limit')) return false;

  const content = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/pages\/([^/:]+)\/content$/);
  if (content) {
    const page = find(content[2], content[3]);
    if (!page) return false;
    if (req.method === 'GET') {
      ctx.send(res, 200, snapshot(page), { etag: etag(page) });
      return true;
    }
    if (req.method === 'PUT') {
      await edit(req, res, ctx, page);
      return true;
    }
  }

  const one = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/pages\/([^/:]+)$/);
  if (one && req.method === 'GET') {
    const page = find(one[2], one[3]);
    if (!page) return false;
    ctx.send(res, 200, detail(page), { etag: etag(page) });
    return true;
  }

  const collection = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/pages$/);
  if (collection) {
    const spaceId = collection[2];
    if (req.method === 'GET') {
      const items = bucket(spaceId).map((page) => summary(page));
      ctx.send(res, 200, { items, nextCursor: null, total: items.length, allowedActions: ['create', 'read'] });
      return true;
    }
    if (req.method === 'POST') {
      const raw = await readRaw(req);
      let body = {};
      try {
        body = raw.length === 0 ? {} : JSON.parse(raw.toString('utf8'));
      } catch {
        ctx.problem(res, 400, 'malformed_json', 'Bad Request', 'The request body is not JSON.', 'trace-page-json');
        return true;
      }
      if (typeof body.contentType === 'string' && body.contentType.trim()) {
        rewind(req, raw);
        return false;
      }
      await create(req, res, ctx, spaceId, body);
      return true;
    }
  }

  return false;
}

async function create(req, res, ctx, spaceId, body) {
  const key = idempotencyKey(req);
  if (!key) {
    ctx.problem(res, 400, 'invalid_idempotency_key', 'Bad Request', 'Idempotency-Key is required.', 'trace-page-key');
    return;
  }
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const format = typeof body.format === 'string' ? body.format : '';
  const slug = typeof body.slug === 'string' ? body.slug : '';
  const fingerprint = JSON.stringify({ spaceId, title, format, slug });
  const prior = records.get(`create:${key}`);
  if (prior) {
    if (prior.fingerprint !== fingerprint) {
      ctx.problem(res, 409, 'idempotency_key_reused', 'Conflict', 'This idempotency key was used for a different request.', 'trace-page-key');
      return;
    }
    ctx.send(res, prior.status, prior.body, { etag: prior.etag });
    return;
  }
  if (!formats.has(format)) {
    ctx.problem(res, 422, 'validation_failed', 'Unprocessable Content', 'Page format is invalid.', 'trace-page-format');
    return;
  }
  if (title.length < 1 || title.length > 200) {
    ctx.problem(res, 422, 'validation_failed', 'Unprocessable Content', 'Page title length is invalid.', 'trace-page-title');
    return;
  }
  if (!validSlug(slug) || bucket(spaceId).some((page) => page.slug === slug)) {
    ctx.problem(res, 409, 'slug_taken', 'Conflict', 'The page address is invalid or already used.', 'trace-page-slug');
    return;
  }
  const now = new Date().toISOString();
  const page = {
    id: crypto.randomUUID(),
    title,
    slug,
    format,
    content: '',
    revision: 0,
    updatedAt: now,
    revisions: []
  };
  bucket(spaceId).push(page);
  const bodyOut = detail(page);
  records.set(`create:${key}`, { fingerprint, status: 201, body: bodyOut, etag: etag(page) });
  ctx.send(res, 201, bodyOut, { etag: etag(page) });
}

async function edit(req, res, ctx, page) {
  const key = idempotencyKey(req);
  if (!key) {
    ctx.problem(res, 400, 'invalid_idempotency_key', 'Bad Request', 'Idempotency-Key is required.', 'trace-page-key');
    return;
  }
  const match = revisionOf(req.headers['if-match']);
  if (match === null) {
    ctx.problem(res, 428, 'precondition_required', 'Precondition Required', 'If-Match is required.', 'trace-page-baseline');
    return;
  }
  const body = await ctx.readJson(req);
  const content = typeof body.content === 'string' ? body.content : null;
  if (content === null) {
    ctx.problem(res, 422, 'validation_failed', 'Unprocessable Content', 'Page content is missing.', 'trace-page-content');
    return;
  }
  const fingerprint = JSON.stringify({ pageId: page.id, revision: match, content });
  const prior = records.get(`edit:${key}`);
  if (prior) {
    if (prior.fingerprint !== fingerprint) {
      ctx.problem(res, 409, 'idempotency_key_reused', 'Conflict', 'This idempotency key was used for a different request.', 'trace-page-key');
      return;
    }
    ctx.send(res, prior.status, prior.body, { etag: prior.etag });
    return;
  }
  if (conflictsLeft > 0) {
    conflictsLeft -= 1;
    ctx.problem(res, 409, 'edit_conflict', 'Conflict', 'The page baseline changed.', 'trace-page-conflict');
    return;
  }
  if (match !== page.revision) {
    ctx.problem(res, 409, 'edit_conflict', 'Conflict', 'The page baseline changed.', 'trace-page-conflict');
    return;
  }
  if (Buffer.byteLength(content, 'utf8') > limitBytes) {
    ctx.problem(res, 422, 'validation_failed', 'Unprocessable Content', 'Content exceeds 2 MiB.', 'trace-page-size');
    return;
  }
  storeRevision(page, content, null);
  const bodyOut = detail(page);
  const tag = etag(page);
  records.set(`edit:${key}`, { fingerprint, status: 200, body: bodyOut, etag: tag });
  ctx.send(res, 200, bodyOut, { etag: tag });
}

export function findPage(spaceId, pageId) {
  return find(spaceId, pageId) ?? null;
}

export function storeRevision(page, content, note) {
  const latest = page.revisions.at(-1);
  const created = new Date();
  if (latest && Date.parse(latest.createdAt) >= created.getTime()) {
    created.setTime(Date.parse(latest.createdAt) + 1);
  }
  page.content = content;
  page.revision += 1;
  page.updatedAt = created.toISOString();
  const sizeBytes = Buffer.byteLength(content, 'utf8');
  const previous = latest ? latest.sizeBytes : 0;
  page.revisions.push({
    n: page.revision,
    content,
    createdAt: page.updatedAt,
    note,
    sizeBytes,
    sizeDelta: sizeBytes - previous
  });
}

function find(spaceId, pageId) {
  return bucket(spaceId).find((page) => page.id === pageId);
}

function bucket(spaceId) {
  const found = pages.get(spaceId);
  if (found) return found;
  const created = [];
  pages.set(spaceId, created);
  return created;
}

function summary(page) {
  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    status: 'draft',
    format: page.format,
    icon: null,
    tags: [],
    driftFlag: false,
    updatedAt: page.updatedAt,
    updatedBy: actorId,
    publishedAt: null,
    allowedActions: ['read', 'edit'],
    contentType: page.format,
    versionRef: null,
    interpretation: {}
  };
}

function detail(page) {
  return {
    ...summary(page),
    content: page.content,
    revision: page.revision,
    seo: { title: null, description: null, keywords: null, ogImage: null, noIndex: false },
    properties: {},
    attachments: [],
    trashedAt: null,
    revisionCount: page.revision,
    wordCount: 0,
    readingTime: 0
  };
}

function snapshot(page) {
  return {
    id: page.id,
    format: page.format,
    content: page.content,
    revision: page.revision,
    contentType: page.format,
    versionRef: null,
    interpretation: {}
  };
}

function etag(page) {
  return `"rev-${page.revision}"`;
}

function revisionOf(header) {
  const value = Array.isArray(header) ? header[0] : header;
  if (typeof value !== 'string') return null;
  const match = /^"rev-(\d+)"$/.exec(value.trim());
  if (!match) return null;
  return Number(match[1]);
}

function idempotencyKey(req) {
  const value = req.headers['idempotency-key'];
  return typeof value === 'string' ? value.trim() : '';
}

async function readRaw(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function rewind(req, raw) {
  const stream = Readable.from([raw]);
  req[Symbol.asyncIterator] = () => stream[Symbol.asyncIterator]();
}

function fromPages(req) {
  const referer = req.headers.referer ?? '';
  if (!referer) return false;
  try {
    const path = new URL(referer, 'http://127.0.0.1').pathname;
    return /^\/content\/spaces\/[^/]+\/pages\/?$/.test(path);
  } catch {
    return false;
  }
}

function validSlug(slug) {
  if (slug.length < 1 || slug.length > 2048 || slug.startsWith('/') || slug.endsWith('/')) return false;
  return !slug.split('/').some((segment) => segment.trim() === '' || segment === '.' || segment === '..');
}

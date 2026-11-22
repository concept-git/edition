import { findPage, storeRevision } from './06-page-source.mjs';

const actorId = '22222222-2222-4222-8222-222222222222';

/** @type {Map<string, { fingerprint: string, status: number, body: Record<string, unknown>, etag: string }>} */
let records = new Map();

export async function handle(req, res, ctx) {
  const { url } = ctx;
  if (!fromPages(req)) return false;

  const diff = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/pages\/([^/:]+)\/revisions:diff$/);
  if (diff && req.method === 'GET') {
    const page = findPage(diff[2], diff[3]);
    if (!page) return missing(res, ctx);
    const from = integer(url.searchParams.get('from'));
    const to = integer(url.searchParams.get('to'));
    const before = revision(page, from);
    const after = revision(page, to);
    if (!before || !after) return missing(res, ctx);
    ctx.send(res, 200, { from, to, hunks: hunks(before.content, after.content) });
    return true;
  }

  const one = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/pages\/([^/:]+)\/revisions\/(\d+)$/);
  if (one && req.method === 'GET') {
    const page = findPage(one[2], one[3]);
    if (!page) return missing(res, ctx);
    const stored = revision(page, Number(one[4]));
    if (!stored) return missing(res, ctx);
    ctx.send(res, 200, detail(page, stored));
    return true;
  }

  const list = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/pages\/([^/:]+)\/revisions$/);
  if (list && req.method === 'GET') {
    const page = findPage(list[2], list[3]);
    if (!page) return missing(res, ctx);
    const items = [...page.revisions].reverse().map((stored) => entry(stored));
    ctx.send(res, 200, { items, nextCursor: null });
    return true;
  }

  const revert = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/pages\/([^/:]+):revert$/);
  if (revert && req.method === 'POST') {
    const page = findPage(revert[2], revert[3]);
    if (!page) return missing(res, ctx);
    await restore(req, res, ctx, page);
    return true;
  }

  return false;
}

async function restore(req, res, ctx, page) {
  const key = idempotencyKey(req);
  if (!key) {
    ctx.problem(res, 400, 'invalid_idempotency_key', 'Bad Request', 'Idempotency-Key is required.', 'trace-revision-key');
    return;
  }
  const match = revisionOf(req.headers['if-match']);
  if (match === null) {
    ctx.problem(res, 428, 'precondition_required', 'Precondition Required', 'If-Match is required.', 'trace-revision-baseline');
    return;
  }
  const body = await ctx.readJson(req);
  const n = integer(body.n);
  if (n === null) {
    ctx.problem(res, 422, 'validation_failed', 'Unprocessable Content', 'Revision number is invalid.', 'trace-revision-n');
    return;
  }
  const fingerprint = JSON.stringify({ pageId: page.id, revision: match, n });
  const prior = records.get(`revert:${key}`);
  if (prior) {
    if (prior.fingerprint !== fingerprint) {
      ctx.problem(res, 409, 'idempotency_key_reused', 'Conflict', 'This idempotency key was used for a different request.', 'trace-revision-key');
      return;
    }
    ctx.send(res, prior.status, prior.body, { etag: prior.etag });
    return;
  }
  if (match !== page.revision) {
    ctx.problem(res, 409, 'edit_conflict', 'Conflict', 'The page baseline changed.', 'trace-revision-conflict');
    return;
  }
  const stored = revision(page, n);
  if (!stored) {
    ctx.problem(res, 404, 'revision_not_found', 'Not Found', 'The revision does not exist.', 'trace-revision');
    return;
  }
  storeRevision(page, stored.content, `restored-from:${n}`);
  const bodyOut = saved(page);
  const tag = `"rev-${page.revision}"`;
  records.set(`revert:${key}`, { fingerprint, status: 200, body: bodyOut, etag: tag });
  ctx.send(res, 200, bodyOut, { etag: tag });
}

function missing(res, ctx) {
  ctx.problem(res, 404, 'revision_not_found', 'Not Found', 'The revision does not exist.', 'trace-revision');
  return true;
}

function revision(page, n) {
  if (n === null) return null;
  return page.revisions.find((stored) => stored.n === n) ?? null;
}

function entry(stored) {
  return {
    n: stored.n,
    actor: { type: 'user', id: actorId, displayName: '维护者', status: 'active' },
    createdAt: stored.createdAt,
    note: stored.note,
    sizeBytes: stored.sizeBytes,
    sizeDelta: stored.sizeDelta
  };
}

function detail(page, stored) {
  return {
    ...entry(stored),
    content: stored.content,
    contentType: page.format,
    versionRef: null,
    interpretation: {}
  };
}

function saved(page) {
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
    content: page.content,
    revision: page.revision,
    seo: { title: null, description: null, keywords: null, ogImage: null, noIndex: false },
    properties: {},
    attachments: [],
    trashedAt: null,
    revisionCount: page.revisions.length,
    wordCount: 0,
    readingTime: 0,
    contentType: page.format,
    versionRef: null,
    interpretation: {}
  };
}

function hunks(before, after) {
  const oldLines = lines(before);
  const newLines = lines(after);
  const next = lcs(oldLines, newLines);
  /** @type {Array<{ oldStart: number, oldLines: number, newStart: number, newLines: number, lines: Array<{ type: string, content: string }> }>} */
  const grouped = [];
  /** @type {{ oldStart: number, oldLines: number, newStart: number, newLines: number, lines: Array<{ type: string, content: string }> } | null} */
  let current = null;
  let i = 0;
  let j = 0;
  const flush = () => {
    if (!current) return;
    grouped.push(current);
    current = null;
  };
  const open = () => {
    current ??= { oldStart: i + 1, oldLines: 0, newStart: j + 1, newLines: 0, lines: [] };
    return current;
  };
  while (i < oldLines.length && j < newLines.length) {
    if (oldLines[i] === newLines[j]) {
      flush();
      i += 1;
      j += 1;
    } else if (next[i + 1][j] >= next[i][j + 1]) {
      const hunk = open();
      hunk.lines.push({ type: 'delete', content: oldLines[i] });
      hunk.oldLines += 1;
      i += 1;
    } else {
      const hunk = open();
      hunk.lines.push({ type: 'add', content: newLines[j] });
      hunk.newLines += 1;
      j += 1;
    }
  }
  while (i < oldLines.length) {
    const hunk = open();
    hunk.lines.push({ type: 'delete', content: oldLines[i] });
    hunk.oldLines += 1;
    i += 1;
  }
  while (j < newLines.length) {
    const hunk = open();
    hunk.lines.push({ type: 'add', content: newLines[j] });
    hunk.newLines += 1;
    j += 1;
  }
  flush();
  return grouped;
}

function lcs(oldLines, newLines) {
  const height = oldLines.length;
  const width = newLines.length;
  const scores = Array.from({ length: height + 1 }, () => Array(width + 1).fill(0));
  for (let i = height - 1; i >= 0; i -= 1) {
    for (let j = width - 1; j >= 0; j -= 1) {
      scores[i][j] = oldLines[i] === newLines[j] ? scores[i + 1][j + 1] + 1 : Math.max(scores[i + 1][j], scores[i][j + 1]);
    }
  }
  return scores;
}

function lines(value) {
  if (value === '') return [];
  return value.split(/\r\n|\r|\n/);
}

function integer(value) {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 1) return value;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return parsed >= 1 ? parsed : null;
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

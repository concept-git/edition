// @ts-nocheck
import { readSpace } from './05-spaces.mjs';
import { findPage, markDrift, pageEtag, renderPage, storeRevision } from './06-page-source.mjs';
import { claimUpload } from './15-import.mjs';

const actorId = '22222222-2222-4222-8222-222222222222';
const limitBytes = 2 * 1024 * 1024;

/** @type {Map<string, Array<Record<string, unknown>>>} */
let releases = new Map();
/** @type {Map<string, Array<{ pageId: string, slug: string, title: string, externalId: string }>>} */
let drifts = new Map();
/** @type {Map<string, Record<string, unknown>>} */
let jobs = new Map();
/** @type {Map<string, { fingerprint: string, status: number, body: Record<string, unknown>, etag?: string }>} */
let records = new Map();
let sequence = 0;

export function releaseItems(spaceId) {
  return (releases.get(spaceId) ?? []).map((release) => summary(release));
}

export async function handle(req, res, ctx) {
  const { url } = ctx;
  if (req.method === 'POST' && url.pathname === '/__stub/hotfix') {
    const body = await ctx.readJson(req);
    if (body.reset) reset();
    ctx.send(res, 200, { ok: true });
    return true;
  }

  const content = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/pages\/([^/]+)\/content$/);
  if (content && req.method === 'PUT') {
    await edit(req, res, ctx, decodeURIComponent(content[1]), decodeURIComponent(content[2]), decodeURIComponent(content[3]));
    return true;
  }

  const uploadStart = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/releases:import-uploads$/);
  if (uploadStart && req.method === 'POST' && authored(uploadStart[1], uploadStart[2])) {
    rejectAuthored(res, ctx);
    return true;
  }

  const importing = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/releases:import$/);
  if (importing && req.method === 'POST') {
    const tenantId = decodeURIComponent(importing[1]);
    const spaceId = decodeURIComponent(importing[2]);
    if (authored(tenantId, spaceId)) {
      rejectAuthored(res, ctx);
      return true;
    }
    if (hasDrift(spaceId)) {
      await startOverwrite(req, res, ctx, tenantId, spaceId);
      return true;
    }
    return false;
  }

  const viewed = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/import-jobs\/([^/]+)$/);
  if (viewed && req.method === 'GET') {
    const job = jobs.get(decodeURIComponent(viewed[3]));
    if (!job || job.spaceId !== decodeURIComponent(viewed[2])) return false;
    advance(job);
    ctx.send(res, 200, renderJob(job));
    return true;
  }

  const drift = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/drift$/);
  if (drift && req.method === 'GET') {
    const items = drifts.get(decodeURIComponent(drift[2])) ?? [];
    ctx.send(res, 200, { driftCount: items.length, items });
    return true;
  }

  const approve = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/releases\/([^/]+):approve$/);
  if (approve && req.method === 'POST') {
    await approveRelease(req, res, ctx, decodeURIComponent(approve[2]), decodeURIComponent(approve[3]));
    return true;
  }

  const promote = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/releases\/([^/]+):promote$/);
  if (promote && req.method === 'POST') {
    const release = findRelease(decodeURIComponent(promote[2]), decodeURIComponent(promote[3]));
    if (!release) {
      ctx.problem(res, 404, 'release_not_found', 'Not Found', 'The release does not exist.', 'trace-release');
      return true;
    }
    if (release.status === 'flagged') {
      ctx.problem(res, 409, 'release_not_flagged', 'Conflict', '确认前不能成为主版本。', 'trace-release-promote');
      return true;
    }
    return false;
  }

  return false;
}

async function edit(req, res, ctx, tenantId, spaceId, pageId) {
  const space = readSpace(tenantId, spaceId);
  if (!space || space.mode !== 'synced') {
    ctx.problem(res, 409, 'space_mode_restricted', 'Conflict', 'Hotfix is only for an existing page in a synced space.', 'trace-hotfix-mode');
    return;
  }
  const page = findPage(spaceId, pageId);
  if (!page) {
    ctx.problem(res, 404, 'page_not_found', 'Not Found', 'The page does not exist.', 'trace-hotfix-page');
    return;
  }
  const key = idempotencyKey(req);
  if (!key) {
    ctx.problem(res, 400, 'invalid_idempotency_key', 'Bad Request', 'Idempotency-Key is required.', 'trace-hotfix-key');
    return;
  }
  const match = revisionOf(req.headers['if-match']);
  if (match === null) {
    ctx.problem(res, 428, 'precondition_required', 'Precondition Required', 'If-Match is required.', 'trace-hotfix-baseline');
    return;
  }
  const body = await ctx.readJson(req);
  if (body.intent !== 'hotfix') {
    ctx.problem(res, 422, 'validation_failed', 'Unprocessable Content', 'Hotfix intent is required.', 'trace-hotfix-intent');
    return;
  }
  const content = typeof body.content === 'string' ? body.content : null;
  if (content === null) {
    ctx.problem(res, 422, 'validation_failed', 'Unprocessable Content', 'Page content is missing.', 'trace-hotfix-content');
    return;
  }
  const fingerprint = JSON.stringify({ pageId, revision: match, content, intent: 'hotfix' });
  const prior = records.get(`edit:${key}`);
  if (prior) {
    if (prior.fingerprint !== fingerprint) {
      ctx.problem(res, 409, 'idempotency_key_reused', 'Conflict', 'This idempotency key was used for a different request.', 'trace-hotfix-key');
      return;
    }
    ctx.send(res, prior.status, prior.body, { etag: prior.etag });
    return;
  }
  if (match !== page.revision) {
    ctx.problem(res, 409, 'edit_conflict', 'Conflict', 'The page baseline changed.', 'trace-hotfix-conflict');
    return;
  }
  if (Buffer.byteLength(content, 'utf8') > limitBytes) {
    ctx.problem(res, 422, 'validation_failed', 'Unprocessable Content', 'Content exceeds 2 MiB.', 'trace-hotfix-size');
    return;
  }
  storeRevision(page, content, null);
  markDrift(page);
  rememberDrift(spaceId, page);
  publishHotfix(spaceId, page);
  const bodyOut = renderPage(page);
  const tag = pageEtag(page);
  records.set(`edit:${key}`, { fingerprint, status: 200, body: bodyOut, etag: tag });
  ctx.send(res, 200, bodyOut, { etag: tag });
}

async function startOverwrite(req, res, ctx, tenantId, spaceId) {
  const key = idempotencyKey(req);
  if (!key) {
    ctx.problem(res, 400, 'invalid_idempotency_key', 'Bad Request', 'Idempotency-Key is required.', 'trace-hotfix-import');
    return;
  }
  const body = await ctx.readJson(req);
  const uploadKey = typeof body.uploadKey === 'string' ? body.uploadKey : '';
  const fingerprint = JSON.stringify({ spaceId, uploadKey });
  const prior = records.get(`import:${key}`);
  if (prior) {
    if (prior.fingerprint !== fingerprint) {
      ctx.problem(res, 409, 'idempotency_key_reused', 'Conflict', 'This idempotency key was used for a different request.', 'trace-hotfix-import');
      return;
    }
    ctx.send(res, prior.status, prior.body);
    return;
  }
  if (!claimUpload(spaceId, uploadKey)) {
    ctx.problem(res, 404, 'resource_not_found', 'Not Found', 'The uploaded bundle does not exist.', 'trace-hotfix-import');
    return;
  }
  if ([...releases.get(spaceId) ?? []].some((release) => release.status === 'flagged')) {
    ctx.problem(res, 409, 'import_blocked', 'Conflict', 'A release is already waiting for confirmation.', 'trace-hotfix-import');
    return;
  }
  const job = {
    id: crypto.randomUUID(),
    spaceId,
    tenantId,
    releaseId: null,
    status: 'queued',
    phase: 'queued',
    outcome: null,
    terminal: false,
    successful: false,
    done: null,
    total: null,
    script: ['flagged']
  };
  jobs.set(job.id, job);
  const bodyOut = { job: renderJob(job), release: null };
  records.set(`import:${key}`, { fingerprint, status: 202, body: bodyOut });
  ctx.send(res, 202, bodyOut);
}

async function approveRelease(req, res, ctx, spaceId, releaseId) {
  const key = idempotencyKey(req);
  if (!key) {
    ctx.problem(res, 400, 'invalid_idempotency_key', 'Bad Request', 'Idempotency-Key is required.', 'trace-hotfix-approve');
    return;
  }
  const fingerprint = JSON.stringify({ spaceId, releaseId, action: 'approve' });
  const prior = records.get(`approve:${key}`);
  if (prior) {
    if (prior.fingerprint !== fingerprint) {
      ctx.problem(res, 409, 'idempotency_key_reused', 'Conflict', 'This idempotency key was used for a different request.', 'trace-hotfix-approve');
      return;
    }
    ctx.send(res, prior.status, prior.body);
    return;
  }
  const release = findRelease(spaceId, releaseId);
  if (!release || release.status !== 'flagged') {
    ctx.problem(res, 409, 'release_not_flagged', 'Conflict', '确认前不能成为主版本。', 'trace-hotfix-approve');
    return;
  }
  const bucket = releases.get(spaceId) ?? [];
  for (const item of bucket) {
    if (item.status === 'live') item.status = 'archived';
  }
  release.status = 'live';
  release.promotedAt = new Date().toISOString();
  release.allowedActions = ['read'];
  const bodyOut = { outcome: 'promoted', release: releaseBody(release) };
  records.set(`approve:${key}`, { fingerprint, status: 200, body: bodyOut });
  ctx.send(res, 200, bodyOut);
}

function publishHotfix(spaceId, page) {
  sequence += 1;
  const now = new Date().toISOString();
  const bucket = releases.get(spaceId) ?? [];
  for (const item of bucket) {
    if (item.status === 'live') item.status = 'archived';
  }
  bucket.unshift({
    id: crypto.randomUUID(),
    label: `第 ${sequence} 份发版`,
    status: 'live',
    source: { kind: 'build', ref: page.id, actor: actorId },
    pageCount: 1,
    createdAt: now,
    promotedAt: now,
    allowedActions: ['read'],
    notes: '',
    report: { errors: [], warnings: [], info: [] },
    diffSummary: { added: 0, changed: 1, removed: 0 },
    size: Buffer.byteLength(page.content, 'utf8')
  });
  releases.set(spaceId, bucket);
}

function advance(job) {
  if (job.terminal) return;
  const step = job.script.shift();
  if (step !== 'flagged') return;
  const release = flagRelease(job.spaceId);
  job.releaseId = release.id;
  job.status = 'completed';
  job.phase = 'validating';
  job.outcome = 'flagged';
  job.terminal = true;
  job.successful = false;
  job.done = 1;
  job.total = 1;
}

function flagRelease(spaceId) {
  sequence += 1;
  const now = new Date().toISOString();
  const release = {
    id: crypto.randomUUID(),
    label: `第 ${sequence} 份发版`,
    status: 'flagged',
    source: { kind: 'import', ref: 'bundle', actor: actorId },
    pageCount: 1,
    createdAt: now,
    promotedAt: null,
    allowedActions: ['approve', 'read'],
    notes: '',
    report: {
      errors: [],
      warnings: [{ code: 'drift_overwrite', path: null, pageId: null, detail: '将覆盖热修页' }],
      info: []
    },
    diffSummary: { added: 0, changed: 1, removed: 0 },
    size: 128
  };
  const bucket = releases.get(spaceId) ?? [];
  bucket.unshift(release);
  releases.set(spaceId, bucket);
  return release;
}

function rememberDrift(spaceId, page) {
  const items = drifts.get(spaceId) ?? [];
  if (!items.some((item) => item.pageId === page.id)) {
    items.push({ pageId: page.id, slug: page.slug, title: page.title, externalId: page.slug });
  }
  drifts.set(spaceId, items);
}

function hasDrift(spaceId) {
  return (drifts.get(spaceId) ?? []).length > 0;
}

function authored(tenantId, spaceId) {
  const space = readSpace(decodeURIComponent(tenantId), decodeURIComponent(spaceId));
  return space?.mode === 'authored';
}

function findRelease(spaceId, releaseId) {
  return (releases.get(spaceId) ?? []).find((release) => release.id === releaseId) ?? null;
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

function releaseBody(release) {
  return { ...release };
}

function renderJob(job) {
  return {
    id: job.id,
    status: job.status,
    phase: job.phase,
    progress: { done: job.done, total: job.total },
    attempt: 1,
    nextRunAt: job.terminal ? null : new Date().toISOString(),
    traceId: 'trace-hotfix-import',
    outcome: job.outcome,
    releaseId: job.releaseId,
    sourceUrl: null,
    adapterId: null,
    report: { errors: [], info: [] },
    terminal: job.terminal,
    successful: job.successful,
    nextPollAfterSeconds: job.terminal ? null : 1
  };
}

function rejectAuthored(res, ctx) {
  ctx.problem(
    res,
    409,
    'space_mode_restricted',
    'Conflict',
    'Authored spaces keep interface authoring and reject a whole-bundle import.',
    'trace-import-mode'
  );
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
  const key = typeof value === 'string' ? value.trim() : '';
  if (!key || key.length > 128 || !/^[a-zA-Z0-9._:-]+$/.test(key)) return '';
  return key;
}

function reset() {
  releases = new Map();
  drifts = new Map();
  jobs = new Map();
  records = new Map();
  sequence = 0;
}

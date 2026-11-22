// @ts-nocheck
const actorId = '22222222-2222-4222-8222-222222222222';

/** @type {Map<string, { key: string, spaceId: string, title: string, received: boolean }>} */
let uploads = new Map();
/** @type {Map<string, Job>} */
let jobs = new Map();
/** @type {Map<string, Array<Record<string, unknown>>>} */
let pages = new Map();
/** @type {Map<string, { fingerprint: string, status: number, body: Record<string, unknown> }>} */
let imports = new Map();
/** @type {Map<string, { fingerprint: string }>} */
let retries = new Map();

/**
 * @typedef {Object} Job
 * @property {string} id
 * @property {string} spaceId
 * @property {string} title
 * @property {number} attempt
 * @property {string} releaseId
 * @property {string} traceId
 * @property {string} status
 * @property {string} phase
 * @property {string | null} outcome
 * @property {boolean} terminal
 * @property {boolean} successful
 * @property {number | null} done
 * @property {number | null} total
 * @property {Array<{ code: string, path: string | null, detail: string | null }>} errors
 * @property {string[]} script
 * @property {boolean} mirrored
 */

export async function handle(req, res, ctx) {
  const { url } = ctx;
  if (req.method === 'POST' && url.pathname === '/__stub/imports') {
    const body = await ctx.readJson(req);
    if (body.reset) reset();
    ctx.send(res, 200, { ok: true });
    return true;
  }

  const uploadStart = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/releases:import-uploads$/);
  if (uploadStart && req.method === 'POST') {
    const spaceId = decodeURIComponent(uploadStart[2]);
    const key = crypto.randomUUID();
    uploads.set(key, { key, spaceId, title: '导入的页面', received: false });
    ctx.send(res, 200, {
      putUrl: `/api/v1/tenants/${uploadStart[1]}/spaces/${uploadStart[2]}/import-uploads/${key}`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      uploadKey: key
    });
    return true;
  }

  const uploadPut = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/import-uploads\/([^/]+)$/);
  if (uploadPut && req.method === 'PUT') {
    const upload = uploads.get(decodeURIComponent(uploadPut[3]));
    if (!upload) {
      ctx.problem(res, 404, 'resource_not_found', 'Not Found', 'The upload does not exist.', 'trace-import-upload');
      return true;
    }
    upload.title = titleFrom(await readRaw(req));
    upload.received = true;
    res.writeHead(204);
    res.end();
    return true;
  }

  const start = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/releases:import$/);
  if (start && req.method === 'POST') {
    await startImport(req, res, ctx, decodeURIComponent(start[1]), decodeURIComponent(start[2]));
    return true;
  }

  const viewed = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/import-jobs\/([^/]+)$/);
  if (viewed && req.method === 'GET') {
    const job = jobs.get(decodeURIComponent(viewed[3]));
    if (!job || job.spaceId !== decodeURIComponent(viewed[2])) {
      ctx.problem(res, 404, 'import_job_not_found', 'Not Found', 'The import job does not exist.', 'trace-import-job');
      return true;
    }
    advance(job);
    ctx.send(res, 200, render(job));
    return true;
  }

  const again = url.pathname.match(/^\/ops\/jobs\/([^/]+):retry$/);
  if (again && req.method === 'POST') {
    await retry(req, res, ctx, decodeURIComponent(again[1]));
    return true;
  }

  const listed = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/pages$/);
  if (listed && req.method === 'GET' && !url.searchParams.has('status')) {
    if (!fromSpaceContent(req)) return false;
    const items = pages.get(decodeURIComponent(listed[2])) ?? [];
    ctx.send(res, 200, { items, nextCursor: null, total: items.length, allowedActions: ['read', 'create'] });
    return true;
  }

  return false;
}

async function startImport(req, res, ctx, tenantId, spaceId) {
  const key = header(req, 'idempotency-key');
  if (!key) {
    ctx.problem(res, 400, 'invalid_idempotency_key', 'Bad Request', 'Idempotency-Key is required.', 'trace-import-key');
    return;
  }
  const body = await ctx.readJson(req);
  const uploadKey = typeof body.uploadKey === 'string' ? body.uploadKey : '';
  const url = typeof body.url === 'string' ? body.url : '';
  const fingerprint = JSON.stringify({ spaceId, uploadKey, url });
  const prior = imports.get(key);
  if (prior) {
    if (prior.fingerprint !== fingerprint) {
      ctx.problem(res, 409, 'idempotency_key_reused', 'Conflict', 'This idempotency key was used for a different request.', 'trace-import-key');
      return;
    }
    ctx.send(res, prior.status, prior.body);
    return;
  }
  if ((uploadKey === '') === (url === '')) {
    ctx.problem(res, 422, 'validation_failed', 'Unprocessable Content', 'Provide an uploadKey or a url.', 'trace-import-source');
    return;
  }
  const upload = uploads.get(uploadKey);
  if (!upload || !upload.received || upload.spaceId !== spaceId) {
    ctx.problem(res, 404, 'resource_not_found', 'Not Found', 'The uploaded bundle does not exist.', 'trace-import-upload');
    return;
  }
  if ([...jobs.values()].some((job) => job.spaceId === spaceId && !job.terminal)) {
    ctx.problem(res, 409, 'import_in_progress', 'Conflict', 'An import is already running in this space.', 'trace-import-busy');
    return;
  }
  const job = createJob(spaceId, upload.title);
  jobs.set(job.id, job);
  const bodyOut = { job: render(job), release: null };
  imports.set(key, { fingerprint, status: 202, body: bodyOut });
  ctx.send(res, 202, bodyOut);
}

async function retry(req, res, ctx, jobId) {
  const key = header(req, 'idempotency-key');
  if (!key) {
    ctx.problem(res, 400, 'invalid_idempotency_key', 'Bad Request', 'Idempotency-Key is required.', 'trace-import-key');
    return;
  }
  const body = await ctx.readJson(req);
  const tenantId = typeof body.tenantId === 'string' ? body.tenantId : '';
  const fingerprint = JSON.stringify({ tenantId, jobId, platform: body.platform === true });
  const prior = retries.get(key);
  if (prior) {
    if (prior.fingerprint !== fingerprint) {
      ctx.problem(res, 409, 'idempotency_key_reused', 'Conflict', 'This idempotency key was used for a different request.', 'trace-import-key');
      return;
    }
    res.writeHead(204);
    res.end();
    return;
  }
  if (!tenantId) {
    ctx.problem(res, 422, 'validation_failed', 'Unprocessable Content', 'tenantId is required.', 'trace-import-retry');
    return;
  }
  const job = jobs.get(jobId);
  if (!job) {
    ctx.problem(res, 404, 'import_job_not_found', 'Not Found', 'The import job does not exist.', 'trace-import-job');
    return;
  }
  if (job.status !== 'failed' || job.outcome === 'resource_deleted') {
    ctx.problem(res, 409, 'import_not_retryable', 'Conflict', 'This import cannot be run again.', 'trace-import-retry');
    return;
  }
  job.attempt += 1;
  job.status = 'queued';
  job.phase = 'queued';
  job.outcome = null;
  job.terminal = false;
  job.successful = false;
  job.done = null;
  job.total = null;
  job.errors = [];
  job.script = ['queued', 'running', 'completed'];
  retries.set(key, { fingerprint });
  res.writeHead(204);
  res.end();
}

/** @param {Job} job */
function advance(job) {
  if (job.terminal) return;
  const step = job.script.shift() ?? 'completed';
  if (step === 'queued') {
    job.status = 'queued';
    job.phase = 'queued';
    job.outcome = null;
    job.terminal = false;
    job.successful = false;
    job.done = null;
    job.total = null;
    job.errors = [];
    return;
  }
  if (step === 'running') {
    job.status = 'running';
    job.phase = 'inspecting';
    job.outcome = null;
    job.terminal = false;
    job.successful = false;
    job.done = 0;
    job.total = 1;
    job.errors = [];
    return;
  }
  if (step === 'failed') {
    job.status = 'failed';
    job.phase = 'storing';
    job.outcome = 'dependency_failed';
    job.terminal = true;
    job.successful = false;
    job.done = 0;
    job.total = 1;
    job.errors = [{ code: 'dependency_unavailable', path: null, detail: '对象存储暂时不可用' }];
    return;
  }
  job.status = 'completed';
  job.phase = 'mirroring';
  job.outcome = 'promoted';
  job.terminal = true;
  job.successful = true;
  job.done = 1;
  job.total = 1;
  job.errors = [];
  if (!job.mirrored) {
    job.mirrored = true;
    const items = pages.get(job.spaceId) ?? [];
    items.push(pageFrom(job.title));
    pages.set(job.spaceId, items);
  }
}

/** @param {Job} job */
function render(job) {
  return {
    id: job.id,
    status: job.status,
    phase: job.phase,
    progress: { done: job.done, total: job.total },
    attempt: job.attempt,
    nextRunAt: job.terminal ? null : new Date().toISOString(),
    traceId: job.traceId,
    outcome: job.outcome,
    releaseId: job.releaseId,
    sourceUrl: null,
    adapterId: job.successful ? 'bundle-v1' : null,
    report: { errors: job.errors, info: [] },
    terminal: job.terminal,
    successful: job.successful,
    nextPollAfterSeconds: job.terminal ? null : 1
  };
}

/** @param {string} spaceId @param {string} title @returns {Job} */
function createJob(spaceId, title) {
  return {
    id: crypto.randomUUID(),
    spaceId,
    title,
    attempt: 1,
    releaseId: crypto.randomUUID(),
    traceId: 'trace-import',
    status: 'queued',
    phase: 'queued',
    outcome: null,
    terminal: false,
    successful: false,
    done: null,
    total: null,
    errors: [],
    script: ['running', 'failed'],
    mirrored: false
  };
}

/** @param {string} title */
function pageFrom(title) {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title,
    slug: 'guide',
    status: 'published',
    format: 'markdown',
    icon: null,
    tags: [],
    driftFlag: false,
    updatedAt: now,
    updatedBy: actorId,
    publishedAt: now,
    allowedActions: ['read'],
    contentType: 'markdown',
    versionRef: 'markdown',
    interpretation: {}
  };
}

/** @param {Buffer} body */
function titleFrom(body) {
  const text = body.toString('utf8').replaceAll('\0', '').trim();
  if (text.length === 0 || text.length > 120) return '导入的页面';
  return text;
}

/** @param {import('node:http').IncomingMessage} req */
function header(req, name) {
  const value = req.headers[name];
  return typeof value === 'string' ? value.trim() : '';
}

/** @param {import('node:http').IncomingMessage} req */
async function readRaw(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

function reset() {
  uploads = new Map();
  jobs = new Map();
  pages = new Map();
  imports = new Map();
  retries = new Map();
}

function fromSpaceContent(req) {
  const referer = req.headers.referer ?? '';
  if (!referer) return false;
  try {
    const path = new URL(referer, 'http://127.0.0.1').pathname;
    return /\/content\/spaces\/[^/]+\/(?:pages|imports)$/.test(path);
  } catch {
    return false;
  }
}

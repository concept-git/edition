// @ts-nocheck
/**
 * Stand-in for plugin development and the production content-type list.
 * Saving uses baseRevision. A stale baseline is edit_conflict and does not
 * replace the stored source. Compiling a candidate does not change the
 * enabled content-type version. Activating a content type would.
 */

const tenantId = '6f1e0c2a-6b4d-4e3a-9c11-0a1b2c3d4e5f';
const developmentId = '11111111-2222-4333-8444-555555555555';

let armed = false;
let revision = 1;
let name = '问候插件';
let contentType = 'article';
let source = initialSource();
let sourceDigest = 'digest-1';
let activeVersionRef = 'article@1';
let candidates = [];
let replays = new Map();

export async function handle(req, res, ctx) {
  const { url } = ctx;
  if (req.method === 'POST' && url.pathname === '/__stub/plugins/reset') {
    reset(true);
    res.writeHead(204);
    res.end();
    return true;
  }
  if (req.method === 'POST' && url.pathname === '/__stub/plugins/clear') {
    reset(false);
    res.writeHead(204);
    res.end();
    return true;
  }
  if (req.method === 'POST' && url.pathname === '/__stub/plugins/advance') {
    revision += 1;
    sourceDigest = `digest-${revision}`;
    res.writeHead(204);
    res.end();
    return true;
  }

  const base = `/api/v1/tenants/${tenantId}`;
  if (!url.pathname.startsWith(`${base}/content-types`) && !url.pathname.startsWith(`${base}/plugin-developments`)) return false;
  if (!authorized(req)) return unauthorized(res, ctx);

  if (req.method === 'GET' && url.pathname === `${base}/content-types`) {
    ctx.send(res, 200, {
      items: [
        {
          contentType: 'article',
          enabled: true,
          revision: 3,
          activeVersionRef,
          label: '文章',
          format: 'markdown',
          mediaType: 'text/markdown',
          builtin: false
        }
      ],
      canManage: true
    });
    return true;
  }

  if (
    req.method === 'POST' &&
    (url.pathname === `${base}/content-types/activate` ||
      url.pathname === `${base}/content-types/deactivate` ||
      url.pathname === `${base}/content-types/versions`)
  ) {
    activeVersionRef = 'article@changed';
    ctx.send(res, 200, {
      contentType: 'article',
      enabled: true,
      revision: 4,
      activeVersionRef,
      label: '文章',
      format: 'markdown',
      mediaType: 'text/markdown',
      builtin: false
    });
    return true;
  }

  if (url.pathname === `${base}/plugin-developments`) {
    if (req.method === 'GET') {
      ctx.send(res, 200, { items: armed ? [summary()] : [] });
      return true;
    }
    return false;
  }

  const item = url.pathname.match(new RegExp(`^${base}/plugin-developments/([^/]+)$`));
  if (item) {
    if (item[1] !== developmentId) return missing(res, ctx);
    if (req.method === 'GET') {
      ctx.send(res, 200, development());
      return true;
    }
    if (req.method === 'PUT') return save(req, res, ctx);
  }

  const candidatesPath = url.pathname.match(new RegExp(`^${base}/plugin-developments/([^/]+)/candidates$`));
  if (candidatesPath) {
    if (candidatesPath[1] !== developmentId) return missing(res, ctx);
    if (req.method === 'GET') {
      ctx.send(res, 200, { items: candidates.map((candidate) => ({ ...candidate, source: undefined, bundle: undefined })) });
      return true;
    }
    if (req.method === 'POST') return compile(req, res, ctx);
  }

  return false;
}

function reset(nextArmed) {
  armed = nextArmed;
  revision = 1;
  name = '问候插件';
  contentType = 'article';
  source = initialSource();
  sourceDigest = 'digest-1';
  activeVersionRef = 'article@1';
  candidates = [];
  replays = new Map();
}

function initialSource() {
  return {
    files: { 'src/index.js': 'export const greeting = "hello";\n' },
    manifest: '{"name":"greeting","contentTypes":["article"]}',
    configuration: '{}',
    fixtures: '[]',
    dependencyLock: '{}',
    baselineRef: 'article@1'
  };
}

function summary() {
  return {
    id: developmentId,
    name,
    contentType,
    revision,
    sourceDigest,
    createdAt: '2026-11-22T00:00:00.000Z',
    updatedAt: '2026-11-22T00:00:00.000Z'
  };
}

function development() {
  return { ...summary(), source };
}

async function save(req, res, ctx) {
  const key = idempotencyKey(req);
  if (!key) return invalidKey(res, ctx);
  const body = await ctx.readJson(req);
  const fingerprint = JSON.stringify(body);
  const prior = replays.get(key);
  if (prior) return replay(res, ctx, prior, fingerprint);
  if (!body || body.baseRevision !== revision || typeof body.name !== 'string' || typeof body.contentType !== 'string' || !body.source?.files) {
    if (body && body.baseRevision !== revision) {
      const problem = {
        status: 409,
        body: problemBody(409, 'edit_conflict', 'Edit conflict', 'The baseline does not match.', 'trace-plugin-conflict')
      };
      replays.set(key, { fingerprint, ...problem });
      ctx.problem(res, 409, 'edit_conflict', 'Edit conflict', 'The baseline does not match.', 'trace-plugin-conflict');
      return true;
    }
    ctx.problem(res, 422, 'validation_failed', 'Validation failed', 'The source could not be saved.', 'trace-plugin-invalid');
    return true;
  }
  name = body.name;
  contentType = body.contentType;
  source = {
    files: { ...body.source.files },
    manifest: String(body.source.manifest ?? ''),
    configuration: String(body.source.configuration ?? ''),
    fixtures: String(body.source.fixtures ?? ''),
    dependencyLock: String(body.source.dependencyLock ?? ''),
    baselineRef: String(body.source.baselineRef ?? '')
  };
  revision += 1;
  sourceDigest = `digest-${revision}`;
  const payload = { status: 200, body: development() };
  replays.set(key, { fingerprint, ...payload });
  ctx.send(res, 200, payload.body);
  return true;
}

async function compile(req, res, ctx) {
  const key = idempotencyKey(req);
  if (!key) return invalidKey(res, ctx);
  const body = await ctx.readJson(req);
  const fingerprint = JSON.stringify(body);
  const prior = replays.get(key);
  if (prior) return replay(res, ctx, prior, fingerprint);
  if (!body || body.baseRevision !== revision) {
    ctx.problem(res, 409, 'edit_conflict', 'Edit conflict', 'The baseline does not match.', 'trace-plugin-conflict');
    return true;
  }
  if (body.sourceDigest !== sourceDigest) {
    ctx.problem(res, 422, 'validation_failed', 'Validation failed', 'The source digest does not match.', 'trace-plugin-digest');
    return true;
  }
  if (body.environment !== 'browser-es2022-v1' || body.entryPoint !== 'src/index.js' || typeof body.bundle !== 'string' || body.bundle.length === 0) {
    ctx.problem(res, 422, 'validation_failed', 'Validation failed', 'The candidate could not be captured.', 'trace-plugin-candidate');
    return true;
  }
  const candidate = {
    id: `cand-${candidates.length + 1}`,
    developmentId,
    sourceRevision: revision,
    sourceDigest,
    bundleDigest: `bundle-${candidates.length + 1}`,
    entryPoint: body.entryPoint,
    bundle: body.bundle,
    environment: body.environment,
    createdAt: '2026-11-22T01:00:00.000Z'
  };
  candidates.push(candidate);
  const payload = { status: 201, body: { ...candidate, source } };
  replays.set(key, { fingerprint, ...payload });
  ctx.send(res, 201, payload.body);
  return true;
}

function replay(res, ctx, prior, fingerprint) {
  if (prior.fingerprint !== fingerprint) {
    ctx.problem(res, 409, 'idempotency_key_reused', 'Idempotency conflict', 'This key was used for a different request.', 'trace-plugin-replay');
    return true;
  }
  ctx.send(res, prior.status, prior.body);
  return true;
}

function idempotencyKey(req) {
  const value = req.headers['idempotency-key'];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : '';
}

function authorized(req) {
  const header = req.headers.authorization ?? '';
  return header.startsWith('Bearer ') && header.length > 'Bearer '.length;
}

function unauthorized(res, ctx) {
  ctx.problem(res, 401, 'invalid_credentials', 'Authentication rejected', 'The supplied credential is invalid.', 'trace-plugin-auth');
  return true;
}

function missing(res, ctx) {
  ctx.problem(res, 404, 'not_found', 'Not found', 'The plugin development was not found.', 'trace-plugin-missing');
  return true;
}

function invalidKey(res, ctx) {
  ctx.problem(res, 400, 'invalid_idempotency_key', 'Invalid idempotency key', 'Idempotency-Key is required.', 'trace-plugin-key');
  return true;
}

function problemBody(status, code, title, detail, traceId) {
  return { type: `https://space.io/problems/${code.replaceAll('_', '-')}`, title, status, code, detail, traceId };
}

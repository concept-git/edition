const actorId = '22222222-2222-4222-8222-222222222222';

/** @type {Map<string, Array<Record<string, unknown>>>} */
let spaces = new Map();
/** @type {Map<string, { fingerprint: string, status: number, body: Record<string, unknown> }>} */
let records = new Map();
let failedUpdates = 0;

export async function handle(req, res, ctx) {
  const { url } = ctx;
  if (req.method === 'POST' && url.pathname === '/__stub/spaces') {
    const body = await ctx.readJson(req);
    if (body.reset) {
      spaces = new Map();
      records = new Map();
      failedUpdates = 0;
    }
    if (typeof body.failUpdates === 'number') failedUpdates = body.failUpdates;
    ctx.send(res, 200, { ok: true });
    return true;
  }

  const collection = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces$/);
  if (collection) {
    const tenantId = collection[1];
    if (req.method === 'GET') {
      if (!fromSpacesScreen(req)) return false;
      ctx.send(res, 200, {
        items: bucket(tenantId).map((space) => summary(tenantId, space)),
        nextCursor: null,
        total: null,
        allowedActions: ['create', 'read']
      });
      return true;
    }
    if (req.method === 'POST') {
      await create(req, res, ctx, tenantId);
      return true;
    }
  }

  const one = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)$/);
  if (one) {
    const tenantId = one[1];
    const space = bucket(tenantId).find((item) => item.id === one[2]);
    if (!space) {
      ctx.problem(res, 404, 'space_not_found', 'Not Found', 'The space does not exist.', 'trace-space');
      return true;
    }
    if (req.method === 'GET') {
      ctx.send(res, 200, detail(tenantId, space));
      return true;
    }
    if (req.method === 'PATCH') {
      await update(req, res, ctx, tenantId, space);
      return true;
    }
  }

  return false;
}

async function create(req, res, ctx, tenantId) {
  const key = idempotencyKey(req);
  if (!key) {
    ctx.problem(res, 400, 'invalid_idempotency_key', 'Bad Request', 'Idempotency-Key is required.', 'trace-space-key');
    return;
  }
  const body = await ctx.readJson(req);
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const mode = body.mode === 'authored' || body.mode === 'synced' ? body.mode : '';
  const fingerprint = JSON.stringify({ tenantId, name, mode });
  const prior = records.get(`create:${key}`);
  if (prior) {
    if (prior.fingerprint !== fingerprint) {
      ctx.problem(res, 409, 'idempotency_key_reused', 'Conflict', 'This idempotency key was used for a different request.', 'trace-space-key');
      return;
    }
    ctx.send(res, prior.status, prior.body);
    return;
  }
  if (!mode) {
    ctx.problem(res, 422, 'validation_failed', 'Unprocessable Content', 'Space mode is invalid.', 'trace-space-mode');
    return;
  }
  if (name.length === 0 || name.length > 120) {
    ctx.problem(res, 422, 'space_name_invalid', 'Unprocessable Content', 'Space name length is invalid.', 'trace-space-name');
    return;
  }
  const now = new Date().toISOString();
  const space = {
    id: crypto.randomUUID(),
    name,
    mode,
    autoRelease: mode === 'authored',
    createdAt: now,
    updatedAt: now
  };
  bucket(tenantId).push(space);
  const bodyOut = detail(tenantId, space);
  records.set(`create:${key}`, { fingerprint, status: 201, body: bodyOut });
  ctx.send(res, 201, bodyOut);
}

async function update(req, res, ctx, tenantId, space) {
  const key = idempotencyKey(req);
  if (!key) {
    ctx.problem(res, 400, 'invalid_idempotency_key', 'Bad Request', 'Idempotency-Key is required.', 'trace-space-key');
    return;
  }
  const body = await ctx.readJson(req);
  const fingerprint = JSON.stringify({ spaceId: space.id, autoRelease: body.autoRelease ?? null });
  const prior = records.get(`update:${key}`);
  if (prior) {
    if (prior.fingerprint !== fingerprint) {
      ctx.problem(res, 409, 'idempotency_key_reused', 'Conflict', 'This idempotency key was used for a different request.', 'trace-space-key');
      return;
    }
    ctx.send(res, prior.status, prior.body);
    return;
  }
  if (failedUpdates > 0) {
    failedUpdates -= 1;
    ctx.problem(res, 500, 'unexpected_error', 'Unexpected error', 'The request could not be completed.', 'trace-space-update');
    return;
  }
  if (Object.hasOwn(body, 'autoRelease') && space.mode !== 'authored') {
    ctx.problem(res, 409, 'space_mode_restricted', 'Conflict', 'Synced spaces do not keep auto-release.', 'trace-space-mode');
    return;
  }
  if (typeof body.autoRelease === 'boolean') space.autoRelease = body.autoRelease;
  space.updatedAt = new Date().toISOString();
  const bodyOut = detail(tenantId, space);
  records.set(`update:${key}`, { fingerprint, status: 200, body: bodyOut });
  ctx.send(res, 200, bodyOut);
}

function bucket(tenantId) {
  const found = spaces.get(tenantId);
  if (found) return found;
  const created = [];
  spaces.set(tenantId, created);
  return created;
}

function summary(tenantId, space) {
  return {
    id: space.id,
    tenantId,
    name: space.name,
    icon: null,
    mode: space.mode,
    status: 'active',
    pageCount: 0,
    driftCount: 0,
    lastReleaseAt: null,
    createdAt: space.createdAt,
    createdBy: actorId,
    updatedAt: space.updatedAt,
    updatedBy: actorId,
    collectionId: null,
    allowedActions: ['read', 'update']
  };
}

function detail(tenantId, space) {
  return {
    ...summary(tenantId, space),
    description: null,
    collectionPath: [],
    mounts: [],
    retention: 20,
    autoRelease: space.mode === 'authored' ? space.autoRelease : null
  };
}

function idempotencyKey(req) {
  const value = req.headers['idempotency-key'];
  return typeof value === 'string' ? value.trim() : '';
}

function fromSpacesScreen(req) {
  const referer = req.headers.referer ?? '';
  if (!referer) return false;
  try {
    const path = new URL(referer, 'http://127.0.0.1').pathname;
    return path === '/content/spaces' || path.startsWith('/content/spaces/');
  } catch {
    return false;
  }
}

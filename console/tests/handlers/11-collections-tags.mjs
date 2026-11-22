const actorId = '22222222-2222-4222-8222-222222222222';

/** @type {Array<Record<string, unknown>>} */
let nodes = [];
/** @type {Array<Record<string, unknown>>} */
let spaces = [];
/** @type {{ id: string, title: string, slug: string, tags: string[], spaceId: string | null } | null} */
let page = null;
/** @type {Map<string, { fingerprint: string, status: number, body: Record<string, unknown> }>} */
let records = new Map();

export async function handle(req, res, ctx) {
  const { url } = ctx;
  if (req.method === 'POST' && url.pathname === '/__stub/collections') {
    const body = await ctx.readJson(req);
    if (body.reset) {
      nodes = [];
      spaces = [];
      page = null;
      records = new Map();
    }
    if (typeof body.spaceName === 'string' && body.spaceName.trim()) {
      spaces.push({
        id: crypto.randomUUID(),
        name: body.spaceName.trim(),
        mode: 'authored',
        collectionId: null,
        updatedAt: new Date().toISOString()
      });
    }
    if (typeof body.pageTitle === 'string' && body.pageTitle.trim()) {
      page = {
        id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa11',
        title: body.pageTitle.trim(),
        slug: 'intro',
        tags: [],
        spaceId: null
      };
    }
    ctx.send(res, 200, { ok: true });
    return true;
  }

  const forest = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/collections$/);
  if (forest) {
    const tenantId = decodeURIComponent(forest[1]);
    if (req.method === 'GET') {
      if (!fromCollections(req)) return false;
      ctx.send(res, 200, view());
      return true;
    }
    if (req.method === 'POST') {
      await create(req, res, ctx, tenantId);
      return true;
    }
  }

  const placed = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/collections\/([^/]+)\/spaces\/([^/]+)$/);
  if (placed && req.method === 'PUT') {
    await place(req, res, ctx, decodeURIComponent(placed[2]), decodeURIComponent(placed[3]));
    return true;
  }

  const spaceList = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces$/);
  if (spaceList && req.method === 'GET' && !url.searchParams.has('limit')) {
    if (!fromCollections(req)) return false;
    ctx.send(res, 200, {
      items: spaces.map((space) => summary(spaceList[1], space)),
      nextCursor: null,
      total: spaces.length,
      allowedActions: ['read']
    });
    return true;
  }

  const pages = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/pages$/);
  if (pages && req.method === 'GET') {
    if (!fromTags(req)) return false;
    ctx.send(res, 200, {
      items: page ? [pageSummary(page)] : [],
      nextCursor: null,
      allowedActions: ['read']
    });
    return true;
  }

  const tagged = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/pages\/([^/]+)\/tags\/([^/]+)$/);
  if (tagged && req.method === 'PUT') {
    await tag(req, res, ctx, decodeURIComponent(tagged[2]), decodeURIComponent(tagged[3]), decodeURIComponent(tagged[4]));
    return true;
  }

  const byTag = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/tags\/([^/]+)\/pages$/);
  if (byTag && req.method === 'GET') {
    const label = decodeURIComponent(byTag[2]);
    const items = page && page.tags.includes(label) ? [taggedPage(page)] : [];
    ctx.send(res, 200, { items, nextCursor: null });
    return true;
  }

  return false;
}

async function create(req, res, ctx, tenantId) {
  const key = idempotencyKey(req);
  if (!key) {
    ctx.problem(res, 400, 'invalid_idempotency_key', 'Bad Request', 'Idempotency-Key is required.', 'trace-collection-key');
    return;
  }
  const body = await ctx.readJson(req);
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const parentId = typeof body.parentId === 'string' && body.parentId ? body.parentId : null;
  const fingerprint = JSON.stringify({ tenantId, name, parentId });
  const prior = records.get(`create:${key}`);
  if (prior) {
    if (prior.fingerprint !== fingerprint) {
      ctx.problem(res, 409, 'idempotency_key_reused', 'Conflict', 'This idempotency key was used for a different request.', 'trace-collection-key');
      return;
    }
    ctx.send(res, prior.status, prior.body);
    return;
  }
  if ([...name].length < 1 || [...name].length > 200) {
    ctx.problem(res, 422, 'validation_failed', 'Unprocessable Content', 'Collection name length is invalid.', 'trace-collection-name');
    return;
  }
  const parent = parentId ? nodes.find((node) => node.id === parentId) : null;
  if (parentId && !parent) {
    ctx.problem(res, 404, 'collection_not_found', 'Not Found', 'The collection does not exist.', 'trace-collection');
    return;
  }
  const depth = parent ? Number(parent.depth) + 1 : 1;
  if (depth > 3) {
    ctx.problem(res, 422, 'depth_exceeded', 'Unprocessable Content', 'A collection cannot be deeper than 3.', 'trace-collection-depth');
    return;
  }
  if (nodes.some((node) => node.parentId === parentId && node.name === name)) {
    ctx.problem(res, 409, 'collection_name_taken', 'Conflict', 'That name is already used under this parent.', 'trace-collection-name');
    return;
  }
  const siblings = nodes.filter((node) => node.parentId === parentId);
  nodes.push({
    id: crypto.randomUUID(),
    parentId,
    name,
    position: siblings.length,
    depth,
    icon: null
  });
  const bodyOut = view();
  records.set(`create:${key}`, { fingerprint, status: 201, body: bodyOut });
  ctx.send(res, 201, bodyOut);
}

async function place(req, res, ctx, collectionId, spaceId) {
  const key = idempotencyKey(req);
  if (!key) {
    ctx.problem(res, 400, 'invalid_idempotency_key', 'Bad Request', 'Idempotency-Key is required.', 'trace-collection-key');
    return;
  }
  const body = await ctx.readJson(req);
  const position = typeof body.position === 'number' ? body.position : 0;
  const fingerprint = JSON.stringify({ collectionId, spaceId, position });
  const prior = records.get(`place:${key}`);
  if (prior) {
    if (prior.fingerprint !== fingerprint) {
      ctx.problem(res, 409, 'idempotency_key_reused', 'Conflict', 'This idempotency key was used for a different request.', 'trace-collection-key');
      return;
    }
    ctx.send(res, prior.status, prior.body);
    return;
  }
  const collection = nodes.find((node) => node.id === collectionId);
  const space = spaces.find((item) => item.id === spaceId);
  if (!collection || !space) {
    ctx.problem(res, 404, 'collection_not_found', 'Not Found', 'The collection or space does not exist.', 'trace-collection');
    return;
  }
  space.collectionId = collectionId;
  space.updatedAt = new Date().toISOString();
  const bodyOut = summary('tenant', space);
  bodyOut.collectionPath = pathOf(collectionId);
  records.set(`place:${key}`, { fingerprint, status: 200, body: bodyOut });
  ctx.send(res, 200, bodyOut);
}

async function tag(req, res, ctx, spaceId, pageId, label) {
  const key = idempotencyKey(req);
  if (!key) {
    ctx.problem(res, 400, 'invalid_idempotency_key', 'Bad Request', 'Idempotency-Key is required.', 'trace-tag-key');
    return;
  }
  const fingerprint = JSON.stringify({ spaceId, pageId, label });
  const prior = records.get(`tag:${key}`);
  if (prior) {
    if (prior.fingerprint !== fingerprint) {
      ctx.problem(res, 409, 'idempotency_key_reused', 'Conflict', 'This idempotency key was used for a different request.', 'trace-tag-key');
      return;
    }
    ctx.send(res, prior.status, prior.body);
    return;
  }
  if (!page || page.id !== pageId) {
    ctx.problem(res, 404, 'page_not_found', 'Not Found', 'The page does not exist.', 'trace-tag');
    return;
  }
  if ([...label].length < 1 || [...label].length > 64 || /[/\u0000-\u001f\u007f]/.test(label)) {
    ctx.problem(res, 422, 'validation_failed', 'Unprocessable Content', 'The tag label is invalid.', 'trace-tag-label');
    return;
  }
  if (!page.tags.includes(label)) {
    if (page.tags.length >= 50) {
      ctx.problem(res, 422, 'too_many_tags', 'Unprocessable Content', 'This page already has 50 tags.', 'trace-tag-limit');
      return;
    }
    page.tags.push(label);
  }
  page.spaceId = spaceId;
  const bodyOut = pageSummary(page);
  records.set(`tag:${key}`, { fingerprint, status: 200, body: bodyOut });
  ctx.send(res, 200, bodyOut);
}

function view() {
  return { collections: nest(null), allowedActions: ['create', 'place', 'read'] };
}

/** @param {string | null} parentId */
function nest(parentId) {
  return nodes
    .filter((node) => node.parentId === parentId)
    .sort((left, right) => Number(left.position) - Number(right.position))
    .map((node) => ({
      id: node.id,
      parentId: node.parentId,
      position: node.position,
      name: node.name,
      icon: node.icon,
      depth: node.depth,
      spaceCount: spaces.filter((space) => space.collectionId === node.id).length,
      children: nest(String(node.id))
    }));
}

/** @param {string} collectionId */
function pathOf(collectionId) {
  /** @type {string[]} */
  const names = [];
  let current = nodes.find((node) => node.id === collectionId);
  while (current) {
    names.unshift(String(current.name));
    current = current.parentId ? nodes.find((node) => node.id === current.parentId) : undefined;
  }
  return names;
}

/** @param {string} tenantId @param {Record<string, unknown>} space */
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
    createdAt: space.updatedAt,
    createdBy: actorId,
    updatedAt: space.updatedAt,
    updatedBy: actorId,
    collectionId: space.collectionId,
    allowedActions: ['read']
  };
}

/** @param {{ id: string, title: string, slug: string, tags: string[] }} item */
function pageSummary(item) {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    status: 'draft',
    format: 'markdown',
    icon: null,
    tags: [...item.tags],
    driftFlag: false,
    updatedAt: '2026-11-22T00:00:00Z',
    updatedBy: actorId,
    publishedAt: null,
    allowedActions: ['read']
  };
}

/** @param {{ id: string, title: string, slug: string, tags: string[], spaceId: string | null }} item */
function taggedPage(item) {
  return { ...pageSummary(item), spaceId: item.spaceId };
}

function idempotencyKey(req) {
  const value = req.headers['idempotency-key'];
  return typeof value === 'string' ? value.trim() : '';
}

/** @param {import('node:http').IncomingMessage} req */
function refererPath(req) {
  const referer = req.headers.referer ?? '';
  if (!referer) return '';
  try {
    return new URL(referer, 'http://127.0.0.1').pathname;
  } catch {
    return '';
  }
}

/** @param {import('node:http').IncomingMessage} req */
function fromCollections(req) {
  return refererPath(req) === '/content/collections';
}

/** @param {import('node:http').IncomingMessage} req */
function fromTags(req) {
  return /^\/content\/spaces\/[^/]+\/tags$/.test(refererPath(req));
}

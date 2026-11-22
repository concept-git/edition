const maxDepth = 7;
const kinds = new Set(['target', 'group', 'link']);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** @typedef {{ id: string, label: string, kind: string, targetId: string | null, url: string | null, children: Node[] }} Node */

/** @type {Map<string, Node[]>} */
let trees = new Map();
/** @type {Map<string, { fingerprint: string, status: number, body: Record<string, unknown> }>} */
let records = new Map();

export async function handle(req, res, ctx) {
  const { url } = ctx;
  const move = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/toc\/entries\/([^/]+):move$/);
  if (move && req.method === 'POST') {
    await moveEntry(req, res, ctx, move[2], decodeURIComponent(move[3]));
    return true;
  }
  const collection = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/toc\/entries$/);
  if (!collection) return false;
  const spaceId = collection[2];
  if (req.method === 'GET') {
    ctx.send(res, 200, view(spaceId));
    return true;
  }
  if (req.method === 'POST') {
    await addEntry(req, res, ctx, spaceId);
    return true;
  }
  return false;
}

async function addEntry(req, res, ctx, spaceId) {
  const key = idempotencyKey(req);
  if (!key) {
    ctx.problem(res, 400, 'invalid_idempotency_key', 'Bad Request', 'Idempotency-Key is required.', 'trace-toc-key');
    return;
  }
  const body = await ctx.readJson(req);
  const fingerprint = JSON.stringify({ op: 'add', spaceId, body });
  if (replay(res, ctx, key, fingerprint)) return;
  const label = typeof body.label === 'string' ? body.label.trim() : '';
  const kind = typeof body.kind === 'string' ? body.kind : '';
  const parentId = typeof body.parentId === 'string' ? body.parentId : null;
  if (!kinds.has(kind) || label.length < 1 || label.length > 200) {
    ctx.problem(res, 422, 'validation_failed', 'Unprocessable Content', 'The directory entry is invalid.', 'trace-toc-validation');
    return;
  }
  const targetId = typeof body.targetId === 'string' ? body.targetId : null;
  const url = typeof body.url === 'string' ? body.url : null;
  if (kind === 'target' && !uuid.test(targetId ?? '')) {
    ctx.problem(res, 422, 'validation_failed', 'Unprocessable Content', 'A target entry needs a page.', 'trace-toc-validation');
    return;
  }
  if (kind === 'link' && (!url || url.length > 2048)) {
    ctx.problem(res, 422, 'validation_failed', 'Unprocessable Content', 'A link entry needs an address.', 'trace-toc-validation');
    return;
  }
  const parent = parentId === null ? null : find(roots(spaceId), parentId);
  if (parentId !== null && !parent) {
    ctx.problem(res, 404, 'toc_entry_not_found', 'Not Found', 'The parent entry does not exist.', 'trace-toc-missing');
    return;
  }
  const siblings = parent ? parent.children : roots(spaceId);
  const position = Number.isInteger(body.position) ? body.position : siblings.length;
  if (position < 0 || position > siblings.length) {
    ctx.problem(res, 422, 'position_invalid', 'Position invalid', 'The insert position is outside the sibling list.', 'trace-toc-position');
    return;
  }
  const depth = (parent ? depthOf(roots(spaceId), parent.id) : 0) + 1;
  if (depth > maxDepth) {
    ctx.problem(res, 422, 'depth_exceeded', 'Nesting too deep', 'This move would exceed the maximum depth for this tree.', 'trace-toc-depth');
    return;
  }
  const node = {
    id: crypto.randomUUID(),
    label,
    kind,
    targetId: kind === 'target' ? targetId : null,
    url: kind === 'link' ? url : null,
    children: []
  };
  siblings.splice(position, 0, node);
  const bodyOut = view(spaceId);
  records.set(key, { fingerprint, status: 201, body: bodyOut });
  ctx.send(res, 201, bodyOut);
}

async function moveEntry(req, res, ctx, spaceId, entryId) {
  const key = idempotencyKey(req);
  if (!key) {
    ctx.problem(res, 400, 'invalid_idempotency_key', 'Bad Request', 'Idempotency-Key is required.', 'trace-toc-key');
    return;
  }
  const body = await ctx.readJson(req);
  const fingerprint = JSON.stringify({ op: 'move', spaceId, entryId, body });
  if (replay(res, ctx, key, fingerprint)) return;
  const node = find(roots(spaceId), entryId);
  if (!node) {
    ctx.problem(res, 404, 'toc_entry_not_found', 'Not Found', 'The directory entry does not exist.', 'trace-toc-missing');
    return;
  }
  const parentId = typeof body.parentId === 'string' ? body.parentId : null;
  const parent = parentId === null ? null : find(roots(spaceId), parentId);
  if (parentId !== null && !parent) {
    ctx.problem(res, 404, 'toc_entry_not_found', 'Not Found', 'The parent entry does not exist.', 'trace-toc-missing');
    return;
  }
  if (parentId === entryId || (parent && contains(node, parentId))) {
    ctx.problem(res, 422, 'cycle_detected', 'Cycle detected', 'A node cannot be moved under itself or its descendants.', 'trace-toc-cycle');
    return;
  }
  const parentDepth = parent ? depthOf(roots(spaceId), parent.id) : 0;
  if (parentDepth + height(node) > maxDepth) {
    ctx.problem(res, 422, 'depth_exceeded', 'Nesting too deep', 'This move would exceed the maximum depth for this tree.', 'trace-toc-depth');
    return;
  }
  const currentParent = parentOf(roots(spaceId), entryId);
  const oldSiblings = currentParent ? currentParent.children : roots(spaceId);
  const newSiblings = parent ? parent.children : roots(spaceId);
  const count = newSiblings.length - (oldSiblings === newSiblings ? 1 : 0);
  const position = Number.isInteger(body.position) ? body.position : count;
  if (position < 0 || position > count) {
    ctx.problem(res, 422, 'position_invalid', 'Position invalid', 'The insert position is outside the sibling list.', 'trace-toc-position');
    return;
  }
  const index = oldSiblings.findIndex((entry) => entry.id === entryId);
  oldSiblings.splice(index, 1);
  newSiblings.splice(position, 0, node);
  const bodyOut = view(spaceId);
  records.set(key, { fingerprint, status: 200, body: bodyOut });
  ctx.send(res, 200, bodyOut);
}

function replay(res, ctx, key, fingerprint) {
  const prior = records.get(key);
  if (!prior) return false;
  if (prior.fingerprint !== fingerprint) {
    ctx.problem(res, 409, 'idempotency_key_reused', 'Conflict', 'This idempotency key was used for a different request.', 'trace-toc-key');
    return true;
  }
  ctx.send(res, prior.status, prior.body);
  return true;
}

function view(spaceId) {
  return { entries: project(roots(spaceId), null, 1), allowedActions: ['read', 'edit'] };
}

function project(nodes, parentId, depth) {
  return nodes.map((node, position) => ({
    id: node.id,
    parentId,
    position,
    label: node.label,
    kind: node.kind,
    targetId: node.targetId,
    url: node.url,
    depth,
    children: project(node.children, node.id, depth + 1)
  }));
}

function roots(spaceId) {
  const found = trees.get(spaceId);
  if (found) return found;
  const created = [];
  trees.set(spaceId, created);
  return created;
}

function find(nodes, id) {
  for (const node of nodes) {
    if (node.id === id) return node;
    const nested = find(node.children, id);
    if (nested) return nested;
  }
  return null;
}

function parentOf(nodes, id) {
  for (const node of nodes) {
    if (node.children.some((child) => child.id === id)) return node;
    const nested = parentOf(node.children, id);
    if (nested) return nested;
  }
  return null;
}

function contains(node, id) {
  return node.children.some((child) => child.id === id || contains(child, id));
}

function depthOf(nodes, id, depth = 1) {
  for (const node of nodes) {
    if (node.id === id) return depth;
    const nested = depthOf(node.children, id, depth + 1);
    if (nested) return nested;
  }
  return 0;
}

function height(node) {
  if (node.children.length === 0) return 1;
  return 1 + Math.max(...node.children.map((child) => height(child)));
}

function idempotencyKey(req) {
  const value = req.headers['idempotency-key'];
  return typeof value === 'string' && /^[a-zA-Z0-9._:-]+$/.test(value) ? value : '';
}

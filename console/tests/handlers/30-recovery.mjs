// @ts-nocheck
/**
 * Stand-in for trash restore, archived space deletion, and empty site deletion.
 * A mismatched confirmation name leaves the resource in place. A space delete
 * also requires the space to be archived. A site delete requires zero mounts.
 * Writes require Idempotency-Key.
 */

import { presentSpace, readSpace, removeSpace } from './05-spaces.mjs';
import { putPage, takePage } from './06-page-source.mjs';
import { removeSite, siteRecord } from './17-sites.mjs';

/** @type {Map<string, Array<Record<string, unknown>>>} */
const trash = new Map();
/** @type {Map<string, { fingerprint: string, status: number, body: Record<string, unknown>, problem: boolean, code?: string, title?: string, detail?: string, traceId?: string }>} */
const replays = new Map();

export async function handle(req, res, ctx) {
  const path = ctx.url.pathname;

  const restored = path.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/pages\/([^/]+):restore$/);
  if (restored && req.method === 'POST') {
    await restorePage(req, res, ctx, decodeURIComponent(restored[2]), decodeURIComponent(restored[3]));
    return true;
  }

  const trashed = path.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/pages\/([^/]+):trash$/);
  if (trashed && req.method === 'POST') {
    await trashPage(req, res, ctx, decodeURIComponent(trashed[2]), decodeURIComponent(trashed[3]));
    return true;
  }

  const listed = path.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/trash$/);
  if (listed && req.method === 'GET') {
    listTrash(res, ctx, decodeURIComponent(listed[2]));
    return true;
  }

  const archived = path.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+):archive$/);
  if (archived && req.method === 'POST') {
    await archiveSpace(req, res, ctx, decodeURIComponent(archived[1]), decodeURIComponent(archived[2]));
    return true;
  }

  const space = path.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)$/);
  if (space && req.method === 'DELETE') {
    await deleteSpace(req, res, ctx, decodeURIComponent(space[1]), decodeURIComponent(space[2]));
    return true;
  }

  const site = path.match(/^\/api\/v1\/tenants\/([^/]+)\/sites\/([^/]+)$/);
  if (site && req.method === 'DELETE') {
    await deleteSite(req, res, ctx, decodeURIComponent(site[1]), decodeURIComponent(site[2]));
    return true;
  }

  return false;
}

async function trashPage(req, res, ctx, spaceId, pageId) {
  await write(req, res, ctx, `trash\n${spaceId}\n${pageId}`, () => {
    const existing = trashOf(spaceId).find((item) => item.id === pageId);
    if (existing) return { status: 200, body: pageBody(existing) };
    const page = takePage(spaceId, pageId);
    if (!page) return problemOutcome(404, 'page_not_found', 'Not Found', 'The page does not exist.', 'trace-recovery-page');
    const stored = { ...page, trashedAt: new Date().toISOString() };
    trashOf(spaceId).unshift(stored);
    return { status: 200, body: pageBody(stored) };
  });
}

async function restorePage(req, res, ctx, spaceId, pageId) {
  await write(req, res, ctx, `restore\n${spaceId}\n${pageId}`, () => {
    const list = trashOf(spaceId);
    const index = list.findIndex((item) => item.id === pageId);
    if (index < 0) return problemOutcome(404, 'page_not_found', 'Not Found', 'The page is not in trash.', 'trace-recovery-page');
    const [page] = list.splice(index, 1);
    const restored = { ...page, trashedAt: null };
    putPage(spaceId, restored);
    return { status: 200, body: pageBody(restored) };
  });
}

function listTrash(res, ctx, spaceId) {
  const items = trashOf(spaceId).map((page) => ({
    id: page.id,
    title: page.title,
    slug: page.slug,
    status: 'draft',
    format: page.format,
    trashedAt: page.trashedAt,
    allowedActions: ['read', 'edit']
  }));
  ctx.send(res, 200, { items, nextCursor: null, total: null, allowedActions: ['read'] });
}

async function archiveSpace(req, res, ctx, tenantId, spaceId) {
  await write(req, res, ctx, `archive\n${tenantId}\n${spaceId}`, () => {
    const space = readSpace(tenantId, spaceId);
    if (!space) return problemOutcome(404, 'space_not_found', 'Not Found', 'The space does not exist.', 'trace-recovery-space');
    space.status = 'archived';
    space.updatedAt = new Date().toISOString();
    return { status: 200, body: presentSpace(tenantId, space) };
  });
}

async function deleteSpace(req, res, ctx, tenantId, spaceId) {
  const body = await readBody(req, ctx, res);
  if (!body) return;
  const name = typeof body.confirmationName === 'string' ? body.confirmationName.trim() : '';
  await write(req, res, ctx, `delete-space\n${tenantId}\n${spaceId}\n${name}`, () => {
    const space = readSpace(tenantId, spaceId);
    if (!space) return problemOutcome(404, 'space_not_found', 'Not Found', 'The space does not exist.', 'trace-recovery-space');
    if (name !== space.name) {
      return problemOutcome(409, 'deletion_confirmation_invalid', 'Conflict', 'The confirmation name does not match.', 'trace-recovery-name');
    }
    if (space.status !== 'archived') {
      return problemOutcome(409, 'space_not_archived', 'Conflict', 'The space is not archived.', 'trace-recovery-archive');
    }
    removeSpace(tenantId, spaceId);
    return { status: 200, body: deletion('space', spaceId) };
  });
}

async function deleteSite(req, res, ctx, tenantId, siteId) {
  const body = await readBody(req, ctx, res);
  if (!body) return;
  const name = typeof body.confirmationName === 'string' ? body.confirmationName.trim() : '';
  await write(req, res, ctx, `delete-site\n${tenantId}\n${siteId}\n${name}`, () => {
    const site = siteRecord(tenantId, siteId);
    if (!site) return problemOutcome(404, 'site_not_found', 'Not Found', 'The site does not exist.', 'trace-recovery-site');
    if (name !== site.name) {
      return problemOutcome(409, 'deletion_confirmation_invalid', 'Conflict', 'The confirmation name does not match.', 'trace-recovery-name');
    }
    if (site.mounts.length > 0) {
      return problemOutcome(409, 'site_not_empty', 'Conflict', 'The site still has mounts.', 'trace-recovery-mount');
    }
    removeSite(tenantId, siteId);
    return { status: 200, body: deletion('site', siteId) };
  });
}

function trashOf(spaceId) {
  const found = trash.get(spaceId);
  if (found) return found;
  const created = [];
  trash.set(spaceId, created);
  return created;
}

function pageBody(page) {
  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    format: page.format,
    status: 'draft',
    trashedAt: page.trashedAt ?? null,
    revision: page.revision ?? 0
  };
}

function deletion(resourceType, resourceId) {
  return {
    id: crypto.randomUUID(),
    resourceType,
    resourceId,
    status: 'succeeded',
    createdAt: new Date().toISOString()
  };
}

async function readBody(req, ctx, res) {
  try {
    return await ctx.readJson(req);
  } catch {
    ctx.problem(res, 400, 'malformed_json', 'Bad Request', 'The request body is not JSON.', 'trace-recovery-json');
    return null;
  }
}

async function write(req, res, ctx, fingerprint, produce) {
  const key = req.headers['idempotency-key'];
  if (typeof key !== 'string' || key.trim().length === 0) {
    ctx.problem(res, 400, 'invalid_idempotency_key', 'Bad Request', 'Idempotency-Key is required.', 'trace-recovery-key');
    return;
  }
  const prior = replays.get(key);
  if (prior) {
    if (prior.fingerprint !== fingerprint) {
      ctx.problem(res, 409, 'idempotency_key_reused', 'Conflict', 'This idempotency key was used for a different request.', 'trace-recovery-key');
      return;
    }
    deliver(res, ctx, prior);
    return;
  }
  const outcome = produce();
  const stored = { fingerprint, ...outcome };
  replays.set(key, stored);
  deliver(res, ctx, stored);
}

function deliver(res, ctx, outcome) {
  if (outcome.problem) {
    ctx.problem(res, outcome.status, outcome.code, outcome.title, outcome.detail, outcome.traceId);
    return;
  }
  ctx.send(res, outcome.status, outcome.body);
}

function problemOutcome(status, code, title, detail, traceId) {
  return { problem: true, status, code, title, detail, traceId };
}

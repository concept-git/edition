// @ts-nocheck
/**
 * Stand-in for site redirects.
 * Changing a mount slug or a page address records the old address against a
 * stable space or page id. Only a manual rule can be deleted.
 */

import { applyRemount, mountsOfSpace, siteMounts } from './17-sites.mjs';

const handbook = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const pages = [{ id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', spaceId: handbook, title: '入门', slug: 'start' }];
const rules = [];
const seeded = new Set();
const replays = new Map();

export async function handle(req, res, ctx) {
  const path = ctx.url.pathname;
  const remounted = path.match(/^\/api\/v1\/tenants\/([^/]+)\/sites\/([^/]+)\/mounts\/([^/]+):remount$/);
  if (remounted) {
    return changeSlug(req, res, ctx, decodeURIComponent(remounted[1]), decodeURIComponent(remounted[2]), decodeURIComponent(remounted[3]));
  }

  const redirects = path.match(/^\/api\/v1\/tenants\/([^/]+)\/sites\/([^/]+)\/redirects$/);
  if (redirects) {
    return redirectRules(req, res, ctx, decodeURIComponent(redirects[1]), decodeURIComponent(redirects[2]));
  }

  const reslugged = path.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/pages\/([^/]+):reslug$/);
  if (reslugged) {
    return changeAddress(req, res, ctx, decodeURIComponent(reslugged[2]), decodeURIComponent(reslugged[3]));
  }

  const listed = path.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces\/([^/]+)\/pages$/);
  if (listed && req.method === 'GET' && !ctx.url.searchParams.has('status') && !ctx.url.searchParams.has('limit')) {
    return pageList(res, ctx, decodeURIComponent(listed[2]));
  }

  return false;
}

async function changeSlug(req, res, ctx, tenant, siteId, oldSlug) {
  if (req.method !== 'POST') return false;
  const body = await readBody(req, ctx, res);
  if (!body) return true;
  await write(req, res, ctx, fingerprint(req, body), () => {
    const changed = applyRemount(tenant, siteId, oldSlug, body.newSlug);
    if (changed.problem) return changed;
    if (changed.from !== changed.to) {
      register(siteId, `/${changed.from}/*`, 'space', changed.spaceId, 'auto');
    }
    return { status: changed.status, body: changed.body };
  });
  return true;
}

async function changeAddress(req, res, ctx, spaceId, pageId) {
  if (req.method !== 'POST') return false;
  const body = await readBody(req, ctx, res);
  if (!body) return true;
  await write(req, res, ctx, fingerprint(req, body), () => {
    const page = pages.find((item) => item.id === pageId && item.spaceId === spaceId);
    if (!page) return problemOutcome(404, 'page_not_found', 'Not found', 'Page was not found.', 'trace-page');
    const slug = typeof body.slug === 'string' ? body.slug.normalize('NFKC').trim().toLowerCase() : '';
    if (slug.length < 1 || slug.length > 80 || !/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(slug)) {
      return problemOutcome(422, 'slug_invalid', 'Request rejected', 'Page address is invalid.', 'trace-slug');
    }
    const previous = page.slug;
    page.slug = slug;
    if (previous !== slug) {
      for (const mount of mountsOfSpace(spaceId)) {
        register(mount.siteId, `/${mount.slug}/${previous}/*`, 'page', page.id, 'auto');
      }
    }
    return { status: 200, body: { id: page.id, title: page.title, slug: page.slug } };
  });
  return true;
}

function redirectRules(req, res, ctx, tenant, siteId) {
  if (siteMounts(tenant, siteId) === null) {
    if (req.method === 'GET' || req.method === 'DELETE') {
      ctx.problem(res, 404, 'site_not_found', 'Not found', 'Site was not found.', 'trace-site');
      return true;
    }
    return false;
  }
  if (req.method === 'GET') {
    ensureManual(tenant, siteId);
    const origin = ctx.url.searchParams.get('origin');
    const items = rules
      .filter((rule) => rule.siteId === siteId && (origin === null || rule.origin === origin))
      .map((rule) => view(tenant, siteId, rule));
    ctx.send(res, 200, { items, nextCursor: null });
    return true;
  }
  if (req.method === 'DELETE') return remove(req, res, ctx, siteId);
  return false;
}

function remove(req, res, ctx, siteId) {
  const path = ctx.url.searchParams.get('path');
  if (!path) {
    ctx.problem(res, 400, 'validation_failed', 'Request rejected', 'Path is required.', 'trace-redirect');
    return true;
  }
  return write(req, res, ctx, fingerprint(req, { path }), () => {
    const index = rules.findIndex((rule) => rule.siteId === siteId && rule.path === path);
    if (index === -1) return { status: 204 };
    if (rules[index].origin !== 'manual') {
      return problemOutcome(409, 'redirect_not_manual', 'Conflict', 'Only a manual redirect can be deleted.', 'trace-redirect');
    }
    rules.splice(index, 1);
    return { status: 204 };
  }).then(() => true);
}

function pageList(res, ctx, spaceId) {
  const items = pages
    .filter((page) => page.spaceId === spaceId)
    .map((page) => ({ id: page.id, title: page.title, slug: page.slug, status: 'published', format: 'markdown', allowedActions: ['read', 'reslug'] }));
  ctx.send(res, 200, { items, nextCursor: null, total: items.length, allowedActions: ['read'] });
  return true;
}

function ensureManual(tenant, siteId) {
  const key = `${tenant}:${siteId}`;
  if (seeded.has(key)) return;
  const mounts = siteMounts(tenant, siteId) ?? [];
  if (mounts.length === 0) return;
  seeded.add(key);
  register(siteId, '/legacy', 'space', mounts[0].spaceId, 'manual');
}

function register(siteId, path, targetType, targetId, origin) {
  const existing = rules.find((rule) => rule.siteId === siteId && rule.path === path);
  const createdAt = new Date().toISOString();
  if (existing) {
    existing.targetType = targetType;
    existing.targetId = targetId;
    existing.origin = origin;
    existing.createdAt = createdAt;
    return;
  }
  rules.push({ siteId, path, targetType, targetId, origin, createdAt });
}

function view(tenant, siteId, rule) {
  const mounts = siteMounts(tenant, siteId) ?? [];
  const page = rule.targetType === 'page' ? pages.find((item) => item.id === rule.targetId) : null;
  const mount =
    rule.targetType === 'space'
      ? mounts.find((item) => item.spaceId === rule.targetId)
      : page
        ? mounts.find((item) => item.spaceId === page.spaceId)
        : null;
  const currentPath = !mount ? null : page ? `/${mount.slug}/${page.slug}` : `/${mount.slug}`;
  return {
    path: rule.path,
    targetId: rule.targetId,
    targetType: rule.targetType,
    origin: rule.origin,
    createdAt: rule.createdAt,
    hitCount: 0,
    currentPath,
    targetLabel: page ? page.title : (mount?.spaceName ?? null),
    reachable: mount !== null && mount !== undefined && (rule.targetType === 'space' || page !== null)
  };
}

async function readBody(req, ctx, res) {
  try {
    return await ctx.readJson(req);
  } catch {
    ctx.problem(res, 400, 'malformed_json', 'Request rejected', 'The request body is not JSON.', 'trace-json');
    return null;
  }
}

async function write(req, res, ctx, print, produce) {
  const key = req.headers['idempotency-key'];
  if (typeof key !== 'string' || key.length === 0) {
    ctx.problem(res, 400, 'invalid_idempotency_key', 'Request rejected', 'Idempotency-Key is required.', 'trace-idempotency');
    return;
  }
  const prior = replays.get(key);
  if (prior) {
    if (prior.fingerprint !== print) {
      ctx.problem(res, 409, 'idempotency_key_reused', 'Request rejected', 'This key was used for a different request.', 'trace-idempotency');
      return;
    }
    deliver(res, ctx, prior);
    return;
  }
  const outcome = produce();
  const stored = { fingerprint: print, ...outcome };
  replays.set(key, stored);
  deliver(res, ctx, stored);
}

function deliver(res, ctx, outcome) {
  if (outcome.status === 204) {
    res.writeHead(204);
    res.end();
    return;
  }
  if (outcome.problem) {
    ctx.problem(res, outcome.status, outcome.code, outcome.title, outcome.detail, outcome.traceId);
    return;
  }
  ctx.send(res, outcome.status, outcome.body);
}

function problemOutcome(status, code, title, detail, traceId) {
  return { problem: true, status, code, title, detail, traceId };
}

function fingerprint(req, body) {
  return `${req.method} ${req.url} ${JSON.stringify(body)}`;
}

// @ts-nocheck
/**
 * Stand-in for Control site, mount, and search-configuration endpoints.
 * Same-space mounts are allowed on different sites. A slug already used on
 * that site is slug_taken. Writes require Idempotency-Key.
 */

const tenantId = '11111111-1111-4111-8111-111111111111';
const spaces = [
  { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', name: '手册' },
  { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', name: '指南' }
];
const sitesByTenant = new Map();
const searchBySite = new Map();
const replays = new Map();
const actions = ['create', 'read', 'update', 'mount', 'unmount', 'remount', 'reorder', 'delete', 'manage_permissions'];
const slugShape = /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u;

export async function handle(req, res, ctx) {
  const path = ctx.url.pathname;
  if (path !== '/api/v1/me' && !path.startsWith('/api/v1/tenants/')) return false;
  if (req.method === 'GET' && path === '/api/v1/me') {
    ctx.send(res, 200, profile());
    return true;
  }

  const listed = path.match(/^\/api\/v1\/tenants\/([^/]+)\/sites$/);
  if (listed) return sites(req, res, ctx, decodeURIComponent(listed[1]));

  const search = path.match(/^\/api\/v1\/tenants\/([^/]+)\/sites\/([^/]+)\/search$/);
  if (search) return searchConfig(req, res, ctx, decodeURIComponent(search[1]), decodeURIComponent(search[2]));

  const mounted = path.match(/^\/api\/v1\/tenants\/([^/]+)\/sites\/([^/]+)\/mounts\/([^/]+)$/);
  if (mounted) {
    return mount(req, res, ctx, decodeURIComponent(mounted[1]), decodeURIComponent(mounted[2]), decodeURIComponent(mounted[3]));
  }

  const one = path.match(/^\/api\/v1\/tenants\/([^/]+)\/sites\/([^/]+)$/);
  if (one) return site(req, res, ctx, decodeURIComponent(one[1]), decodeURIComponent(one[2]));

  const spaceList = path.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces$/);
  if (spaceList && req.method === 'GET' && !ctx.url.searchParams.has('limit')) {
    ctx.send(res, 200, {
      items: spaces.map((space) => ({ id: space.id, name: space.name })),
      nextCursor: null,
      total: spaces.length,
      allowedActions: ['create', 'read']
    });
    return true;
  }

  return false;
}

function sites(req, res, ctx, tenant) {
  if (req.method === 'GET') {
    // Count queries belong to the overview stub. This list is the one the admin edits.
    if (ctx.url.searchParams.has('limit')) return false;
    const items = [...bucket(tenant).values()];
    ctx.send(res, 200, { items: items.map(summary), nextCursor: null, total: items.length, allowedActions: actions });
    return true;
  }
  if (req.method === 'POST') return create(req, res, ctx, tenant);
  return false;
}

async function create(req, res, ctx, tenant) {
  const body = await readBody(req, ctx, res);
  if (!body) return true;
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  await write(req, res, ctx, fingerprint(req, body), () => {
    if (name.length < 1 || name.length > 120) {
      return problemOutcome(422, 'site_name_invalid', 'Request rejected', 'Site name is invalid.', 'trace-site-name');
    }
    const now = new Date().toISOString();
    const site = {
      id: typeof body.id === 'string' && /^[0-9a-f-]{36}$/i.test(body.id) ? body.id : crypto.randomUUID(),
      tenantId: tenant,
      name,
      mounts: [],
      createdAt: now,
      updatedAt: now
    };
    bucket(tenant).set(site.id, site);
    return { status: 201, body: detail(site) };
  });
  return true;
}

function site(req, res, ctx, tenant, siteId) {
  if (req.method !== 'GET') return false;
  const found = bucket(tenant).get(siteId);
  if (!found) {
    ctx.problem(res, 404, 'site_not_found', 'Not found', 'Site was not found.', 'trace-site');
    return true;
  }
  ctx.send(res, 200, detail(found));
  return true;
}

async function mount(req, res, ctx, tenant, siteId, slug) {
  if (req.method !== 'PUT') return false;
  const body = await readBody(req, ctx, res);
  if (!body) return true;
  const spaceId = typeof body.spaceId === 'string' ? body.spaceId : '';
  await write(req, res, ctx, fingerprint(req, body), () => {
    const found = bucket(tenant).get(siteId);
    if (!found) return problemOutcome(404, 'site_not_found', 'Not found', 'Site was not found.', 'trace-site');
    const normalized = slug.normalize('NFKC').trim().toLowerCase();
    if (normalized.length < 1 || normalized.length > 80 || !slugShape.test(normalized)) {
      return problemOutcome(422, 'slug_invalid', 'Request rejected', 'Slug is invalid.', 'trace-slug');
    }
    if (!spaces.some((space) => space.id === spaceId)) {
      return problemOutcome(404, 'space_not_found', 'Not found', 'Space was not found.', 'trace-space');
    }
    if (found.mounts.some((item) => item.spaceId === spaceId && item.slug !== normalized)) {
      return problemOutcome(409, 'space_already_mounted', 'Conflict', 'Space is already mounted on this site.', 'trace-mount');
    }
    if (found.mounts.some((item) => conflicts(item.slug, normalized) && item.spaceId !== spaceId)) {
      return problemOutcome(409, 'slug_taken', 'Conflict', 'Mount path conflicts with an existing slug.', 'trace-mount');
    }
    if (!found.mounts.some((item) => item.spaceId === spaceId && item.slug === normalized)) {
      found.mounts.push({ spaceId, slug: normalized });
      found.updatedAt = new Date().toISOString();
    }
    return { status: 200, body: detail(found) };
  });
  return true;
}

async function searchConfig(req, res, ctx, tenant, siteId) {
  if (!bucket(tenant).has(siteId)) {
    if (req.method !== 'GET' && req.method !== 'PUT') return false;
    ctx.problem(res, 404, 'site_not_found', 'Not found', 'Site was not found.', 'trace-site');
    return true;
  }
  if (req.method === 'GET') {
    ctx.send(res, 200, currentSearch(siteId));
    return true;
  }
  if (req.method !== 'PUT') return false;
  const body = await readBody(req, ctx, res);
  if (!body) return true;
  await write(req, res, ctx, fingerprint(req, body), () => {
    const fields = Array.isArray(body.fields) ? body.fields : null;
    const allowed = new Set(['title', 'headings', 'body']);
    if (!fields || fields.length !== 3 || fields.some((field) => !allowed.has(field)) || new Set(fields).size !== 3) {
      return problemOutcome(422, 'validation_failed', 'Request rejected', 'Search fields must be an order of title, headings, and body.', 'trace-search');
    }
    const prior = searchBySite.get(siteId);
    const revision = (prior?.revision ?? 0) + 1;
    const stored = { fields: [...fields], revision };
    searchBySite.set(siteId, stored);
    return { status: 202, body: stored };
  });
  return true;
}

function currentSearch(siteId) {
  return searchBySite.get(siteId) ?? { fields: ['title', 'headings', 'body'], revision: 0 };
}

function conflicts(left, right) {
  return left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`);
}

function bucket(tenant) {
  let found = sitesByTenant.get(tenant);
  if (!found) {
    found = new Map();
    sitesByTenant.set(tenant, found);
  }
  return found;
}

function summary(site) {
  return {
    id: site.id,
    tenantId: site.tenantId,
    name: site.name,
    rule: '/{slug}/{itemPath}',
    home: null,
    robotsPolicy: 'index',
    domains: [],
    createdAt: site.createdAt,
    createdBy: null,
    updatedAt: site.updatedAt,
    updatedBy: null,
    allowedActions: actions
  };
}

function detail(site) {
  return {
    ...summary(site),
    titleTemplate: null,
    branding: { logo: null, favicon: null, primaryColor: null },
    locale: null,
    analyticsId: null,
    mounts: site.mounts.map((mount) => ({ spaceId: mount.spaceId, slug: mount.slug }))
  };
}

function profile() {
  return {
    id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    email: 'maintainer@edition.test',
    name: '维护者',
    avatar: '',
    locale: 'zh-CN',
    verified: true,
    status: 'active',
    platformOperator: false,
    tenants: [{ id: tenantId, name: '当前租户', role: 'owner', status: 'active' }]
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

export function siteRecord(tenant, siteId) {
  return bucket(tenant).get(siteId) ?? null;
}

export function removeSite(tenant, siteId) {
  return bucket(tenant).delete(siteId);
}

export function siteMounts(tenant, siteId) {
  const found = bucket(tenant).get(siteId);
  if (!found) return null;
  return found.mounts.map((mount) => ({
    spaceId: mount.spaceId,
    slug: mount.slug,
    spaceName: nameOf(mount.spaceId)
  }));
}

export function mountsOfSpace(spaceId) {
  const found = [];
  for (const sites of sitesByTenant.values()) {
    for (const site of sites.values()) {
      for (const mount of site.mounts) {
        if (mount.spaceId === spaceId) found.push({ siteId: site.id, slug: mount.slug, spaceId, spaceName: nameOf(spaceId) });
      }
    }
  }
  return found;
}

export function applyRemount(tenant, siteId, oldSlug, newSlug) {
  const found = bucket(tenant).get(siteId);
  if (!found) return problemOutcome(404, 'site_not_found', 'Not found', 'Site was not found.', 'trace-site');
  const normalized = String(newSlug ?? '').normalize('NFKC').trim().toLowerCase();
  if (normalized.length < 1 || normalized.length > 80 || !slugShape.test(normalized)) {
    return problemOutcome(422, 'slug_invalid', 'Request rejected', 'Slug is invalid.', 'trace-slug');
  }
  const current = found.mounts.find((item) => item.slug === oldSlug);
  if (!current) return problemOutcome(404, 'mount_not_found', 'Not found', 'Mount was not found.', 'trace-mount');
  if (found.mounts.some((item) => item !== current && conflicts(item.slug, normalized))) {
    return problemOutcome(409, 'slug_taken', 'Conflict', 'Mount path conflicts with an existing slug.', 'trace-mount');
  }
  const from = current.slug;
  current.slug = normalized;
  found.updatedAt = new Date().toISOString();
  return { from, to: normalized, spaceId: current.spaceId, spaceName: nameOf(current.spaceId), status: 200, body: detail(found) };
}

function nameOf(spaceId) {
  return spaces.find((space) => space.id === spaceId)?.name ?? spaceId;
}

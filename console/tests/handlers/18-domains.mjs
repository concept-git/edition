// @ts-nocheck
import { randomBytes } from 'node:crypto';

/**
 * Stand-in for Control custom-domain endpoints.
 * Sites already exist. A newly bound domain is unverified and carries the TXT
 * record. Verify marks it verified and, when the site has no primary, makes
 * this one primary. setPrimary rejects an unverified domain.
 * Writes require Idempotency-Key. The stub accepts the TXT challenge without DNS.
 */

const domains = new Map();
const replays = new Map();
const label = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export async function handle(req, res, ctx) {
  const path = ctx.url.pathname;
  if (req.method === 'POST' && path === '/__stub/domains/reset') {
    domains.clear();
    replays.clear();
    res.writeHead(204);
    res.end();
    return true;
  }
  if (!path.startsWith('/api/v1/tenants/')) return false;

  const listed = path.match(/^\/api\/v1\/tenants\/([^/]+)\/domains$/);
  if (listed) return list(req, res, ctx, decode(listed[1]));

  const action = path.match(/^\/api\/v1\/tenants\/([^/]+)\/sites\/([^/]+)\/domains\/(.+):(verify|setPrimary)$/);
  if (action) {
    return change(req, res, ctx, decode(action[1]), decode(action[2]), decode(action[3]), action[4]);
  }

  const one = path.match(/^\/api\/v1\/tenants\/([^/]+)\/sites\/([^/]+)\/domains\/([^/]+)$/);
  if (one) return view(req, res, ctx, decode(one[1]), decode(one[2]), decode(one[3]));

  const collection = path.match(/^\/api\/v1\/tenants\/([^/]+)\/sites\/([^/]+)\/domains$/);
  if (collection && req.method === 'POST') return bind(req, res, ctx, decode(collection[1]), decode(collection[2]));

  return false;
}

function list(req, res, ctx, tenant) {
  if (req.method !== 'GET') return false;
  const siteId = ctx.url.searchParams.get('siteId');
  const rows = [...domains.values()]
    .filter((row) => row.tenantId === tenant && (siteId === null || row.siteId === siteId))
    .sort((left, right) => left.host.localeCompare(right.host));
  const ids = new Set(rows.map((row) => row.siteId));
  if (siteId) ids.add(siteId);
  ctx.send(res, 200, {
    items: rows.map(summary),
    nextCursor: null,
    total: rows.length,
    sites: [...ids].sort().map((id) => ({ id, name: '站点', allowedActions: ['bind'] }))
  });
  return true;
}

function view(req, res, ctx, tenant, siteId, host) {
  if (req.method !== 'GET') return false;
  const row = find(tenant, siteId, host);
  if (!row) {
    ctx.problem(res, 404, 'domain_not_found', 'Not found', 'Domain was not found.', 'trace-domain');
    return true;
  }
  ctx.send(res, 200, detail(row));
  return true;
}

async function bind(req, res, ctx, tenant, siteId) {
  const body = await readBody(req, ctx, res);
  if (!body) return true;
  await write(req, res, ctx, fingerprint(req, body), () => {
    const host = normalizeHost(body.host);
    if (!host) return problemOutcome(422, 'validation_failed', 'Request rejected', 'Host is invalid.', 'trace-domain');
    const existing = domains.get(host);
    if (existing && (existing.tenantId !== tenant || existing.siteId !== siteId)) {
      return problemOutcome(409, 'domain_taken', 'Conflict', 'This host is already bound.', 'trace-domain');
    }
    if (existing) return { status: 201, body: detail(existing) };
    const row = {
      host,
      tenantId: tenant,
      siteId,
      verified: false,
      isPrimary: false,
      dnsToken: randomBytes(32).toString('hex'),
      createdAt: new Date().toISOString()
    };
    domains.set(host, row);
    return { status: 201, body: detail(row) };
  });
  return true;
}

async function change(req, res, ctx, tenant, siteId, host, action) {
  if (req.method !== 'POST') return false;
  const normalized = normalizeHost(host);
  await write(req, res, ctx, fingerprint(req, { action }), () => {
    if (!normalized) return problemOutcome(422, 'validation_failed', 'Request rejected', 'Host is invalid.', 'trace-domain');
    const row = find(tenant, siteId, normalized);
    if (!row) return problemOutcome(404, 'domain_not_found', 'Not found', 'Domain was not found.', 'trace-domain');
    if (action === 'verify') {
      row.verified = true;
      if (!hasPrimary(tenant, siteId)) row.isPrimary = true;
      return { status: 200, body: detail(row) };
    }
    if (!row.verified) {
      return problemOutcome(409, 'domain_not_verified', 'Conflict', 'An unverified domain cannot be primary.', 'trace-domain');
    }
    for (const item of domains.values()) {
      if (item.tenantId === tenant && item.siteId === siteId) item.isPrimary = item.host === row.host;
    }
    return { status: 200, body: detail(row) };
  });
  return true;
}

function find(tenant, siteId, host) {
  const normalized = normalizeHost(host);
  if (!normalized) return null;
  const row = domains.get(normalized);
  if (!row || row.tenantId !== tenant || row.siteId !== siteId) return null;
  return row;
}

function hasPrimary(tenant, siteId) {
  for (const row of domains.values()) {
    if (row.tenantId === tenant && row.siteId === siteId && row.isPrimary) return true;
  }
  return false;
}

function summary(row) {
  return {
    host: row.host,
    verified: row.verified,
    isPrimary: row.isPrimary,
    createdAt: row.createdAt,
    siteId: row.siteId,
    siteName: '站点',
    allowedActions: ['update']
  };
}

function detail(row) {
  return {
    host: row.host,
    verified: row.verified,
    isPrimary: row.isPrimary,
    dnsToken: row.dnsToken,
    txtName: `_space-challenge.${row.host}`,
    txtValue: row.dnsToken
  };
}

function normalizeHost(raw) {
  if (typeof raw !== 'string') return null;
  const host = raw.trim().toLowerCase();
  if (host.length < 1 || host.length > 253 || !host.includes('.')) return null;
  if (host.endsWith('.') || host.includes('..') || /[:/*_\s]/.test(host)) return null;
  const labels = host.split('.');
  if (labels.length < 2 || labels.some((item) => !label.test(item))) return null;
  return host;
}

function decode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
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

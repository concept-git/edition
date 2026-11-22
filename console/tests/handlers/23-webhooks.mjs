// @ts-nocheck
import { randomBytes, randomUUID } from 'node:crypto';

/**
 * Stand-in for webhook subscriptions and deliveries.
 * The signing secret is returned only from create and rotate.
 * List and update responses omit it. Writes require Idempotency-Key.
 */

const eventTypes = [
  'release.promoted',
  'release.flagged',
  'release.held',
  'page.published',
  'domain.verified',
  'delivery.completed',
  'delivery.failed'
];

let subscriptions = [];
let deliveries = new Map();
let replays = new Map();

export async function handle(req, res, ctx) {
  const { url } = ctx;
  if (req.method === 'POST' && url.pathname === '/__stub/webhooks/reset') {
    subscriptions = [];
    deliveries = new Map();
    replays = new Map();
    res.writeHead(204);
    res.end();
    return true;
  }

  if (url.pathname !== '/webhooks' && !url.pathname.startsWith('/webhooks/')) return false;
  if (!authorized(req)) return unauthorized(res, ctx);

  const deliveryList = url.pathname.match(/^\/webhooks\/([^/]+)\/deliveries$/);
  if (req.method === 'GET' && deliveryList) return listDeliveries(res, ctx, url, decodeURIComponent(deliveryList[1]));

  const rotate = url.pathname.match(/^\/webhooks\/([^/]+):rotate$/);
  if (req.method === 'POST' && rotate) return rotateSecret(req, res, ctx, url, decodeURIComponent(rotate[1]));

  const one = url.pathname.match(/^\/webhooks\/([^/]+)$/);
  if (req.method === 'PUT' && one) return update(req, res, ctx, url, decodeURIComponent(one[1]));

  if (url.pathname === '/webhooks' && req.method === 'GET') return list(res, ctx, url);
  if (url.pathname === '/webhooks' && req.method === 'POST') return create(req, res, ctx, url);
  return false;
}

function list(res, ctx, url) {
  const tenantId = tenant(url);
  if (!tenantId) return invalidTenant(res, ctx);
  const items = subscriptions.filter((item) => item.tenantId === tenantId).map(view);
  ctx.send(res, 200, { items, nextCursor: null, eventTypes: [...eventTypes] });
  return true;
}

async function create(req, res, ctx, url) {
  const tenantId = tenant(url);
  if (!tenantId) return invalidTenant(res, ctx);
  const key = idempotencyKey(req);
  if (!key) return invalidKey(res, ctx);
  const body = await readBody(req, res, ctx);
  if (!body) return true;
  const fingerprint = `${req.method} ${req.url} ${JSON.stringify(body)}`;
  const prior = replays.get(key);
  if (prior) return replay(res, ctx, prior, fingerprint);
  const configuration = readConfiguration(body, true);
  if (!configuration) {
    ctx.problem(res, 422, 'validation_failed', 'Request rejected', 'The webhook configuration is invalid.', 'trace-webhook');
    return true;
  }
  const id = randomUUID();
  const subscription = {
    id,
    tenantId,
    url: configuration.url,
    scopeType: configuration.scopeType,
    scopeId: configuration.scopeId,
    events: configuration.events,
    active: configuration.active,
    createdAt: new Date().toISOString()
  };
  subscriptions.push(subscription);
  deliveries.set(id, sampleDeliveries());
  const response = { subscription: view(subscription), secret: signingSecret() };
  replays.set(key, { fingerprint, status: 201, body: response });
  ctx.send(res, 201, response);
  return true;
}

async function update(req, res, ctx, url, id) {
  const tenantId = tenant(url);
  if (!tenantId) return invalidTenant(res, ctx);
  const key = idempotencyKey(req);
  if (!key) return invalidKey(res, ctx);
  const body = await readBody(req, res, ctx);
  if (!body) return true;
  const fingerprint = `${req.method} ${req.url} ${JSON.stringify(body)}`;
  const prior = replays.get(key);
  if (prior) return replay(res, ctx, prior, fingerprint);
  const found = subscriptions.find((item) => item.id === id && item.tenantId === tenantId);
  if (!found) return missing(res, ctx);
  const configuration = readConfiguration(body, false);
  if (!configuration) {
    ctx.problem(res, 422, 'validation_failed', 'Request rejected', 'The webhook configuration is invalid.', 'trace-webhook');
    return true;
  }
  found.url = configuration.url;
  found.scopeType = configuration.scopeType;
  found.scopeId = configuration.scopeId;
  found.events = configuration.events;
  found.active = configuration.active;
  const response = view(found);
  replays.set(key, { fingerprint, status: 200, body: response });
  ctx.send(res, 200, response);
  return true;
}

function rotateSecret(req, res, ctx, url, id) {
  const tenantId = tenant(url);
  if (!tenantId) return invalidTenant(res, ctx);
  const key = idempotencyKey(req);
  if (!key) return invalidKey(res, ctx);
  const fingerprint = `${req.method} ${req.url}`;
  const prior = replays.get(key);
  if (prior) return replay(res, ctx, prior, fingerprint);
  const found = subscriptions.find((item) => item.id === id && item.tenantId === tenantId);
  if (!found) return missing(res, ctx);
  const response = { subscription: view(found), secret: signingSecret() };
  replays.set(key, { fingerprint, status: 200, body: response });
  ctx.send(res, 200, response);
  return true;
}

function listDeliveries(res, ctx, url, id) {
  const tenantId = tenant(url);
  if (!tenantId) return invalidTenant(res, ctx);
  const found = subscriptions.find((item) => item.id === id && item.tenantId === tenantId);
  if (!found) return missing(res, ctx);
  ctx.send(res, 200, { items: deliveries.get(id) ?? [], nextCursor: null });
  return true;
}

function sampleDeliveries() {
  const now = new Date().toISOString();
  return [
    {
      id: randomUUID(),
      eventId: randomUUID(),
      eventType: 'page.published',
      status: 'completed',
      attempts: 1,
      nextRunAt: null,
      responseCode: 200,
      createdAt: now,
      history: [{ id: randomUUID(), startedAt: now, responseCode: 200, error: null, durationMs: 40 }]
    },
    {
      id: randomUUID(),
      eventId: randomUUID(),
      eventType: 'release.promoted',
      status: 'failed',
      attempts: 8,
      nextRunAt: null,
      responseCode: 500,
      createdAt: now,
      history: [{ id: randomUUID(), startedAt: now, responseCode: 500, error: 'destination_rejected', durationMs: 12 }]
    }
  ];
}

function view(subscription) {
  return {
    id: subscription.id,
    url: subscription.url,
    scopeType: subscription.scopeType,
    scopeId: subscription.scopeId,
    events: [...subscription.events],
    active: subscription.active,
    createdAt: subscription.createdAt
  };
}

function readConfiguration(body, creating) {
  if (!body || typeof body !== 'object') return null;
  const active = body.active === undefined ? false : body.active;
  if (typeof body.url !== 'string' || !httpsUrl(body.url)) return null;
  if (body.scopeType !== 'tenant' && body.scopeType !== 'space' && body.scopeType !== 'site') return null;
  if (body.scopeType === 'tenant' ? body.scopeId != null : typeof body.scopeId !== 'string' || !uuid(body.scopeId)) return null;
  if (!Array.isArray(body.events) || body.events.length === 0) return null;
  if (new Set(body.events).size !== body.events.length) return null;
  if (body.events.some((event) => typeof event !== 'string' || !eventTypes.includes(event))) return null;
  if (typeof active !== 'boolean') return null;
  if (!creating && body.active === undefined) return null;
  return {
    url: body.url,
    scopeType: body.scopeType,
    scopeId: body.scopeType === 'tenant' ? null : body.scopeId,
    events: [...body.events],
    active
  };
}

function httpsUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && parsed.username === '' && parsed.password === '' && parsed.hash === '' && parsed.hostname !== '';
  } catch {
    return false;
  }
}

function uuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function tenant(url) {
  const value = url.searchParams.get('tenantId');
  return value && uuid(value) ? value : null;
}

function signingSecret() {
  return `whsec_${randomBytes(32).toString('base64')}`;
}

function idempotencyKey(req) {
  const key = req.headers['idempotency-key'];
  if (typeof key !== 'string' || !/^[a-zA-Z0-9._:-]+$/.test(key) || key.length > 128) return null;
  return key;
}

function replay(res, ctx, prior, fingerprint) {
  if (prior.fingerprint !== fingerprint) {
    ctx.problem(res, 409, 'idempotency_key_reused', 'Request rejected', 'This key was used for a different request.', 'trace-webhook');
    return true;
  }
  ctx.send(res, prior.status, prior.body);
  return true;
}

async function readBody(req, res, ctx) {
  try {
    return await ctx.readJson(req);
  } catch {
    ctx.problem(res, 400, 'malformed_json', 'Request rejected', 'The request body is not JSON.', 'trace-webhook');
    return null;
  }
}

function authorized(req) {
  const header = req.headers.authorization ?? '';
  return header.startsWith('Bearer ') && header.length > 'Bearer '.length;
}

function unauthorized(res, ctx) {
  ctx.problem(res, 401, 'authentication_required', 'Authentication rejected', 'The supplied credential is invalid.', 'trace-webhook');
  return true;
}

function invalidKey(res, ctx) {
  ctx.problem(res, 400, 'invalid_idempotency_key', 'Invalid idempotency key', 'Idempotency-Key must contain between 1 and 128 characters.', 'trace-webhook');
  return true;
}

function invalidTenant(res, ctx) {
  ctx.problem(res, 400, 'validation_failed', 'Request rejected', 'tenantId is required.', 'trace-webhook');
  return true;
}

function missing(res, ctx) {
  ctx.problem(res, 404, 'resource_not_found', 'Not found', 'Webhook was not found.', 'trace-webhook');
  return true;
}

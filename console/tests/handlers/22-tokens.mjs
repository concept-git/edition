// @ts-nocheck
import { randomBytes, randomUUID } from 'node:crypto';

/**
 * Stand-in for API tokens and management tokens.
 * The secret is returned only from a successful issue response.
 */

const tenantId = '6f1e0c2a-6b4d-4e3a-9c11-0a1b2c3d4e5f';
const spaceId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const ownerId = '33333333-3333-4333-8333-333333333333';
const apiScopes = new Set(['read', 'write', 'publish']);
const managementScopes = new Set([
  'content:read',
  'content:write',
  'content:publish',
  'members:read',
  'members:write',
  'permissions:read',
  'permissions:write',
  'hosting:read',
  'hosting:write',
  'audit:read',
  'operations:read',
  'operations:write',
  'account:read',
  'account:write',
  'platform:read',
  'platform:write',
  'platform:erase'
]);
const roles = new Set(['admin', 'maintainer', 'author', 'reader']);

let apiTokens = [];
let managementTokens = [];
let apiReplay = new Map();
let managementReplay = new Map();

export async function handle(req, res, ctx) {
  const { url } = ctx;
  if (req.method === 'POST' && url.pathname === '/__stub/tokens/reset') {
    reset();
    res.writeHead(204);
    res.end();
    return true;
  }

  if (req.method === 'GET' && url.pathname === '/api/v1/me') {
    if (!authorized(req)) return unauthorized(res, ctx);
    ctx.send(res, 200, {
      id: ownerId,
      email: 'maintainer@edition.test',
      name: '维护者',
      verified: true,
      status: 'active',
      platformOperator: false,
      tenants: [{ id: tenantId, name: '当前租户', role: 'owner', status: 'active' }]
    });
    return true;
  }

  const spaces = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/spaces$/);
  if (req.method === 'GET' && spaces) {
    if (spaces[1] !== tenantId) return false;
    if (!authorized(req)) return unauthorized(res, ctx);
    ctx.send(res, 200, {
      items: [{ id: spaceId, tenantId, name: '手册', mode: 'authored', status: 'active' }],
      nextCursor: null,
      total: 1,
      allowedActions: ['read']
    });
    return true;
  }

  const tokenItem = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/tokens\/([^/]+)$/);
  if (req.method === 'DELETE' && tokenItem) {
    if (tokenItem[1] !== tenantId) return false;
    if (!authorized(req)) return unauthorized(res, ctx);
    const token = apiTokens.find((item) => item.id === tokenItem[2]);
    if (!token) return missing(res, ctx, 'token_not_found', 'Token not found');
    token.status = 'revoked';
    res.writeHead(204);
    res.end();
    return true;
  }

  const tokenList = url.pathname.match(/^\/api\/v1\/tenants\/([^/]+)\/tokens$/);
  if (tokenList && tokenList[1] === tenantId) {
    if (!authorized(req)) return unauthorized(res, ctx);
    if (req.method === 'GET') {
      ctx.send(res, 200, { tokens: apiTokens.map((token) => ({ ...token })), nextCursor: null, total: apiTokens.length });
      return true;
    }
    if (req.method === 'POST') return issueApi(req, res, ctx);
  }

  if (url.pathname === '/api/v1/me/access-tokens') {
    if (!authorized(req)) return unauthorized(res, ctx);
    if (req.method === 'GET') {
      ctx.send(res, 200, { items: managementTokens.map((token) => ({ ...token })), nextCursor: null });
      return true;
    }
    if (req.method === 'POST') return issueManagement(req, res, ctx);
  }

  const managementItem = url.pathname.match(/^\/api\/v1\/me\/access-tokens\/([^/]+)$/);
  if (req.method === 'DELETE' && managementItem) {
    if (!authorized(req)) return unauthorized(res, ctx);
    const token = managementTokens.find((item) => item.id === managementItem[1]);
    if (!token) return missing(res, ctx, 'token_not_found', 'Token not found');
    token.status = 'revoked';
    token.revokedAt = new Date().toISOString();
    res.writeHead(204);
    res.end();
    return true;
  }

  return false;
}

function reset() {
  apiTokens = [];
  managementTokens = [];
  apiReplay = new Map();
  managementReplay = new Map();
}

async function issueApi(req, res, ctx) {
  const key = idempotencyKey(req);
  if (!key) return invalidKey(res, ctx);
  const body = await readBody(req, res, ctx);
  if (!body) return true;
  const fingerprint = JSON.stringify(body);
  const prior = apiReplay.get(key);
  if (prior) return replay(res, ctx, prior, fingerprint);
  if (!validApiBody(body)) {
    const code = !roles.has(body.role) ? 'invalid_token_role' : body.spaceId !== spaceId ? 'space_not_found' : scopesOk(body.scopes, apiScopes) ? 'invalid_token_expiry' : 'invalid_token_scope';
    ctx.problem(res, code === 'space_not_found' ? 404 : 422, code, 'Token rejected', 'The token request was rejected.', 'trace-tokens');
    return true;
  }
  const id = randomUUID();
  const view = {
    id,
    name: body.name,
    ownerId,
    tenantId,
    spaceId: body.spaceId,
    role: body.role,
    scopes: [...body.scopes],
    expiry: body.expiry,
    status: 'active',
    createdAt: new Date().toISOString()
  };
  apiTokens.push(view);
  const response = { ...view, secret: `spc_${id}_${randomBytes(32).toString('base64url')}` };
  apiReplay.set(key, { fingerprint, response });
  ctx.send(res, 201, response);
  return true;
}

async function issueManagement(req, res, ctx) {
  const key = idempotencyKey(req);
  if (!key) return invalidKey(res, ctx);
  const body = await readBody(req, res, ctx);
  if (!body) return true;
  const fingerprint = JSON.stringify(body);
  const prior = managementReplay.get(key);
  if (prior) return replay(res, ctx, prior, fingerprint);
  if (typeof body.name !== 'string' || body.name.trim() === '' || !scopesOk(body.scopes, managementScopes) || !futureExpiry(body.expiry)) {
    const code = scopesOk(body.scopes, managementScopes) ? 'invalid_token_expiry' : 'invalid_management_token_scope';
    const status = typeof body.name !== 'string' ? 400 : 422;
    ctx.problem(res, status, typeof body.name !== 'string' ? 'invalid_idempotency_key' : code, 'Token rejected', 'The token request was rejected.', 'trace-tokens');
    return true;
  }
  const id = randomUUID();
  const view = {
    id,
    name: body.name,
    scopes: [...body.scopes],
    tenantId: typeof body.tenantId === 'string' ? body.tenantId : null,
    expiry: body.expiry,
    status: 'active',
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
    revokedAt: null
  };
  managementTokens.push(view);
  const response = { token: { ...view }, secret: `spm_${id}_${randomBytes(32).toString('base64url')}` };
  managementReplay.set(key, { fingerprint, response });
  ctx.send(res, 201, response);
  return true;
}

function validApiBody(body) {
  return typeof body.name === 'string' && body.name.trim() !== '' && body.spaceId === spaceId && roles.has(body.role) && scopesOk(body.scopes, apiScopes) && futureExpiry(body.expiry);
}

function scopesOk(scopes, allowed) {
  return Array.isArray(scopes) && scopes.length > 0 && scopes.every((scope) => allowed.has(scope));
}

function futureExpiry(value) {
  const time = Date.parse(value);
  return Number.isFinite(time) && time > Date.now();
}

function idempotencyKey(req) {
  const key = req.headers['idempotency-key'];
  if (typeof key !== 'string' || !/^[a-zA-Z0-9._:-]+$/.test(key) || key.length > 128) return null;
  return key;
}

function replay(res, ctx, prior, fingerprint) {
  if (prior.fingerprint !== fingerprint) {
    ctx.problem(res, 409, 'idempotency_key_reused', 'Idempotency key reused', 'This key was already used for a different request.', 'trace-tokens');
    return true;
  }
  ctx.send(res, 201, prior.response);
  return true;
}

async function readBody(req, res, ctx) {
  try {
    return await ctx.readJson(req);
  } catch {
    ctx.problem(res, 400, 'invalid_idempotency_key', 'Invalid request', 'The request body is not JSON.', 'trace-tokens');
    return null;
  }
}

function authorized(req) {
  const header = req.headers.authorization ?? '';
  return header.startsWith('Bearer ') && header.length > 'Bearer '.length;
}

function unauthorized(res, ctx) {
  ctx.problem(res, 401, 'authentication_required', 'Authentication rejected', 'The supplied credential is invalid.', 'trace-tokens');
  return true;
}

function invalidKey(res, ctx) {
  ctx.problem(res, 400, 'invalid_idempotency_key', 'Invalid idempotency key', 'Idempotency-Key must contain between 1 and 128 characters.', 'trace-tokens');
  return true;
}

function missing(res, ctx, code, title) {
  ctx.problem(res, 404, code, title, title, 'trace-tokens');
  return true;
}

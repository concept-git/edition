import { Server } from 'node:http';

/**
 * Account stand-in. Login still belongs to the auth stub, which only accepts
 * one password. This module rewrites a successful login onto that password
 * and rejects refresh after the current session has been ended.
 */

const maintainerEmail = 'maintainer@edition.test';
const originalPassword = 'correct-password';
const userId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const currentSessionId = '11111111-1111-4111-8111-111111111111';
const otherSessionId = '22222222-2222-4222-8222-222222222222';

let password = originalPassword;
let status = 'active';
let otherSession = true;
let blockRefresh = false;

function resetAccount() {
  password = originalPassword;
  status = 'active';
  otherSession = true;
  blockRefresh = false;
}

const originalEmit = Server.prototype.emit;
if (!originalEmit.accountWrapped) {
  function emit(event, req, res, ...rest) {
    if (event !== 'request' || !req || !res) return originalEmit.call(this, event, req, res, ...rest);
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    if (req.method === 'POST' && url.pathname === '/__stub/reset') {
      resetAccount();
      return originalEmit.call(this, event, req, res, ...rest);
    }
    if (req.method === 'POST' && url.pathname === '/auth/login') {
      consumeJson(req)
        .then((body) => {
          const email = String(body.email ?? '').trim().toLowerCase();
          const allowed = status === 'active' && email === maintainerEmail && String(body.password ?? '') === password;
          if (allowed) blockRefresh = false;
          const forwarded = { ...body, password: allowed ? originalPassword : 'rejected-password' };
          originalEmit.call(this, event, withBody(req, forwarded), res, ...rest);
        })
        .catch(() => {
          originalEmit.call(this, event, withBody(req, {}), res, ...rest);
        });
      return true;
    }
    if (req.method === 'POST' && url.pathname === '/auth/refresh' && blockRefresh) {
      return originalEmit.call(this, event, withoutRefresh(req), res, ...rest);
    }
    return originalEmit.call(this, event, req, res, ...rest);
  }
  emit.accountWrapped = true;
  Server.prototype.emit = emit;
}

const clearCookie = 'refresh_token=; Max-Age=0; Path=/auth; HttpOnly; Secure; SameSite=Lax';

export async function handle(req, res, ctx) {
  const { url } = ctx;
  if (req.method === 'GET' && url.pathname === '/api/v1/me') {
    if (!bearer(req, res, ctx)) return true;
    ctx.send(res, 200, profile());
    return true;
  }
  if (req.method === 'POST' && url.pathname === '/api/v1/me/password:change') {
    if (!bearer(req, res, ctx)) return true;
    const body = await ctx.readJson(req);
    const oldPassword = String(body.oldPassword ?? '');
    const newPassword = String(body.newPassword ?? '');
    if (oldPassword !== password) {
      ctx.problem(res, 400, 'invalid_old_password', 'Password rejected', 'The current password is wrong.', 'trace-password');
      return true;
    }
    if (weakPassword(newPassword)) {
      ctx.problem(res, 422, 'password_too_weak', 'Password rejected', 'Password must be at least 8 characters and include a letter and a digit.', 'trace-password');
      return true;
    }
    password = newPassword;
    blockRefresh = true;
    noContent(res, { 'set-cookie': clearCookie });
    return true;
  }
  if (req.method === 'GET' && url.pathname === '/api/v1/me/sessions') {
    if (!bearer(req, res, ctx)) return true;
    ctx.send(res, 200, { sessions: listSessions(), nextCursor: null });
    return true;
  }
  if (req.method === 'DELETE' && url.pathname.startsWith('/api/v1/me/sessions/')) {
    if (!bearer(req, res, ctx)) return true;
    const id = decodeURIComponent(url.pathname.slice('/api/v1/me/sessions/'.length));
    if (id === otherSessionId) otherSession = false;
    if (id === currentSessionId) blockRefresh = true;
    noContent(res, id === currentSessionId ? { 'set-cookie': clearCookie } : {});
    return true;
  }
  if (req.method === 'POST' && url.pathname === '/api/v1/me:erase') {
    if (!bearer(req, res, ctx)) return true;
    if (!idempotency(req, res, ctx)) return true;
    const body = await ctx.readJson(req);
    if (!confirms(body)) {
      ctx.problem(res, 400, 'erase_confirmation_invalid', 'Erasure rejected', 'The confirmation does not match this account.', 'trace-erase');
      return true;
    }
    status = 'erased';
    blockRefresh = true;
    noContent(res, { 'set-cookie': clearCookie });
    return true;
  }
  if (req.method === 'POST' && url.pathname === '/api/v1/me:deactivate') {
    if (!bearer(req, res, ctx)) return true;
    if (!idempotency(req, res, ctx)) return true;
    if (status === 'erased') {
      ctx.problem(res, 409, 'user_erased', 'Account erased', 'An erased account cannot be deactivated.', 'trace-deactivate');
      return true;
    }
    const body = await ctx.readJson(req);
    if (String(body.currentPassword ?? '') !== password || emailOf(body) !== maintainerEmail) {
      ctx.problem(res, 400, 'invalid_old_password', 'Password rejected', 'The current password is wrong.', 'trace-deactivate');
      return true;
    }
    status = 'deactivated';
    noContent(res);
    return true;
  }
  if (req.method === 'POST' && url.pathname === '/api/v1/me:reactivate') {
    if (!bearer(req, res, ctx)) return true;
    if (!idempotency(req, res, ctx)) return true;
    if (status === 'erased') {
      ctx.problem(res, 409, 'user_erased', 'Account erased', 'An erased account cannot be restored.', 'trace-reactivate');
      return true;
    }
    status = 'active';
    noContent(res);
    return true;
  }
  return false;
}

function profile() {
  return {
    id: userId,
    email: status === 'erased' ? '' : maintainerEmail,
    name: status === 'erased' ? '已注销用户' : '维护者',
    avatar: null,
    locale: status === 'erased' ? null : 'zh-CN',
    verified: status !== 'erased',
    status,
    platformOperator: false,
    tenants: [{ id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', name: 'Edition', role: 'owner', status: 'active' }]
  };
}

function listSessions() {
  const now = '2026-11-22T12:00:00.000Z';
  const sessions = [
    {
      id: currentSessionId,
      device: { name: '这台设备', browser: 'Chrome', os: 'macOS' },
      ipApproximate: '127.0.0.0',
      createdAt: '2026-11-22T08:00:00.000Z',
      lastSeenAt: now,
      expiresAt: '2026-12-22T08:00:00.000Z',
      current: true
    }
  ];
  if (otherSession) {
    sessions.push({
      id: otherSessionId,
      device: { name: '另一台设备', browser: 'Firefox', os: 'Linux' },
      ipApproximate: '10.0.0.0',
      createdAt: '2026-11-21T08:00:00.000Z',
      lastSeenAt: '2026-11-22T09:00:00.000Z',
      expiresAt: '2026-12-21T08:00:00.000Z',
      current: false
    });
  }
  return sessions;
}

function confirms(body) {
  return emailOf(body) === maintainerEmail && String(body.currentPassword ?? '') === password;
}

function emailOf(body) {
  return String(body.confirmationEmail ?? '').trim().toLowerCase();
}

function weakPassword(value) {
  return value.length < 8 || !/[A-Za-z]/.test(value) || !/\d/.test(value);
}

function bearer(req, res, ctx) {
  const header = req.headers.authorization ?? '';
  if (!header.startsWith('Bearer ') || header.length < 8) {
    ctx.problem(res, 401, 'authentication_required', 'Authentication required', 'The access token is missing.', 'trace-account');
    return false;
  }
  return true;
}

function idempotency(req, res, ctx) {
  const key = req.headers['idempotency-key'];
  if (typeof key !== 'string' || !/^[a-zA-Z0-9._:-]+$/.test(key)) {
    ctx.problem(res, 400, 'validation_failed', 'Invalid request', 'Idempotency-Key is required.', 'trace-account');
    return false;
  }
  return true;
}

function noContent(res, headers = {}) {
  res.writeHead(204, headers);
  res.end();
}

function withBody(req, body) {
  const payload = Buffer.from(JSON.stringify(body));
  return {
    method: req.method,
    url: req.url,
    headers: req.headers,
    socket: req.socket,
    async *[Symbol.asyncIterator]() {
      yield payload;
    }
  };
}

function withoutRefresh(req) {
  return {
    method: req.method,
    url: req.url,
    headers: { ...req.headers, cookie: '' },
    socket: req.socket,
    async *[Symbol.asyncIterator]() {}
  };
}

async function consumeJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

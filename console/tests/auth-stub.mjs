import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/**
 * Stand-in for Control's auth session endpoints.
 * Cookie and problem+json shapes follow the management contract.
 * The refresh token is only ever written as a Set-Cookie header.
 */

const port = Number(process.env.AUTH_STUB_PORT ?? 4188);
const maintainer = {
  email: 'maintainer@edition.test',
  password: 'correct-password'
};
const tokens = new Set();
let refreshMode = 'ok';
let loginMode = 'ok';

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1');
  if (req.method === 'GET' && url.pathname === '/health') {
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end('ok');
    return;
  }
  if (req.method === 'POST' && url.pathname === '/__stub/reset') {
    refreshMode = 'ok';
    loginMode = 'ok';
    res.writeHead(204);
    res.end();
    return;
  }
  if (req.method === 'POST' && url.pathname === '/__stub/refresh') {
    const body = await readJson(req);
    refreshMode = body.mode ?? 'ok';
    res.writeHead(204);
    res.end();
    return;
  }
  if (req.method === 'POST' && url.pathname === '/__stub/login') {
    const body = await readJson(req);
    loginMode = body.mode ?? 'ok';
    res.writeHead(204);
    res.end();
    return;
  }
  if (req.method === 'POST' && url.pathname === '/auth/login') {
    await login(req, res);
    return;
  }
  if (req.method === 'POST' && url.pathname === '/auth/refresh') {
    refresh(req, res);
    return;
  }
  if (req.method === 'POST' && url.pathname === '/auth/logout') {
    logout(req, res);
    return;
  }
  for (const handler of handlers) {
    if (await handler.handle(req, res, { url, problem, json, send, readJson })) return;
  }
  res.writeHead(404, { 'content-type': 'text/plain' });
  res.end('not found');
});

const handlers = await loadHandlers();

async function loadHandlers() {
  const directory = join(dirname(fileURLToPath(import.meta.url)), 'handlers');
  let names = [];
  try {
    names = readdirSync(directory)
      .filter((name) => name.endsWith('.mjs'))
      .sort();
  } catch {
    return [];
  }
  const loaded = [];
  for (const name of names) {
    loaded.push(await import(pathToFileURL(join(directory, name)).href));
  }
  return loaded;
}

server.listen(port, '127.0.0.1');

async function login(req, res) {
  const mode = take('login');
  if (sendFailure(req, res, mode)) return;
  const body = await readJson(req);
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  if (email !== maintainer.email || password !== maintainer.password) {
    const detail = email.includes('locked')
      ? 'account locked'
      : email.includes('deactivated')
        ? 'account deactivated'
        : email.includes('nobody')
          ? 'unknown account'
          : 'The supplied credential is invalid.';
    problem(res, 401, 'invalid_credentials', 'Authentication rejected', detail, 'trace-login');
    return;
  }
  const refreshToken = issue();
  json(res, 200, tokenBody(), setCookie(refreshToken, 60 * 60 * 24 * 30));
}

function refresh(req, res) {
  const mode = take('refresh');
  if (sendFailure(req, res, mode)) return;
  const current = readCookie(req, 'refresh_token');
  if (!current || !tokens.has(current)) {
    problem(res, 401, 'invalid_refresh', 'Authentication rejected', 'The supplied credential is invalid.', 'trace-refresh', clearCookie());
    return;
  }
  const next = issue();
  json(res, 200, tokenBody(), setCookie(next, 60 * 60 * 24 * 30));
}

function logout(req, res) {
  const current = readCookie(req, 'refresh_token');
  if (current) tokens.delete(current);
  res.writeHead(204, { 'set-cookie': clearCookie() });
  res.end();
}

function sendFailure(req, res, mode) {
  if (mode === 'ok') return false;
  if (mode === 'drop') {
    req.socket.destroy();
    return true;
  }
  if (mode === 'invalid_refresh') {
    problem(res, 401, 'invalid_refresh', 'Authentication rejected', 'The supplied credential is invalid.', 'trace-refresh', clearCookie());
    return true;
  }
  if (mode === 'forbidden') {
    problem(res, 403, 'cross_site_request_rejected', 'Request rejected', 'Login, refresh and logout require an allowed browser origin.', 'trace-origin');
    return true;
  }
  if (mode === 'rate_limited') {
    problem(res, 429, 'rate_limited', 'Rate limited', 'Too many authentication attempts.', 'trace-rate', { 'retry-after': '60' });
    return true;
  }
  if (mode === 'server') {
    problem(res, 500, 'unexpected_error', 'Unexpected error', 'The request could not be completed.', 'trace-server');
    return true;
  }
  problem(res, 500, 'unexpected_error', 'Unexpected error', 'The request could not be completed.', 'trace-server');
  return true;
}

function take(kind) {
  return kind === 'refresh' ? refreshMode : loginMode;
}

function issue() {
  const token = randomBytes(18).toString('hex');
  tokens.add(token);
  return token;
}

function tokenBody() {
  return {
    accessToken: randomBytes(18).toString('hex'),
    tokenType: 'Bearer',
    expiresIn: 900
  };
}

function setCookie(value, maxAge) {
  return `refresh_token=${value}; Max-Age=${maxAge}; Path=/auth; HttpOnly; Secure; SameSite=Lax`;
}

function clearCookie() {
  return 'refresh_token=; Max-Age=0; Path=/auth; HttpOnly; Secure; SameSite=Lax';
}

function problem(res, status, code, title, detail, traceId, extra) {
  const body = JSON.stringify({
    type: `https://space.io/problems/${code.replaceAll('_', '-')}`,
    title,
    status,
    code,
    detail,
    traceId
  });
  const headers = {
    'content-type': 'application/problem+json',
    'content-length': Buffer.byteLength(body)
  };
  if (typeof extra === 'string') headers['set-cookie'] = extra;
  else if (extra) Object.assign(headers, extra);
  res.writeHead(status, headers);
  res.end(body);
}

function send(res, status, body, headers = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json',
    'content-length': Buffer.byteLength(payload),
    ...headers
  });
  res.end(payload);
}

function json(res, status, body, cookie) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json',
    'content-length': Buffer.byteLength(payload),
    'set-cookie': cookie
  });
  res.end(payload);
}

function readCookie(req, name) {
  const header = req.headers.cookie ?? '';
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

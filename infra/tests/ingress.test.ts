import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('production ingress covers every public management API prefix, including operations', () => {
  const config = readFileSync(new URL('../deployment/production.Caddyfile', import.meta.url), 'utf8');
  const contract = JSON.parse(readFileSync(new URL('../../contracts/openapi.json', import.meta.url), 'utf8'));
  const patterns = config.match(/@control path (.+)/)![1].split(/\s+/);
  const publicRoots = new Set(['api', 'auth', 'admin', 'ops', 'audit', 'stats', 'webhooks']);
  const paths = Object.keys(contract.paths).filter(path =>
    publicRoots.has(path.split('/')[1].split(':')[0]));
  assert.ok(paths.includes('/ops/jobs'));
  for (const path of paths) {
    assert.ok(patterns.some(pattern =>
      pattern.endsWith('*') ? path.startsWith(pattern.slice(0, -1)) : path === pattern),
    `Management route is missing from production ingress: ${path}`);
  }
  const reader = config.slice(config.indexOf('{$DOCS_DOMAIN}'));
  assert.ok(!reader.includes('/ops/*'));
  // Machine resources reach Reader, the session resource Control, and every other path the reading frontend.
  assert.match(config, /\(reader_routes\)[\s\S]*?\/api\/content\/\*[\s\S]*?CONTENT_UPSTREAM/);
  assert.match(reader, /handle \/_auth\/\*[\s\S]*?ADMIN_UPSTREAM/);
  assert.match(reader, /import reader_routes[\s\S]*?handle \{\s*reverse_proxy \{\$READING_UPSTREAM/);
});

test('public /healthz stays a 404 and is matched before the catch-all', () => {
  const config = readFileSync(new URL('../deployment/production.Caddyfile', import.meta.url), 'utf8');
  const reader = config.slice(config.indexOf('{$DOCS_DOMAIN}'));
  assert.match(reader, /@internal path [^\n]*\/healthz[^\n]*\n\s*handle @internal \{\s*respond 404/);
  assert.ok(reader.indexOf('handle @internal') < reader.indexOf('import reader_routes'));
});

test('acceptance edge serves HTTPS and plain HTTP with identical routes, /healthz on Reader', () => {
  const config = readFileSync(new URL('../deployment/acceptance.Caddyfile', import.meta.url), 'utf8');
  assert.match(config, /https:\/\/\*\.acme\.test:8446 \{[^}]*import edge_routes/);
  assert.match(config, /http:\/\/:8097 \{\s*import edge_routes/);
  assert.match(config, /'\/healthz'/);
  assert.match(config, /handle \/_auth\/\* \{\s*reverse_proxy \{\$E2E_CONTROL_UPSTREAM/);
  assert.match(config, /handle \{\s*reverse_proxy \{\$E2E_READING_UPSTREAM/);
  for (const route of ['/api/content/*', '/sitemap.xml', '/robots.txt', '/llms.txt']) assert.ok(config.includes(`'${route}'`), route);
  assert.ok(config.includes("['markdown', 'source']"));
});

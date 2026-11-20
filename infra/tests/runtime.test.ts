/** Container remapping retains the same least-privilege identities as host acceptance. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('launchers resolve the Control artifact using the repository release version', async () => {
  const r = await import('../space.ts');
  const version = readFileSync(join(r.ROOT, 'VERSION'), 'utf8').trim();
  assert.equal(r.jarPath('control'), join(r.ROOT, `backend/apps/control/build/libs/space-control-${version}.jar`));
  assert.equal(r.jarPath('content'), join(r.ROOT, 'backend/apps/content/build/libs/space-content.jar'));
});

test('the reading frontend starts from the reading build artifact on the host Node', async () => {
  const r = await import('../space.ts');
  const command = await r.roleCommand('reading');
  assert.equal(command.exe, process.execPath); assert.deepEqual(command.args, [r.SITE_ENTRY]);
  assert.ok(r.SITE_ENTRY.endsWith('reading/dist-reader/server/entry.mjs'));
});

test('host offsets, internal addresses, role identities and short-profile flags stay consistent', async () => {
  const folder = mkdtempSync(join(tmpdir(), 'space-runtime-'));
  const previous = { runtime: process.env.E2E_RUNTIME_DIR, offset: process.env.E2E_PORT_OFFSET, container: process.env.SPACE_CONTAINER };
  process.env.E2E_RUNTIME_DIR = folder;
  const r = await import(`../space.ts?test=${Date.now()}`);
  const keys = Object.fromEntries(['DELIVERY_CURSOR_KEY', 'ANALYTICS_INGEST_KEY', 'WEBHOOK_ENCRYPTION_KEY', 'IDEMPOTENCY_ENCRYPTION_KEY', 'MAIL_OUTBOX_ENCRYPTION_KEY', 'MEILI_SEARCH_KEY', 'MEILI_WRITER_KEY'].map(name => [name, 'fixture']));
  r.writeJson(r.credentialsFile(), keys);
  try {
    delete process.env.SPACE_CONTAINER; process.env.E2E_PORT_OFFSET = '1000'; assert.equal(r.port('content'), 9095); assert.equal(r.origin('objects'), 'http://localhost:10012');
    assert.equal(r.port('reading'), 9096); assert.equal(r.port('edge'), 9097); assert.equal(r.bindings().E2E_EDGE_PORT, '9097');
    process.env.E2E_PORT_OFFSET = '65535'; assert.throws(() => r.bindings(), /Invalid/);
    process.env.SPACE_CONTAINER = '1';
    // The frontend renders from Reader JSON and forwards sessions to Control; it holds no database or storage credentials.
    const site = r.roleEnv('reading');
    assert.equal(site.SPACE_CONTENT_ORIGIN, 'http://content:8095'); assert.equal(site.SPACE_CONTROL_ORIGIN, 'http://control:8094'); assert.equal(site.PORT, '8096');
    assert.ok(!site.DB_URL && !site.DELIVERY_DB_URL && !site.OBJECT_STORE_ENDPOINT && !site.TRUSTED_PROXIES);
    assert.equal(r.roleEnv('edge').E2E_READING_UPSTREAM, 'reading:8096');
    assert.equal(r.roleEnv('control').READER_PUBLIC_PORT, '8097');
    assert.deepEqual(r.trustedProxies('172.18.0.5').split(','), ['127.0.0.1', '::1', '172.18.0.5']);
    for (const role of ['control', 'content', 'index'] as const) {
      const env = r.roleEnv(role);
      assert.equal(env.DB_URL ?? env.DELIVERY_DB_URL, 'jdbc:postgresql://source:5432/space');
      assert.equal(env.MEILI_URL, role === 'control' ? undefined : 'http://search:7700');
      assert.equal(env.OBJECT_STORE_ENDPOINT, role === 'index' ? undefined : 'http://objects:9000');
      if (role === 'content') { assert.equal(env.DELIVERY_DB_USER, 'publication_reader_login'); assert.equal(env.OBJECT_STORE_BUCKET, 'attachments'); assert.ok(!env.READER_STATE_DB_USER && !env.IDENTITY_URL); assert.ok(!env.SESSION_PRIVATE_KEY && !env.MEILI_WRITER_KEY); }
      if (role === 'index') { assert.equal(env.DELIVERY_WRITER_USER, 'publication_search_login'); assert.ok(!env.OUTBOX_DB_URL); assert.ok(!env.IDENTITY_CONTROL_TOKEN && !env.SESSION_PRIVATE_KEY); }
      if (role === 'control') { assert.equal(env.DELIVERY_DB_URL, undefined); assert.equal(env.SPRING_MAIL_HOST, 'mailpit'); assert.equal(env.SPRING_MAIL_PORT, '1025'); }
    }
    const short = r.roleEnv('control', 'acceptance', { shortReaderAccess: true });
    assert.equal(short.READER_ACCESS_TTL, 'PT5S');
  } finally {
    for (const [name, value] of Object.entries({ E2E_RUNTIME_DIR: previous.runtime, E2E_PORT_OFFSET: previous.offset, SPACE_CONTAINER: previous.container })) { if (value === undefined) delete process.env[name]; else process.env[name] = value; }
    rmSync(folder, { recursive: true, force: true });
  }
});

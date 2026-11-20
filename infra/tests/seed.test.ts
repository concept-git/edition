/** HTTP fixtures verify content preservation and PAT replay without mocking internal seed functions. */
import { afterEach, beforeEach, mock, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, existsSync, readFileSync, unlinkSync, statSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ensurePat, ensurePages, PAT_NAME, PAT_SCOPES, TOKEN_PATH, readJson, writeJson } from '../space.ts';

let folder: string, records: any[], requests: any[], responses: Map<string, any>, lost: boolean, owner: string, auth: any, output: string[];
const secret = 'spm_fixture-never-log-this';
beforeEach(() => {
  folder = join(mkdtempSync(join(tmpdir(), 'space-pat-')), 'runtime'); records = []; requests = []; responses = new Map(); lost = false; owner = 'owner-1'; output = [];
  auth = { credentialType: 'management_token', actorId: owner, credentialId: 'pat-1', tenantId: 'tenant-1', scopes: PAT_SCOPES };
  mock.method(console, 'log', (...args: unknown[]) => output.push(args.join(' ')));
  mock.method(globalThis, 'fetch', async (url: string, init: RequestInit = {}) => {
    let value: any = { items: [{ id: 'space' }] };
    const token = (init.headers as Record<string, string>).Authorization;
    if (url.endsWith('/auth/context')) value = token === 'Bearer session' ? { actorId: owner } : auth;
    else if (url.includes(TOKEN_PATH)) {
      if (init.method === 'POST') {
        const key = (init.headers as Record<string, string>)['Idempotency-Key'], body = JSON.parse(init.body as string); requests.push([key, body]);
        if (!responses.has(key)) { const token = { id: 'pat-1', status: 'active', ...body }; records.push(token); responses.set(key, { token, secret }); }
        if (lost) throw new Error('response lost'); value = responses.get(key);
      } else value = { items: records, nextCursor: null };
    }
    return Response.json(value);
  });
});
afterEach(() => { assert.ok(!output.join('\n').includes(secret)); mock.restoreAll(); rmSync(join(folder, '..'), { recursive: true, force: true }); });
const seed = (check = false) => ensurePat('session', 'tenant-1', folder, check);
test('first seed issues one tenant-scoped PAT and repeat/check reuse it with private files', async () => {
  assert.equal(await seed(), true); assert.equal(await seed(), true); assert.equal(await seed(true), true); assert.equal(requests.length, 1);
  assert.equal(requests[0][1].tenantId, 'tenant-1'); assert.deepEqual(requests[0][1].scopes, PAT_SCOPES);
  assert.ok(Math.abs(Date.parse(requests[0][1].expiry) - Date.now() - 30 * 86400000) < 5000);
  assert.equal(readFileSync(join(folder, 'management-pat.token'), 'utf8').trim(), secret);
  if (process.platform !== 'win32') for (const file of ['management-pat.token', 'management-pat.json']) assert.equal(statSync(join(folder, file)).mode & 0o777, 0o600);
  assert.ok(readdirSync(folder).every(file => !file.startsWith('.pending-')));
});
test('a lost response retries the exact key and request rather than issuing a second token', async () => {
  lost = true; await assert.rejects(seed(), /response lost/); lost = false; await seed();
  assert.deepEqual(requests[0], requests[1]); assert.equal(records.length, 1);
});
test('a missing secret can be restored without reissuing', async () => {
  await seed(); unlinkSync(join(folder, 'management-pat.token')); await assert.rejects(seed(true), /secret file is missing/); await seed(); assert.equal(requests.length, 1);
});
test('revoked, expired and missing tokens are not replaced', async () => {
  await seed();
  for (const status of ['revoked', 'expired', null]) {
    if (status) records[0].status = status; else records = [];
    assert.equal(await seed(), false); await assert.rejects(seed(true), /expired, revoked or absent/);
  }
  assert.equal(requests.length, 1);
});
test('missing checkpoint, wrong owner or wrong authorization cannot duplicate a PAT', async () => {
  await seed(); owner = 'another-owner'; await assert.rejects(seed(), /another origin, owner or tenant/); owner = 'owner-1';
  auth.scopes = ['content:write']; await assert.rejects(seed(), /does not match/); auth.scopes = PAT_SCOPES;
  auth.tenantId = 'tenant-2'; await assert.rejects(seed(), /does not match/); auth.tenantId = 'tenant-1';
  unlinkSync(join(folder, 'management-pat.json')); await assert.rejects(seed(), /already exists without its checkpoint/); assert.equal(requests.length, 1);
});
test('check on a fresh platform is read-only', async () => { await assert.rejects(seed(true), /checkpoint is missing/); assert.equal(existsSync(folder), false); assert.equal(requests.length, 0); });
test('pending issuance past the server replay window is not retried', async () => {
  lost = true; await assert.rejects(seed()); const file = join(folder, 'management-pat.json'), saved = readJson<any>(file);
  saved.startedAt = new Date(Date.now() - 24 * 3600000).toISOString(); writeJson(file, saved); lost = false;
  await assert.rejects(seed(), /recovery window elapsed/); assert.equal(requests.length, 1);
});
test('an existing PAT on a later cursor page is found', async () => {
  mock.method(globalThis, 'fetch', async (url: string) => Response.json(url.endsWith('/auth/context') ? { actorId: owner } : url.includes('cursor=') ? { items: [{ id: 'old', name: PAT_NAME, tenantId: 'tenant-1', status: 'active' }] } : { items: [], nextCursor: 'page 2' }));
  await assert.rejects(seed(), /already exists without its checkpoint/); assert.equal(existsSync(folder), false);
});
test('existing content and drafts are preserved while missing pages are added once', async () => {
  const pages: any[] = [{ id: 'existing', slug: 'intro', content: 'User draft', status: 'draft' }]; let writes = 0;
  mock.method(globalThis, 'fetch', async (url: string, init: RequestInit = {}) => {
    let result: any = {};
    if (init.method === 'GET') result = { items: pages };
    else {
      writes++; const body = init.body ? JSON.parse(init.body as string) : {};
      if (url.endsWith('/pages')) { result = { id: body.slug, ...body, status: 'draft' }; pages.push(result); }
      if (url.endsWith('/content')) pages[1].content = body.content;
      if (url.endsWith(':publish')) pages[1].status = 'published';
    }
    return Response.json(result);
  });
  const specs = [['intro', 'Intro', 'markdown', 'Seed content', true], ['guide', 'Guide', 'markdown', 'New guide', true]] as const;
  await ensurePages('session', '/tenant', { id: 'space' }, specs); const firstWrites = writes; await ensurePages('session', '/tenant', { id: 'space' }, specs);
  assert.equal(writes, firstWrites); assert.equal(pages[0].content, 'User draft'); assert.equal(pages[0].status, 'draft'); assert.equal(pages[1].content, 'New guide'); assert.equal(pages[1].status, 'published');
});

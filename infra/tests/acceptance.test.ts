/** A prior run must not supply transformed code without its matching source map. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { browserTestEnvironment } from '../space.ts';

test('acceptance runs isolate Playwright transforms while preserving inherited application settings and foreign caches', () => {
  const directory = mkdtempSync(join(tmpdir(), 'space-acceptance-cache-'));
  const shared = join(directory, 'shared'); mkdirSync(shared);
  const staleCode = join(shared, 'generated.js'); writeFileSync(staleCode, 'cached code with a missing source map');
  const inherited = { PWTEST_CACHE_DIR: shared, E2E_BACKEND_ORIGIN: 'http://localhost:18081', PATH: process.env.PATH, NO_COLOR: '1', FORCE_COLOR: '1' };
  try {
    const first = browserTestEnvironment(directory, 'delivery-first', inherited);
    const second = browserTestEnvironment(directory, 'delivery-second', inherited);
    assert.notEqual(first.PWTEST_CACHE_DIR, shared); assert.notEqual(first.PWTEST_CACHE_DIR, second.PWTEST_CACHE_DIR);
    assert.equal(first.E2E_BACKEND_ORIGIN, inherited.E2E_BACKEND_ORIGIN); assert.equal(first.PATH, inherited.PATH);
    assert.equal(first.NO_COLOR, undefined); assert.equal(first.FORCE_COLOR, undefined);
    assert.equal(inherited.NO_COLOR, '1'); assert.equal(inherited.FORCE_COLOR, '1');
    assert.equal(inherited.PWTEST_CACHE_DIR, shared);
    mkdirSync(first.PWTEST_CACHE_DIR, { recursive: true }); mkdirSync(second.PWTEST_CACHE_DIR, { recursive: true });
    writeFileSync(join(second.PWTEST_CACHE_DIR, 'generated.map'), 'second run map');
    rmSync(first.PWTEST_CACHE_DIR, { recursive: true, force: true });
    assert.equal(readFileSync(staleCode, 'utf8'), 'cached code with a missing source map');
    assert.equal(readFileSync(join(second.PWTEST_CACHE_DIR, 'generated.map'), 'utf8'), 'second run map');
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

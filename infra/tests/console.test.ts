import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { check, roleEnv } from '../edition.ts';

test('console static quality runs the frontend contract, types, boundaries, format, lint and production build', async () => {
  const root = mkdtempSync(join(tmpdir(), 'edition-console-quality-'));
  const calls: string[] = [];
  try {
    await check('static', { scope: 'console' }, { root, execute: async (name) => { calls.push(name); return { name, exitCode: 0, warnings: [], log: '' }; } });
    assert.deepEqual(calls, ['repository', 'console-check', 'console-lint', 'console-format', 'console-build']);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('the console preview process receives no backend database or signing secrets', () => {
  const environment = roleEnv('console');
  assert.equal(environment.NODE_ENV, 'production');
  assert.equal(environment.DB_PASSWORD, undefined);
  assert.equal(environment.SESSION_PRIVATE_KEY, undefined);
});

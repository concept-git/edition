import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const launcher = fileURLToPath(new URL('../edition.ts', import.meta.url));
test('a mistyped command reports how to invoke the launcher and exits unsuccessfully', () => {
  const result = spawnSync(process.execPath, [launcher, 'deply'], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unknown command deply/);
  assert.match(result.stderr, /infra\/edition\.ts/);
});

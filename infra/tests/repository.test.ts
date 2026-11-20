/** Navigation and specification checks retain the complete inventory after the language migration. */
import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { ROOT, documentErrors, entrypointErrors, composition } from '../space.ts';

const folders: string[] = [];
const fixture = () => { const root = mkdtempSync(join(tmpdir(), 'space-repo-')); folders.push(root); return root; };
const write = (root: string, name: string, value: string) => { const path = join(root, name); mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, value); return path; };
afterEach(() => { for (const root of folders.splice(0)) rmSync(root, { recursive: true, force: true }); });
test('navigation supports directories, encoded names and external links while ignoring fenced examples', () => {
  const root = fixture(); write(root, 'docs/a b.md', '# Heading');
  const doc = write(root, 'README.md', '[directory](docs) [file](docs/a%20b.md#heading) [external](https://example.com) [anchor](#local)\n```md\n[template](missing)\n```\n');
  assert.deepEqual(documentErrors(root, [doc]), []);
  writeFileSync(doc, '[guide](docs/missing.md)'); assert.deepEqual(documentErrors(root, [doc]), ['README.md: missing link docs/missing.md']);
});
test('historical package names are excluded only from current architecture checks', () => {
  const root = fixture(), old = write(root, 'docs/history/old.md', 'io.space.concept.iam.user'), active = write(root, 'README.md', 'io.space.concept.iam.user');
  assert.deepEqual(documentErrors(root, [old]), []); assert.match(documentErrors(root, [active])[0], /obsolete Control package/);
});
test('changelog records keep the command that was run', () => {
  const root = fixture(), doc = write(root, 'CHANGELOG.md', 'node infra/acceptance/verify.ts delivery');
  assert.deepEqual(documentErrors(root, [doc]), []);
});
test('docs, CI and package commands detect missing TypeScript entries and stale Python entries', () => {
  const root = fixture(), doc = write(root, 'README.md', 'node infra/platform/start.ts start\npython3 -m infra.demo.seed');
  write(root, '.github/workflows/ci.yml', 'run: node infra/repository/check.ts');
  write(root, 'acceptance/package.json', JSON.stringify({ scripts: { verify: 'cd .. && node infra/acceptance/verify.ts delivery', audit: 'node scripts/missing.mjs' } }));
  assert.equal(documentErrors(root, [doc]).length, 2); assert.equal(entrypointErrors(root).length, 3);
  for (const file of ['infra/platform/start.ts', 'infra/repository/check.ts', 'infra/acceptance/verify.ts', 'acceptance/scripts/missing.mjs']) write(root, file, '');
  assert.equal(documentErrors(root, [doc]).length, 1); assert.deepEqual(entrypointErrors(root), []);
});
test('missing type binding is detected without altering the 20-edge PRD inventory', () => {
  const root = fixture(), prd = 'docs/prd/README.md', app = 'backend/apps/control/src/main/java/io/space/control/compositions/SYNCS.md';
  for (const path of [prd, app]) write(root, path, readFileSync(join(ROOT, path), 'utf8'));
  assert.equal(composition(root).prdEdges.length, 20);
  writeFileSync(join(root, app), readFileSync(join(root, app), 'utf8').replace(/(include Password\s*)\[[^\n]*?\]/, '$1[Unknown]'));
  assert.throws(() => composition(root), /Password->User/);
});

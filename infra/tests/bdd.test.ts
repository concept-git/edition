/** BDD is a behavioral specification: malformed examples and unowned files must fail before execution. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { inspectFeature, inspectCatalog, checkBdd, ROOT } from '../space.ts';
import { packZip } from '../../acceptance/e2e/support/import-packs.ts';

const scenario = '# language: zh-CN\n@area-iam @suite-console\n功能: 身份访问\n  @case-example-001\n  场景: 拒绝无权请求\n    假如 访客尚未登录\n    当 访客读取管理资源\n    那么 返回 401\n';

test('nested business steps resolve the actual ZIP materials without depending on their own depth', () => {
  const bytes = readFileSync(packZip('F-v1-ok'));
  assert.equal(bytes.subarray(0, 2).toString(), 'PK');
  assert.equal(packZip('F-v1-ok'), join(ROOT, 'acceptance/e2e/fixtures/import-packs/F-v1-ok.zip'));
});

test('the maintained catalog owns every feature and assigns each stable scenario ID once', () => {
  const result = checkBdd();
  assert.deepEqual(result.errors, []);
  assert.equal(result.scenarios, result.ids);
  assert.ok(Object.values(result.suites).every(count => count > 0));
});

test('Gherkin parsing handles Chinese rules, backgrounds and outline examples', () => {
  const source = '# language: zh-CN\n@area-iam @suite-console\n功能: 授权\n  规则: 禁止匿名管理\n    背景:\n      假如 平台已就绪\n    @case-example-001\n    场景大纲: 拒绝 <角色>\n      当 <角色> 访问资源\n      那么 返回 <状态>\n      例子:\n        | 角色 | 状态 |\n        | 匿名 | 401 |\n        | 无权成员 | 403 |\n';
  const result = inspectFeature(source, 'iam/example.feature', 'console');
  assert.deepEqual(result.errors, []);
  assert.equal(result.scenarios, 1);
  assert.equal(result.examples, 2);
});

test('missing outcomes, malformed IDs, wrong ownership and empty features are rejected', () => {
  for (const [source, expected] of [
    [scenario.replace('    那么 返回 401\n', ''), 'observable Then'],
    [scenario.replace('@case-example-001', '@case-example-1'), 'stable'],
    [scenario.replace('@case-example-001\n', ''), 'stable'],
    [scenario.replace('@suite-console', '@suite-delivery'), 'suite tag'],
    [scenario.replace('@area-iam', '@area-hosting'), 'area'],
    [scenario.replace('@area-iam', '@area-iam @area-hosting'), 'conflicting'],
    [scenario.replace('@suite-console', '@suite-console @suite-private'), 'conflicting'],
    [scenario.replace('@suite-console', '@suite-console @skip'), 'disabled or focused'],
    [scenario.replace('@case-example-001', '@case-example-001 @fixme'), 'disabled or focused'],
    [scenario.replace('@case-example-001', '@case-example-001 @only'), 'disabled or focused'],
    ['# language: zh-CN\n@area-iam @suite-console\n功能: 无场景\n', 'no scenarios'],
    ['# language: en\nFeature: English\n', 'zh-CN'],
    ['场景: 缺少功能\n  那么 返回 401\n', 'invalid Gherkin']
  ]) assert.ok(inspectFeature(source, 'iam/example.feature', 'console').errors.some(error => error.includes(expected)), expected);
  const duplicateTitle = scenario + '  @case-example-002\n  场景: 拒绝无权请求\n    那么 返回 403\n';
  assert.match(inspectFeature(duplicateTitle, 'iam/example.feature', 'console').errors.join(), /duplicate scenario title/);
});

test('example tables must bind every placeholder and contain rows with unambiguous columns', () => {
  const outline = scenario.replace('场景:', '场景大纲:').replace('返回 401', '返回 <状态>');
  assert.match(inspectFeature(outline, 'iam/example.feature', 'console').errors.join(), /no example table/);
  for (const table of ['      例子:\n        | 角色 |\n        | 匿名 |\n',
    '      例子:\n        | 状态 | 状态 |\n        | 401 | 403 |\n',
    '      例子:\n        | 状态 |\n']) {
    assert.ok(inspectFeature(outline + table, 'iam/example.feature', 'console').errors.length > 0);
  }
  const examples = '    例子:\n      | 状态 |\n      | 401 |\n';
  for (const payload of ['      """\n      {"role":"<角色>"}\n      """\n', '      | 角色 | <角色> |\n']) {
    const source = outline.replace('    当 访客读取管理资源\n', `    当 访客读取管理资源\n${payload}`) + examples;
    assert.match(inspectFeature(source, 'iam/example.feature', 'console').errors.join(), /does not bind every placeholder/);
    assert.deepEqual(inspectFeature(source.replaceAll('<角色>', '<状态>'), 'iam/example.feature', 'console').errors, []);
  }
  assert.match(inspectFeature(outline.replace('拒绝无权请求', '拒绝 <角色>') + examples, 'iam/example.feature', 'console').errors.join(), /does not bind every placeholder/);
});

test('catalog rejects duplicate assignments, absent owners, invalid sources and unregistered features', () => {
  const root = mkdtempSync(join(tmpdir(), 'space-bdd-'));
  const write = (file: string, value: string) => { const path = join(root, file); mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, value); };
  try {
    const row = { file: 'iam/example.feature', suite: 'console', steps: 'acceptance/e2e/steps/iam/example.steps.ts', specifications: ['CONTEXT.md'] };
    write('CONTEXT.md', '# Terms\n');
    write('features/acceptance/iam/example.feature', scenario);
    write(row.steps, '// Step owner\n');
    write('features/acceptance/catalog.json', JSON.stringify({ version: 1, features: [row, row] }));
    const repeated = inspectCatalog(root).errors.join('\n');
    assert.match(repeated, /assigned more than once/);
    assert.match(repeated, /Duplicate scenario ID/);
    assert.match(repeated, /Empty BDD suite/);
    assert.throws(() => checkBdd(root), /assigned more than once/);
    write('features/acceptance/iam/unregistered.feature', scenario);
    write('acceptance/e2e/steps/iam/unregistered.steps.ts', '// No specification owns this file\n');
    const invalid = [
      { ...row, steps: 'missing.ts' }, { ...row, specifications: [] },
      { ...row, specifications: ['../outside.md', 'missing.md'] },
      { ...row, file: 'iam/absent.feature' }, { ...row, file: '../escape.feature' },
      { ...row, suite: 'unknown' }
    ];
    write('features/acceptance/catalog.json', JSON.stringify({ version: 1, features: invalid }));
    const errors = inspectCatalog(root).errors.join('\n');
    for (const reason of ['step owner', 'behavior specifications', 'behavior source', 'Missing feature', 'Invalid BDD path', 'Invalid BDD suite', 'Unregistered BDD feature', 'Unregistered BDD step owner']) assert.ok(errors.includes(reason), reason);
    write('features/acceptance/catalog.json', JSON.stringify({ version: 2, features: [] }));
    assert.throws(() => inspectCatalog(root), /Invalid BDD catalog/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('scenario IDs and behavior source links are present in every registered specification', () => {
  const catalog = JSON.parse(readFileSync(join(ROOT, 'features/acceptance/catalog.json'), 'utf8'));
  for (const row of catalog.features) {
    const source = readFileSync(join(ROOT, 'features/acceptance', row.file), 'utf8');
    for (const specification of row.specifications) assert.ok(source.includes(`# 规格依据: ${specification}`));
  }
});

/** Check orchestration through a deterministic command interface, not through Docker or a browser. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { check } from '../space.ts';

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'space-quality-'));
  const calls: { name: string; args: string[]; env: NodeJS.ProcessEnv }[] = [];
  const write = (path: string, value: unknown) => {
    const target = join(root, path); mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, typeof value === 'string' ? value : JSON.stringify(value));
  };
  const metrics = Object.fromEntries(['lines', 'branches', 'functions', 'statements'].map(key => [key, { covered: 90, total: 100 }]));
  const java = '<report><package></package><counter type="LINE" missed="1" covered="9"/><counter type="BRANCH" missed="1" covered="9"/><counter type="METHOD" missed="1" covered="9"/></report>';
  const conceptDirectories = ['libraries/first', 'libraries/second'];
  const libraryDirectories = ['libraries/contract', 'libraries/values', 'libraries/request-context'];
  write('backend/concept-modules.json', { concepts: conceptDirectories.map(directory => ({ directory })) });
  for (const directory of [...conceptDirectories, ...libraryDirectories, 'libraries/testing']) write(`backend/${directory}/build.gradle.kts`, 'plugins { java }');
  const execute = async (name: string, _exe: string, args: string[], _dir = '.', env: NodeJS.ProcessEnv = {}) => {
    calls.push({ name, args, env });
    if (name === 'infra-coverage') write(`.scratch/dw-v1/runtime/quality/coverage/${name.split('-')[0]}/coverage-summary.json`, { total: metrics });
    if (name === 'backend-coverage') for (const module of ['apps/control', 'apps/content', 'apps/index', ...conceptDirectories, ...libraryDirectories]) write(`backend/${module}/build/reports/jacoco/test/jacocoTestReport.xml`, java);
    if (name === 'cli-coverage') write('clients/control/build/reports/jacoco/test/jacocoTestReport.xml', java);
    if (name === 'vfs-report' || name === 'compiler-report') write(`.scratch/dw-v1/runtime/quality/coverage/${name.split('-')[0]}/coverage.json`, { totals: { covered_lines: 90, num_statements: 100, covered_branches: 9, num_branches: 10 } });
    return { name, exitCode: 0, warnings: [] as string[], log: `${name}.log` };
  };
  return { root, calls, write, execute, clean: () => rmSync(root, { recursive: true, force: true }) };
}

test('all runs every owner and awaits the three acceptance suites in their required order', async () => {
  const f = fixture();
  try {
    await check('all', { scope: 'all' }, f);
    assert.deepEqual(f.calls.filter(call => call.name.startsWith('acceptance-')).map(call => call.args.at(-1)), ['delivery', 'private', 'vfs']);
    assert.ok(f.calls.some(call => call.args.includes('jacocoTestCoverageVerification')));
    const python = f.calls.filter(call => call.name.startsWith('vfs-'));
    assert.deepEqual(python.map(call => call.name), ['vfs-tests', 'vfs-combine', 'vfs-report']);
    assert.equal(python[0].env.COVERAGE_FILE, python[1].env.COVERAGE_FILE);
    const report = JSON.parse(readFileSync(join(f.root, '.scratch/dw-v1/runtime/quality/all-all.json'), 'utf8'));
    assert.equal(report.passed, true);
    assert.equal(Object.keys(report.coverage).length, 12);
    assert.ok(report.coverage['libraries/second']);
    assert.ok(report.coverage['libraries/values']);
    assert.equal(report.coverage['libraries/testing'], undefined);
  } finally { f.clean(); }
});

test('measurement relaxes tool thresholds but never records a coverage deficit as a pass', async () => {
  const f = fixture();
  try {
    const execute: typeof f.execute = async (...args) => {
      const result = await f.execute(...args);
      if (args[0] === 'infra-coverage') f.write('.scratch/dw-v1/runtime/quality/coverage/infra/coverage-summary.json', { total: Object.fromEntries(['lines', 'branches', 'functions', 'statements'].map(key => [key, { covered: 50, total: 100 }])) });
      return result;
    };
    await check('coverage', { scope: 'infra', measure: true }, { root: f.root, execute });
    assert.ok(f.calls[0].args.includes('--check-coverage=false'));
    const report = JSON.parse(readFileSync(join(f.root, '.scratch/dw-v1/runtime/quality/coverage-infra.json'), 'utf8'));
    assert.equal(report.passed, false);
    assert.equal(report.measurementOnly, true);
    assert.equal(report.coverageErrors.length, 4);
    await assert.rejects(check('coverage', { scope: 'infra' }, { root: f.root, execute }), /Quality checks failed/);
    await assert.rejects(check('static', { scope: 'infra', measure: true }, f), /only valid for coverage/);
  } finally { f.clean(); }
});

test('missing or malformed current reports cannot be replaced by stale successful coverage', async () => {
  const f = fixture();
  try {
    f.write('.scratch/dw-v1/runtime/quality/coverage/infra/coverage-summary.json', { total: {} });
    const noReport = async (name: string) => ({ name, exitCode: 0, warnings: [], log: '' });
    await assert.rejects(check('coverage', { scope: 'infra' }, { root: f.root, execute: noReport }), /Quality checks failed/);
    const malformed: typeof f.execute = async (...args) => {
      const result = await f.execute(...args);
      f.write('.scratch/dw-v1/runtime/quality/coverage/infra/coverage-summary.json', 'broken JSON');
      return result;
    };
    await assert.rejects(check('coverage', { scope: 'infra' }, { root: f.root, execute: malformed }), /Quality checks failed/);
  } finally { f.clean(); }
});

test('one failing command or warning does not prevent independent checks from reporting', async () => {
  for (const failure of ['exit', 'warning']) {
    const f = fixture();
    try {
      const execute: typeof f.execute = async (...args) => ({ ...(await f.execute(...args)), ...(args[0] === 'node' ? { exitCode: failure === 'exit' ? 1 : 0, warnings: failure === 'warning' ? ['diagnostic'] : [] } : {}) });
      await assert.rejects(check('doctor', { scope: 'all' }, { root: f.root, execute }), /Quality checks failed/);
      assert.equal(f.calls.at(-1)?.name, 'docker');
    } finally { f.clean(); }
  }
});

test('Java and Python measurement options do not weaken the normal gate', async () => {
  for (const scope of ['backend', 'cli', 'compiler']) {
    const f = fixture();
    try {
      await check('coverage', { scope, measure: true }, f);
      assert.ok(f.calls.every(call => !call.args.includes('jacocoTestCoverageVerification')));
    } finally { f.clean(); }
  }
});

test('unknown modes and scopes fail before running any external command', async () => {
  const f = fixture();
  try {
    await assert.rejects(check('unknown', { scope: 'infra' }, f), /Unknown quality mode/);
    await assert.rejects(check('coverage', { scope: 'unknown' }, f), /Unknown quality scope/);
    assert.equal(f.calls.length, 0);
  } finally { f.clean(); }
});

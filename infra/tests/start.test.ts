/** Exercise lifecycle ordering and ownership through the same execution interface as Execa. */
import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Options } from 'execa';
import { DEV, main } from '../space.ts';

const project = `dw-test-${randomUUID().slice(0, 8)}`, folder = join(DEV, `platform-${project}`);
afterEach(() => rmSync(folder, { recursive: true, force: true }));
function fakeDocker(fail?: string) {
  const calls: { exe: string; args: readonly string[]; options: Options }[] = [];
  const execute = async (exe: string, args: readonly string[], options: Options = {}) => {
    calls.push({ exe, args, options });
    if (fail && args.includes(fail) && options.reject !== false) throw new Error('command failed');
    return { exitCode: 0, stdout: args[0] === 'info' ? 'linux' : args[0] === 'inspect' ? '172.18.0.2' : args.includes('version') ? '5.1.2' : args[0] === '--version' ? 'Docker version test' : '' };
  };
  return { calls, execute };
}
test('repeat deployment and restart retain ports, credentials and named volumes', async () => {
  const { calls, execute } = fakeDocker(); mkdirSync(folder, { recursive: true }); writeFileSync(join(folder, 'management-pat.token'), 'retained-secret');
  await main(['start', '--project', project, '--port-offset', '9000'], execute);
  await main(['start', '--project', project], execute);
  await main(['restart', '--project', project], execute);
  const compose = calls.filter(call => call.args[0] === 'compose' && call.args.includes('-p'));
  assert.equal(compose.filter(call => call.args.includes('build')).length, 3);
  assert.equal(compose.filter(call => call.args.at(-1) === 'stop').length, 1);
  assert.ok(compose.every(call => call.args.filter(arg => arg === '-f').length === 1));
  for (const call of compose) {
    assert.equal(call.options.env!.E2E_SOURCE_PORT, '14412'); assert.equal(call.options.env!.E2E_STORAGE_NAMESPACE, project);
    assert.ok(!call.args.includes('down') && !call.args.includes('--volumes'));
  }
  assert.ok(compose.filter(call => call.args.includes('up')).every(call => call.args.includes('--wait')));
  assert.equal(compose.filter(call => call.args.at(-1) === 'seed').length, 3);
  assert.match(String(compose.find(call => call.args.includes('psql'))!.options.input), /grant space_publication_reader/);
  const appStart = compose.findIndex(call => call.args.includes('up') && call.args.includes('control'));
  const objectInit = compose.findIndex(call => call.args.includes('objects-init'));
  assert.ok(objectInit >= 0 && objectInit < appStart);
  assert.match(compose[objectInit].args.at(-1)!, /mc admin policy attach/);
  assert.equal(readFileSync(join(folder, 'management-pat.token'), 'utf8'), 'retained-secret');
});
test('stop is repeatable and performs no setup, builds or seeding', async () => {
  const { calls, execute } = fakeDocker(); await main(['stop', '--project', project], execute); await main(['stop', '--project', project], execute);
  assert.equal(calls.filter(call => call.args.includes('stop')).length, 2);
  assert.equal(calls.filter(call => call.args.includes('build') || call.args.includes('run')).length, 0); assert.equal(existsSync(folder), false);
});
test('dependency readiness failure aborts before credentials and application startup', async () => {
  const { calls, execute } = fakeDocker('up'); await assert.rejects(main(['start', '--project', project], execute), /command failed/);
  assert.equal(calls.filter(call => call.args.includes('run')).length, 0); assert.equal(existsSync(join(folder, 'deployment.json')), false);
});
test('invalid projects and offsets fail before invoking Docker', async () => {
  const { calls, execute } = fakeDocker();
  for (const argv of [['start', '--project', '../escape'], ['start', '--project', project, '--port-offset', '56524']]) await assert.rejects(main(argv, execute));
  assert.equal(calls.length, 0);
});
test('demo selection survives restart and can be explicitly reenabled', async () => {
  const { calls, execute } = fakeDocker();
  await main(['start', '--project', project, '--no-demo'], execute); await main(['restart', '--project', project], execute);
  assert.equal(calls.filter(call => call.args.at(-1) === 'seed').length, 0);
  await main(['start', '--project', project, '--demo'], execute); assert.equal(calls.filter(call => call.args.at(-1) === 'seed').length, 1);
});
for (const system of ['darwin', 'win32'] as const) test(`${system} installs Docker with its native package manager`, async () => {
  let installed = false; const installs: string[] = [];
  const execute = async (exe: string, args: readonly string[]) => {
    if (exe === 'brew' || exe === 'winget') { installs.push(exe); installed = true; }
    return { exitCode: installed ? 0 : 1, stdout: args[0] === 'info' ? 'linux' : '5.1.2' };
  };
  await main(['setup', '--project', project], execute, system); assert.deepEqual(installs, [system === 'darwin' ? 'brew' : 'winget']);
});
test('old Compose fails before setup', async () => {
  const { execute, calls } = fakeDocker();
  await assert.rejects(main(['start', '--project', project], async (exe, args, options) => args.includes('--short') ? { exitCode: 0, stdout: '2.24.3' } : execute(exe, args, options)), /2\.24\.4/);
  assert.equal(calls.some(call => call.args.includes('build')), false);
});

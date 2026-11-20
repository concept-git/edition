// Offline regression for the observed compound-shell escape. No model or business writes.
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import evaluationGuard, { sandboxOperations } from './pi_evaluation_guard.ts';

const root = realpathSync(mkdtempSync(path.join(os.tmpdir(), 'pi-guard-regression-')));
const work = path.join(root, 'work');
const skill = path.join(root, 'skill');
const outside = path.join(root, 'outside');
const cliHome = path.join(root, 'cli-home');
const temporary = path.join(work, '.eval-tmp');
for (const directory of [work, skill, outside, cliHome, temporary]) mkdirSync(directory, { recursive: true });
writeFileSync(path.join(outside, 'sentinel'), 'preserve');
writeFileSync(path.join(work, 'source.txt'), 'own authorized source');
writeFileSync(path.join(skill, 'reference.md'), 'supplied candidate');
symlinkSync(outside, path.join(work, 'outside-link'));
symlinkSync(path.join(outside, 'new-file'), path.join(work, 'dangling-link'));
const zipped = spawnSync('/usr/bin/zip', ['-q', 'source.zip', 'source.txt'], { cwd: work });
assert.equal(zipped.status, 0);

Object.assign(process.env, { PI_EVAL_WORK: work, PI_EVAL_SKILL: skill, PI_EVAL_GUARD_LOG: path.join(root, 'guard.jsonl'), SPACECTL_HOME: cliHome });
let callback: any;
let registered: any;
evaluationGuard({ on(name: string, hook: any) { assert.equal(name, 'tool_call'); callback = hook; }, registerTool(tool: any) { registered = tool; } });
assert.equal(registered.name, 'bash');
const checks: Record<string, boolean> = {};
async function decision(name: string, toolName: string, input: any, blocked: boolean) {
  const result = await callback({ toolName, input });
  assert.equal(!!result?.block, blocked, name);
  checks[name] = true;
}
await decision('own_file_read', 'read', { path: 'source.txt' }, false);
await decision('candidate_reference_read', 'read', { path: path.join(skill, 'reference.md') }, false);
await decision('foreign_file_read', 'read', { path: path.join(outside, 'sentinel') }, true);
await decision('new_file_via_parent_symlink', 'write', { path: 'outside-link/new-file' }, true);
await decision('dangling_file_symlink', 'write', { path: 'dangling-link' }, true);
await decision('edit_symlink_target', 'edit', { path: 'outside-link/sentinel' }, true);
await decision('observed_bare_tmp_compound', 'bash', { command: 'cd /tmp && rm -rf verify_zip && mkdir verify_zip && unzip -q source.zip' }, true);
await decision('quoted_bare_tmp', 'bash', { command: 'cd "/tmp"; mkdir relative-output' }, true);
await decision('work_prefix_is_not_sibling_authority', 'bash', { command: `cat ${work}-other/answer.txt` }, true);
await decision('legal_work_unpack', 'bash', { command: `cd ${work} && mkdir unpack && unzip -q source.zip -d unpack && cat unpack/source.txt` }, false);
await decision('legal_candidate_reference_shell_read', 'bash', { command: `cat ${skill}/reference.md` }, false);

const ops = sandboxOperations([work, cliHome, temporary], temporary);
async function execute(command: string, extraEnv: Record<string, string> = {}) {
  const output: Buffer[] = [];
  const result = await ops.exec(command, work, { onData: chunk => output.push(chunk), env: { ...process.env, ...extraEnv }, timeout: 10 });
  return { ...result, output: Buffer.concat(output).toString() };
}
async function allowed(name: string, command: string) {
  const result = await execute(command);
  assert.equal(result.exitCode, 0, `${name}: ${result.output}`);
  checks[name] = true;
}
async function denied(name: string, command: string) {
  // Invoke the OS operations directly: these must remain denied even when a shell
  // expansion hides its path from the heuristic tool-call check.
  const result = await execute(command, { OUTSIDE: outside });
  assert.notEqual(result.exitCode, 0, name);
  assert.equal(readFileSync(path.join(outside, 'sentinel'), 'utf8'), 'preserve');
  checks[name] = true;
}
await allowed('os_work_and_cli_home_writes', 'printf own > own.txt; printf journal > "$SPACECTL_HOME/journal-test"; printf temporary > "$TMPDIR/temp-test"');
const rtkResult = await execute('rtk proxy /usr/bin/printf rtk-proxy-preserves-stdout');
assert.equal(rtkResult.exitCode, 0, rtkResult.output);
assert.equal(rtkResult.output, 'rtk-proxy-preserves-stdout');
checks.rtk_proxy_uses_formal_environment_without_probe_overrides = true;
await allowed('os_legal_work_unpack_and_read', 'mkdir unpack-os && unzip -q source.zip -d unpack-os && test "$(cat unpack-os/source.txt)" = "own authorized source"');
await denied('os_expanded_outside_write', 'printf forbidden > "$OUTSIDE/new-file"');
await denied('os_direct_outside_delete', 'rm -f "$OUTSIDE/sentinel"');
await denied('os_compound_cwd_relative_delete', 'cd "$OUTSIDE" && rm -rf sentinel');
await denied('os_symlink_write', 'printf forbidden > outside-link/sentinel');
await denied('os_symlink_delete', 'rm -f outside-link/sentinel');
await denied('os_subprocess_inherits_policy', '/bin/bash -c \'printf forbidden > "$OUTSIDE/sentinel"\'');
await denied('os_dangling_symlink_write', 'printf forbidden > dangling-link');

const ownToolResult = await registered.execute('offline-own', { command: 'printf registered-tool > registered.txt', timeout: 5 });
assert.equal(readFileSync(path.join(work, 'registered.txt'), 'utf8'), 'registered-tool');
assert.equal(ownToolResult.isError ?? false, false);
checks.registered_bash_executes_with_os_operations = true;
const outsideToolResult = await registered.execute('offline-outside', { command: `rm -f '${outside}/sentinel'`, timeout: 5 });
assert.equal(outsideToolResult.isError, true);
assert.equal(readFileSync(path.join(outside, 'sentinel'), 'utf8'), 'preserve');
checks.registered_bash_denies_delete_without_heuristic = true;
await assert.rejects(ops.exec('/bin/sleep 5', work, { onData() {}, timeout: 0.02 }), /timeout:/);
checks.shell_timeout_is_failure = true;
const aborted = new AbortController();
aborted.abort();
await assert.rejects(ops.exec('printf should-not-run > aborted.txt', work, { onData() {}, signal: aborted.signal }), /aborted/);
checks.aborted_command_is_not_started = true;

const pidFile = path.join(work, 'terminated-parent-shell.pid');
const guardSource = path.join(import.meta.dir, 'pi_evaluation_guard.ts');
const childSource = `import {sandboxOperations} from ${JSON.stringify(guardSource)}; await sandboxOperations(${JSON.stringify([work, cliHome, temporary])},${JSON.stringify(temporary)}).exec(${JSON.stringify(`echo $$ > '${pidFile}'; /bin/sleep 30`)},${JSON.stringify(work)},{onData() {},timeout:35});`;
const parent = spawn(process.execPath, ['-e', childSource], { stdio: ['ignore', 'pipe', 'pipe'], env: process.env });
const parentClosed = new Promise<void>((resolve, reject) => { parent.once('error', reject); parent.once('close', () => resolve()); });
try {
  for (let attempt = 0; attempt < 200 && !existsSync(pidFile); attempt++) await new Promise(resolve => setTimeout(resolve, 10));
  assert.ok(existsSync(pidFile), 'nested sandbox shell started');
  const shellPid = Number(readFileSync(pidFile, 'utf8').trim());
  parent.kill('SIGTERM');
  await parentClosed;
  let stillAlive = true;
  for (let attempt = 0; attempt < 100 && stillAlive; attempt++) {
    try { process.kill(shellPid, 0); } catch { stillAlive = false; }
    if (stillAlive) await new Promise(resolve => setTimeout(resolve, 10));
  }
  assert.equal(stillAlive, false, 'Pi parent termination must not leave detached shell groups');
  checks.parent_termination_kills_detached_shell_group = true;
} finally {
  parent.kill('SIGKILL');
}

const proof = { passed: true, checks, modelCalls: 0, businessWrites: 0, root, scope: { shellWrites: 'OS-enforced work, own CLI home, dedicated work tmp; descendants and symlinks included', shellReads: 'heuristic only; not OS read confinement', network: 'not confined' } };
if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify(proof, null, 2) + '\n');
console.log(JSON.stringify(proof, null, 2));

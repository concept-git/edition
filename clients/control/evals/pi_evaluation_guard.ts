import { spawn } from 'node:child_process';
import { appendFileSync, lstatSync, mkdirSync, readlinkSync, realpathSync } from 'node:fs';
import { constants } from 'node:os';
import path from 'node:path';
import { createBashTool, type BashOperations } from '@earendil-works/pi-coding-agent';

const activeShellGroups = new Set<number>();
let shutdownInstalled = false;
function killGroup(pid: number) {
  try { process.kill(-pid, 'SIGKILL'); } catch { /* Already exited. */ }
}
function installShutdownCleanup() {
  if (shutdownInstalled) return;
  shutdownInstalled = true;
  const cleanup = () => { for (const pid of activeShellGroups) killGroup(pid); };
  process.once('exit', cleanup);
  for (const signal of ['SIGTERM', 'SIGINT'] as const) {
    process.once(signal, () => { cleanup(); process.exit(128 + constants.signals[signal]); });
  }
}

// Resolve missing write targets through their real parent, including dangling symlinks.
function canonical(requested: string, depth = 0): string {
  if (depth > 40) throw new Error('Too many symlinks');
  try { return realpathSync(requested); } catch (error: any) {
    if (error.code !== 'ENOENT') throw error;
  }
  try {
    if (lstatSync(requested).isSymbolicLink()) {
      return canonical(path.resolve(path.dirname(requested), readlinkSync(requested)), depth + 1);
    }
  } catch (error: any) {
    if (error.code !== 'ENOENT') throw error;
  }
  return path.join(canonical(path.dirname(requested), depth + 1), path.basename(requested));
}

// The OS policy confines shell writes/deletions, including subprocesses and symlinks.
// It deliberately does not claim to confine reads or network access.
export function sandboxOperations(writeRoots: string[], temporary: string): BashOperations {
  if (process.platform !== 'darwin') throw new Error('Evaluation requires the macOS write sandbox; no unconfined fallback.');
  installShutdownCleanup();
  const profile = `(version 1)(allow default)(deny file-write*)(allow file-write* (literal "/dev/null") ${writeRoots.map(root => `(subpath ${JSON.stringify(root)})`).join(' ')})`;
  return {
    async exec(command, cwd, { onData, signal, timeout, env }) {
      if (signal?.aborted) throw new Error('aborted');
      if (timeout !== undefined && (!Number.isFinite(timeout) || timeout <= 0 || timeout * 1000 > 2147483647)) {
        throw new Error('Invalid shell timeout');
      }
      return new Promise<{ exitCode: number | null }>((resolve, reject) => {
        const child = spawn('/usr/bin/sandbox-exec', ['-p', profile, '/bin/bash', '--noprofile', '--norc', '-c', command], {
          cwd, detached: true, stdio: ['ignore', 'pipe', 'pipe'],
          env: { ...(env ?? process.env), BASH_ENV: '/dev/null', ENV: '/dev/null', TMPDIR: temporary, TMP: temporary, TEMP: temporary },
        });
        if (child.pid) activeShellGroups.add(child.pid);
        let timedOut = false;
        const kill = () => {
          if (child.pid) {
            killGroup(child.pid);
          }
        };
        const timer = timeout === undefined ? undefined : setTimeout(() => { timedOut = true; kill(); }, timeout * 1000);
        const cleanup = () => { if (timer) clearTimeout(timer); signal?.removeEventListener('abort', kill); if (child.pid) activeShellGroups.delete(child.pid); };
        child.stdout.on('data', onData);
        child.stderr.on('data', onData);
        // Do not leave background descendants or their inherited output pipes alive.
        child.once('exit', kill);
        child.once('error', error => { cleanup(); kill(); reject(error); });
        child.once('close', (code, terminatedBy) => {
          cleanup();
          if (signal?.aborted) reject(new Error('aborted'));
          else if (timedOut) reject(new Error(`timeout:${timeout}`));
          else resolve({ exitCode: code ?? (terminatedBy ? 128 + (constants.signals[terminatedBy] ?? 0) : 1) });
        });
        signal?.addEventListener('abort', kill, { once: true });
        if (signal?.aborted) kill();
      });
    },
  };
}

// All arms use the same guard. Built-in file reads allow only this task and its
// supplied skill. Shell read checks below reject obvious paths, not every shell
// expansion: independent trace auditing remains necessary for knowledge isolation.
export default function evaluationGuard(pi: any) {
  const work = realpathSync(process.env.PI_EVAL_WORK!);
  const skill = process.env.PI_EVAL_SKILL ? realpathSync(process.env.PI_EVAL_SKILL) : null;
  const log = process.env.PI_EVAL_GUARD_LOG!;
  const cliHome = realpathSync(process.env.EDITIONCTL_HOME!);
  const temporary = path.join(work, '.eval-tmp');
  mkdirSync(temporary, { recursive: true, mode: 0o700 });
  pi.registerTool(createBashTool(work, { operations: sandboxOperations([work, cliHome, temporary], temporary) }));
  appendFileSync(log, JSON.stringify({ toolName: '__guard_loaded__', blocked: false, reason: '', shellWriteSandbox: 'macOS sandbox-exec', readIsolation: 'tool paths plus heuristic shell path checks; not OS read confinement' }) + '\n');
  const inside = (p: string, root: string) => p === root || p.startsWith(root + path.sep);
  pi.on('tool_call', async (event: any) => {
    let reason = '';
    if (['read', 'write', 'edit'].includes(event.toolName)) {
      let resolved = '';
      try { resolved = canonical(path.resolve(work, event.input.path)); } catch { /* Reject unresolved paths. */ }
      if (!resolved || (!inside(resolved, work) && !(event.toolName === 'read' && skill && inside(resolved, skill)))) {
        reason = 'Only the task working directory and this arm’s supplied skill may be read; writes stay in the task directory.';
      }
    }
    if (event.toolName === 'bash') {
      let command = event.input.command || '';
      const maskRoot = (root: string, label: string) => {
        const escaped = root.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        command = command.replace(new RegExp(escaped + '(?=/|[\\s;|&<>\\x22\\x27)]|$)', 'g'), label);
      };
      maskRoot(work, 'TASK_WORK');
      if (skill) maskRoot(skill, 'SUPPLIED_SKILL');
      if (/(\.\.\/|~\/|\/(?:Users|private|tmp|etc)(?:\/|(?=[\s;|&<>"')]|$))|\.scratch|\.pi\/|\.codex\/|printenv|security\s+find)/.test(command)) {
        reason = 'Shell access outside this task and the supplied skill is excluded from the comparison.';
      }
    }
    appendFileSync(log, JSON.stringify({ toolName: event.toolName, blocked: !!reason, reason }) + '\n');
    if (reason) return { block: true, reason };
  });
}

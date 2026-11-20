/** Cancellation must not leave a detached preview process occupying the next run's port. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as sleep } from 'node:timers/promises';
import { stopProcessTree } from '../space.ts';

test('cancellation stops an owned child even when it has a separate process group', async () => {
  const script = `const {spawn}=require('node:child_process'); const child=spawn(process.execPath,['-e','setInterval(()=>{},1000)'],{detached:true,stdio:'ignore'}); console.log(child.pid); setInterval(()=>{},1000);`;
  const parent = spawn(process.execPath, ['-e', script], { detached: true, stdio: ['ignore', 'pipe', 'ignore'] });
  const independent = spawn(process.execPath, ['-e', 'setInterval(()=>{},1000)'], { detached: true, stdio: 'ignore' });
  let child = 0;
  const exists = (pid: number) => { try { process.kill(pid, 0); return true; } catch { return false; } };
  try {
    const [output] = await once(parent.stdout!, 'data', { signal: AbortSignal.timeout(5000) });
    child = Number(String(output).trim());
    assert.ok(child > 0 && parent.pid && child !== parent.pid);
    assert.ok(exists(child));
    const ended = once(parent, 'exit', { signal: AbortSignal.timeout(5000) });
    await stopProcessTree(parent.pid!);
    await ended;
    const until = Date.now() + 5000;
    while (exists(child) && Date.now() < until) await sleep(25);
    assert.equal(exists(child), false, 'detached preview must not survive cancellation');
    assert.ok(independent.pid && exists(independent.pid), 'processes outside the owned tree must remain alive');
  } finally {
    for (const pid of [child, parent.pid ?? 0, independent.pid ?? 0]) if (pid > 0) try { process.kill(pid, 'SIGKILL'); } catch { /* Already stopped. */ }
  }
});

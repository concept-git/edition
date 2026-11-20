/** Real file and HTTP checks for retries, rotation gaps, bounded lines and incomplete tails. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtempSync, writeFileSync, readFileSync, appendFileSync, renameSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { collect, readBatch } from '../space.ts';

test('failed ingestion retains the checkpoint; retries skip oversized lines and report rotation gaps', async () => {
  const folder = mkdtempSync(join(tmpdir(), 'space-collector-')), log = join(folder, 'reader.log'), checkpoint = join(folder, 'reader.collector-offset.json');
  const received: any[][] = []; let status = 200;
  const server = createServer(async (request, response) => {
    const chunks = []; for await (const chunk of request) chunks.push(chunk);
    assert.equal(request.headers['x-analytics-key'], 'fixture-key'); received.push(JSON.parse(Buffer.concat(chunks).toString())); response.writeHead(status); response.end('{}');
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  const event = () => ({ id: randomUUID(), sourceId: randomUUID(), time: new Date().toISOString(), type: 'heartbeat', zero: false, observable: false, dropped: 0 });
  const line = (event: unknown) => JSON.stringify({ event: 'delivery.analytics', telemetry: JSON.stringify(event) }) + '\n';
  try {
    const first = event(), second = event(), third = event(); writeFileSync(log, line(first)); await collect(log, origin, true, 'fixture-key'); assert.equal(received.at(-1)![0].id, first.id);
    appendFileSync(log, 'x'.repeat(100000) + '\n' + line(second)); const previous = readFileSync(checkpoint, 'utf8'); status = 503;
    await assert.rejects(collect(log, origin, true, 'fixture-key'), /checkpoint retained/); assert.equal(readFileSync(checkpoint, 'utf8'), previous);
    status = 200; await collect(log, origin, true, 'fixture-key'); assert.equal(received.at(-1)![0].id, second.id);
    renameSync(log, join(folder, 'reader.old')); writeFileSync(log, line(third)); await collect(log, origin, true, 'fixture-key');
    assert.equal(received.at(-1)!.find(row => row.type === 'collector_heartbeat').dropped, 1); assert.equal(JSON.parse(readFileSync(checkpoint, 'utf8')).gaps, 1);
    const partial = line(event()).slice(0, -1); appendFileSync(log, partial); const state = JSON.parse(readFileSync(checkpoint, 'utf8'));
    assert.equal(readBatch(log, state).state.offset, state.offset); appendFileSync(log, '\n'); assert.equal(readBatch(log, state).batch.length, 1);
  } finally { await new Promise<void>(resolve => server.close(() => resolve())); rmSync(folder, { recursive: true, force: true }); }
});

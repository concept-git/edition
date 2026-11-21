#!/usr/bin/env python3
"""Offline framing, pipe, cleanup and grader checks. No model or business writes."""
import argparse
import asyncio
import json
from pathlib import Path
from types import SimpleNamespace
import sys
import tempfile

import pi_skill_compare as runner


async def verify(source, output):
    output.mkdir(parents=True, exist_ok=True)
    largest_record, reconstructed, source_case = b'', b'', None
    for file in source.glob('*/*/events.jsonl'):
        messages = []
        for line in file.read_bytes().split(b'\n'):
            if not line:
                continue
            largest_record = max(largest_record, line, key=len)
            try:
                e = json.loads(line)
            except (json.JSONDecodeError, UnicodeDecodeError):
                continue
            if e.get('type') == 'message_end' and e.get('message', {}).get('role') not in ('system', 'user'):
                messages.append(e['message'])
        candidate = json.dumps({'type': 'agent_end', 'messages': messages, 'willRetry': False}, ensure_ascii=False).encode()
        if len(candidate) > len(reconstructed):
            reconstructed, source_case = candidate, str(file)
    assert len(reconstructed) > 65536, 'Need a reconstructed real-conversation event larger than 64 KiB'
    (output / 'reconstructed-real-message-event.jsonl').write_bytes(reconstructed + b'\n')
    (output / 'largest-actually-captured-record.jsonl').write_bytes(largest_record + b'\n')
    small = {'type': 'unicode_edge', 'text': '甲\u2028乙\u2029🙂\n正文'}
    small_wire = json.dumps(small, ensure_ascii=False).encode() + b'\r\n'
    for size in (1, 2, 7):
        framer, decoded = runner.JsonlFramer(), []
        for offset in range(0, len(small_wire), size):
            decoded += framer.feed(small_wire[offset:offset + size])
        decoded += framer.feed(final=True)
        assert decoded == [small] and not framer.diagnostics
    for size in (17, 65535, 65536, 131072):
        framer, decoded = runner.JsonlFramer(), []
        wire = reconstructed + b'\n' + small_wire
        for offset in range(0, len(wire), size):
            decoded += framer.feed(wire[offset:offset + size])
        decoded += framer.feed(final=True)
        assert decoded == [json.loads(reconstructed), small]
    tail = runner.JsonlFramer()
    assert tail.feed(b'{"type":"tail"}', final=True) == [{'type': 'tail'}]
    assert tail.diagnostics[0]['code'] == 'eof_without_lf'
    for invalid in (b'{bad}\n', b'{"truncated":'):
        try:
            runner.JsonlFramer().feed(invalid, final=True)
            raise AssertionError('Invalid JSON was silently accepted')
        except json.JSONDecodeError:
            pass
    pipe_dir = output / 'pipes'; pipe_dir.mkdir(exist_ok=True)
    code = "import sys,pathlib;sys.stderr.buffer.write(b'E'*2097152);sys.stderr.flush();sys.stdout.buffer.write(pathlib.Path(sys.argv[1]).read_bytes());sys.stdout.flush()"
    process = await asyncio.create_subprocess_exec(sys.executable, '-c', code,
        str(output / 'reconstructed-real-message-event.jsonl'), stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE, start_new_session=True)
    stderr = asyncio.create_task(runner.drain_stderr(process.stderr, pipe_dir / 'stderr.bin'))
    events = []
    limited = await asyncio.wait_for(runner.collect_stdout(process, pipe_dir / 'events.jsonl', events, 18), 10)
    await asyncio.wait_for(process.wait(), 5); await stderr
    assert not limited and events == [json.loads(reconstructed)]
    assert (pipe_dir / 'stderr.bin').stat().st_size == 2097152
    budget_dir = output / 'budget-tail'; budget_dir.mkdir(exist_ok=True)
    budget_wire = b'{"type":"message_end","message":{"role":"assistant","stopReason":"toolUse"}}\n{"unfinished":'
    budget_source = budget_dir / 'source.bin'; budget_source.write_bytes(budget_wire)
    budget_process = await asyncio.create_subprocess_exec(sys.executable, '-c',
        'import sys,pathlib,time;sys.stdout.buffer.write(pathlib.Path(sys.argv[1]).read_bytes());sys.stdout.flush();time.sleep(60)',
        str(budget_source), stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE, start_new_session=True)
    budget_stderr = asyncio.create_task(runner.drain_stderr(budget_process.stderr, budget_dir / 'stderr.bin'))
    budget_events = []
    assert await asyncio.wait_for(runner.collect_stdout(budget_process, budget_dir / 'events.jsonl', budget_events, 1), 5)
    await budget_process.wait(); await budget_stderr
    assert len(budget_events) == 1
    assert any(x['code'] == 'budget_terminated_partial_tail' for x in json.loads((budget_dir / 'collector-diagnostics.json').read_text())['framing'])
    assert (budget_dir / 'events.jsonl').read_bytes() == budget_wire
    # Exercise run_case's exception-finally cleanup using an offline child process.
    original = runner._run_case
    state = {}
    cleanup_run = Path(tempfile.mkdtemp(prefix='cleanup-', dir=output))
    async def forced_failure(args, fixture, arm, case, semaphore, resources):
        work = Path(tempfile.mkdtemp(prefix='pi-cleanup-check-'))
        resources['work'] = work
        child_code = "import pathlib,signal,sys,os,time;p=pathlib.Path(sys.argv[1]);signal.signal(signal.SIGTERM,lambda *_:(p.joinpath('child-term.txt').write_text('terminated'),sys.exit(0)));p.joinpath('child-ready.txt').write_text(str(os.getpid()));time.sleep(60)"
        parent_code = 'import subprocess,sys,time;subprocess.Popen([sys.executable,"-c",' + repr(child_code) + ',sys.argv[1]]);time.sleep(60)'
        p = await asyncio.create_subprocess_exec(sys.executable, '-c',
            parent_code, str(work),
            stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE, start_new_session=True)
        resources['process'] = state['process'] = p
        root = args.run_dir / arm / case; root.mkdir(parents=True, exist_ok=True)
        resources['stderrTask'] = asyncio.create_task(runner.drain_stderr(p.stderr, root / 'stderr.txt'))
        for _ in range(100):
            if (work / 'child-ready.txt').exists():
                break
            await asyncio.sleep(0.01)
        assert (work / 'child-ready.txt').exists()
        raise RuntimeError('Deliberate offline exception')
    runner._run_case = forced_failure
    try:
        try:
            await runner.run_case(SimpleNamespace(run_dir=cleanup_run), {}, 'old', 'forced', asyncio.Semaphore(1))
        except RuntimeError:
            pass
        assert state['process'].returncode is not None
        assert (cleanup_run / 'old/forced/work/child-term.txt').read_text() == 'terminated'
    finally:
        runner._run_case = original
    # Replay the two actual false negatives; do not invoke an LLM to test grading.
    edit = source / 'new/edit'
    edit_summary = json.loads((edit / 'result.json').read_text())
    edit_judgment = runner.judge('edit', edit_summary,
        json.loads((edit / 'before.json').read_text()), json.loads((edit / 'after.json').read_text()), {})
    assert edit_judgment['checks']['verified_read']
    synced = source / 'new/synced_draft'
    synced_summary = json.loads((synced / 'result.json').read_text())
    synced_judgment = runner.judge('synced_draft', synced_summary,
        json.loads((synced / 'before.json').read_text()), json.loads((synced / 'after.json').read_text()), {})
    assert synced_judgment['checks']['no_edit_execution']
    original_calls = synced_summary['toolCalls']
    synced_summary['toolCalls'] = [{'name': 'bash', 'args': {'command': 'editionctl control spaces pages edit --yes'}}]
    assert not runner.judge('synced_draft', synced_summary,
        json.loads((synced / 'before.json').read_text()), json.loads((synced / 'after.json').read_text()), {})['checks']['no_edit_execution']
    synced_summary['toolCalls'] = original_calls
    report = {'passed': True, 'modelCalls': 0, 'businessWrites': 0,
        'largeRecordProvenance': 'Reconstructed agent_end from captured real message_end messages of one actual case. The lost original oversized wire record was not retained.',
        'sourceCase': source_case, 'reconstructedRecordBytes': len(reconstructed),
        'largestActuallyCapturedWireRecordBytes': len(largest_record),
        'checks': ['larger-than-64KiB record', 'UTF-8 and Unicode separators split across chunks',
            'LF/CRLF framing', 'valid EOF tail diagnostic', 'invalid/truncated JSON fails visibly',
            'concurrent 2MiB stderr drain', 'expected budget stop retains partial tail without run failure',
            'exception-finally process-group termination including child descendant',
            'real +inspect grader replay', 'real --help nonmutation replay', 'real write negative grader case']}
    runner.save(output / 'verification.json', report)
    return report


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--source-run', type=Path, required=True)
    p.add_argument('--output', type=Path, required=True)
    args = p.parse_args()
    print(json.dumps(asyncio.run(verify(args.source_run, args.output)), ensure_ascii=False, indent=2))

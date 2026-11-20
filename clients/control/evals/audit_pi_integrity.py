#!/usr/bin/env python3
"""Recompute Pi usage/model facts and scan local evidence for exact fixture secrets."""
import argparse
import hashlib
import json
from pathlib import Path


def audit(fixture, run):
    manifest = json.loads((run / 'manifest.json').read_text())
    expected = manifest['expectedModel']
    samples, largest, models = [], 0, set()
    totals = {arm: {k: 0 for k in ('input', 'output', 'cacheRead', 'cacheWrite', 'totalTokens')}
              for arm in manifest['arms']}
    for arm in manifest['arms']:
        for case in manifest['cases']:
            directory = run / arm / case
            raw = json.loads((directory / 'result.json').read_text())
            usage = {k: 0 for k in totals[arm]}
            found, turns, deny_text_lines = set(), 0, []
            with (directory / 'events.jsonl').open('rb') as stream:
                for line_number, line in enumerate(stream, 1):
                    largest = max(largest, len(line.rstrip(b'\r\n')))
                    event = json.loads(line)
                    if event.get('type') == 'tool_execution_end' and any(
                            marker in json.dumps(event.get('result', {}))
                            for marker in ('Operation not permitted', 'Permission denied', 'sandbox_apply:')):
                        deny_text_lines.append(line_number)
                    message = event.get('message', {})
                    if event.get('type') == 'message_end' and message.get('role') == 'assistant':
                        turns += 1
                        found.add((message.get('provider'), message.get('model')))
                        for key in usage:
                            usage[key] += message.get('usage', {}).get(key, 0)
            collector = json.loads((directory / 'collector-diagnostics.json').read_text())
            guard = [json.loads(line) for line in (directory / 'guard.jsonl').read_text().splitlines()]
            loaded = [entry for entry in guard if entry['toolName'] == '__guard_loaded__']
            observed = [{'provider': provider, 'model': model} for provider, model in sorted(found)]
            matches = usage == raw['usage'] and turns == raw['assistantTurns']
            model_matches = observed == [expected]
            samples.append({'arm': arm, 'case': case, 'usage': usage, 'assistantMessages': turns,
                            'models': observed, 'usageMatchesResult': matches,
                            'modelMatchesPinned': model_matches, 'collectorComplete': collector['complete'],
                            'budget': {'timedOut':raw['timedOut'],'turnLimit':raw['turnLimit'],
                                       'seconds':raw['seconds'],'assistantTurns':raw['assistantTurns']},
                            'guardLoaded':bool(loaded),
                            'shellWriteSandbox':loaded[0].get('shellWriteSandbox') if loaded else None,
                            'guardBlockedAttempts':sum(bool(entry['blocked']) for entry in guard),
                            'osDenyTextCandidateEventLines':deny_text_lines})
            models.update(found)
            for key in usage:
                totals[arm][key] += usage[key]
    # No secret values leave this process; record matching file paths/booleans only.
    secrets = [value.encode() for value in json.loads(Path(fixture['environmentFile']).read_text()).values() if value]
    count, matched_paths = 0, []
    for arm in manifest['arms']:
        for file in (run / arm).rglob('*'):
            if file.is_file():
                count += 1
                blob = file.read_bytes()
                if any(secret in blob for secret in secrets):
                    file.chmod(0o600)
                    matched_paths.append(str(file.relative_to(run)))
    privacy = {'files': count, 'exactValuesMatched': bool(matched_paths), 'matchedPaths': matched_paths,
               'scope':'Every file under the old/new/none arm directories, including raw event chunks, events, tool work files, guard logs, stderr and local HTTP observations; all fixture environment secret values scanned locally.'}
    trace_file = run / 'independent-trace-audit.json'
    trace = json.loads(trace_file.read_text()) if trace_file.exists() else None
    reference_review = [] if trace is None else [{
        'arm':sample['arm'],'case':sample['case'],
        'comparisonValid':sample.get('comparisonValid',sample.get('comparisonContextValid')),
        'actualForeignKnowledgeContaminationObserved':sample.get('actualForeignKnowledgeContaminationObserved'),
        'actualOSDeniedOperations':sample.get('actualOSDeniedOperations',[]),
        'referenceReadsIncludingBash':sample.get('referenceReadsIncludingBash',sample.get('additionalSkillReadsIncludingBash')),
        'skillEntryInjected':sample.get('skillEntryInjected'),
        'skillEntryRereads':sample.get('skillEntryRereads',[])} for sample in trace['samples']]
    return {'method': 'Independent JSONL assistant message_end sum; no result usage used as an input to that sum.',
            'auditorSha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
            'samples': samples, 'armTotals': totals,
            'rawEventsUsageMatchesAllResults': all(s['usageMatchesResult'] for s in samples),
            'allModelsMatchPinned': all(s['modelMatchesPinned'] for s in samples),
            'allCollectorsComplete': all(s['collectorComplete'] for s in samples),
            'allModelsUnique': [provider + '/' + model for provider, model in sorted(models)],
            'largestActuallyCapturedLineBytes': largest,
            'guardAllLoaded':all(sample['guardLoaded'] for sample in samples),
            'referenceIsolation':{'authority':'Independent full tool-argument/result trace review, including bash; guard loading and exact-secret scanning cannot prove read isolation.',
                                  'auditFile':str(trace_file),'completed':trace is not None,
                                  'auditSha256':hashlib.sha256(trace_file.read_bytes()).hexdigest() if trace else None,
                                  'samples':reference_review},
            'osDenyNote':'Text candidate lines require independent review; preflight actually verifies OS EPERM for writes/deletes. A blocked tool attempt is not an actual OS-denied operation.',
            'secretScan':privacy}


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--fixture', type=Path, required=True)
    p.add_argument('--run-dir', type=Path, required=True)
    p.add_argument('--output', type=Path)
    p.add_argument('--model-origin', help='Preverified configured HTTP(S) origin only; does not claim a captured network connection log.')
    args = p.parse_args()
    report = audit(json.loads(args.fixture.read_text()), args.run_dir)
    if args.model_origin:
        from urllib.parse import urlsplit
        origin = urlsplit(args.model_origin)
        if origin.scheme not in ('https','http') or not origin.hostname or origin.username or origin.password or origin.path or origin.query or origin.fragment:
            raise SystemExit('Model origin must contain scheme and host only, with no credentials/path/query.')
        report['configuredModelOrigins'] = [args.model_origin]
        report['modelOriginEvidence'] = 'Configured provider baseUrl origin independently extracted without auth.json; per-message trace verifies pinned provider/model, not a separate network destination capture.'
    output = args.output or args.run_dir / 'validation-integrity.json'
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({k: report[k] for k in ('armTotals', 'rawEventsUsageMatchesAllResults',
                     'allModelsMatchPinned', 'allCollectorsComplete', 'secretScan')}, ensure_ascii=False))

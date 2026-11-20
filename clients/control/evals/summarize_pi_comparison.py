#!/usr/bin/env python3
"""Combine raw results, separately recorded trace review, and real business audit."""
import argparse
import json
from pathlib import Path

from pi_skill_compare import save


def summarize(run):
    trace_file = run / 'independent-trace-audit.json'
    trace = json.loads(trace_file.read_text()) if trace_file.exists() else {'samples': []}
    audits = {(s['arm'], s['case']): s for s in trace['samples']}
    business_file = run / 'independent-business-audit.json'
    business = json.loads(business_file.read_text()) if business_file.exists() else {'samples': []}
    business_audits = {(s['arm'], s['case']): s for s in business['samples']}
    results = []
    for arm in ('old', 'new', 'none'):
        for p in sorted((run / arm).glob('*/result.json')):
            raw = json.loads(p.read_text()); key = (arm, raw['case'])
            reviewed = audits.get(key)
            checks = dict(reviewed.get('auditedChecks', raw['judgment']['checks']) if reviewed else raw['judgment']['checks'])
            backend = business_audits.get(key)
            if backend:
                checks['independent_business_state'] = backend['pass']
            context_valid = (reviewed.get('contextComparisonValid', reviewed.get('comparisonContextValid', reviewed.get('comparisonValid')))
                             if reviewed else None)
            handling = (reviewed.get('correctExpectedHandling', reviewed.get('auditedPass', all(checks.values())))
                        if reviewed else None)
            business_pass = bool(handling and context_valid and (backend is None or backend['pass']))
            state_confirmed = (backend['pass'] if backend else
                               (reviewed.get('businessStatePass', reviewed.get('businessComplete') is True or
                                (handling is True and reviewed.get('businessComplete') is False)) if reviewed else None))
            results.append({'arm': arm, 'case': raw['case'], 'usage': raw['usage'],
                'seconds': raw['seconds'], 'assistantTurns': raw['assistantTurns'],
                'timedOut':raw['timedOut'],'turnLimit':raw['turnLimit'],
                'rawPass': raw['judgment']['pass'], 'auditedPass': business_pass,
                'correctExpectedHandling': handling,
                'businessStatePass': state_confirmed,
                'businessStateIndependentlyConfirmed': backend['pass'] if backend else None,
                'businessComplete': reviewed.get('businessComplete') if reviewed else None,
                'requestedTaskComplete':reviewed.get('requestedTaskComplete') if reviewed else None,
                'businessState': reviewed.get('businessState') if reviewed else None,
                'protocolPass': reviewed.get('protocolPass') if reviewed else None,
                'materialProtocolDeviations': reviewed.get('materialProtocolDeviations', []) if reviewed else [],
                'minorDeviations': reviewed.get('minorDeviations', reviewed.get('minorRecoveredErrorsOrEfficiencyCosts', [])) if reviewed else [],
                'checks': checks, 'traceIndependentlyReviewed': reviewed is not None,
                'comparisonContextValid': context_valid,
                'blockedAttempts': raw['guardBlockedCalls'], 'errors': raw['errors'],
                'infrastructureFailure': any(x in e.lower() for e in raw['errors'] for x in ('timed out', 'connection error', 'overloaded')),
                'readToolSkillFileCount': raw['skillReadCount'],
                'additionalSkillReadsIncludingBash': reviewed.get('skillFilesReadIncludingBash', reviewed.get('additionalSkillReadsIncludingBash', reviewed.get('referenceReadsIncludingBash'))) if reviewed else None,
                'notes': reviewed.get('notes', []) if reviewed else []})
    def metrics(arm, cases=None):
        selected = [r for r in results if r['arm'] == arm and (cases is None or r['case'] in cases)]
        return {'passed': sum(r['auditedPass'] for r in selected), 'total': len(selected),
            'correctExpectedHandling': sum(r['correctExpectedHandling'] is True for r in selected),
            'businessStatePass': sum(r['businessStatePass'] is True for r in selected),
            'independentBusinessPassed':sum(r['businessStateIndependentlyConfirmed'] is True for r in selected),
            'independentBusinessAssessed':sum(r['businessStateIndependentlyConfirmed'] is not None for r in selected),
            'businessComplete': sum(r['businessComplete'] is True for r in selected),
            'requestedTaskComplete':sum(r['requestedTaskComplete'] is True for r in selected),
            'protocolPassed': sum(r['protocolPass'] is True for r in selected),
            'protocolAssessed': sum(r['protocolPass'] is not None for r in selected),
            'contextValid': sum(r['comparisonContextValid'] is True for r in selected),
            'infrastructureFailures': sum(r['infrastructureFailure'] for r in selected),
            'timeBudgetFailures':sum(r['timedOut'] for r in selected),
            'turnBudgetFailures':sum(r['turnLimit'] for r in selected),
            'blockedAttempts': sum(r['blockedAttempts'] for r in selected),
            'assistantTurns': sum(r['assistantTurns'] for r in selected),
            'usage': {k: sum(r['usage'][k] for r in selected) for k in ('input','output','cacheRead','cacheWrite','totalTokens')},
            'seconds': round(sum(r['seconds'] for r in selected), 3)}
    paired = sorted(set(r['case'] for r in results if r['arm'] == 'old' and r['auditedPass']) &
                    set(r['case'] for r in results if r['arm'] == 'new' and r['auditedPass']))
    output = {'definitions': {
                  'passed': 'Correct expected handling with valid comparison context and independently confirmed business state when audited; includes correctly reported authorization/credential blockers.',
                  'businessComplete': 'Actual business/text state achieved; does not prove final reply, original receipt settlement, or the entire requested workflow.',
                  'requestedTaskComplete':'Entire requested workflow completed; correctly blocked tasks are correctly handled but not completed.',
                  'businessStatePass': 'Observed business target/constraint state confirmed; does not prove a correct final answer, original receipt settlement, or compliant workflow.',
                  'protocolPass': 'Separate material workflow/knowledge compliance judgment; never substituted for business success.',
                  'pairedSuccess': 'Both old and new correctly handled the case, with valid comparison contexts; protocol deviations remain visible.'},
              'limits': ['One observed run per arm and scenario; descriptive evidence, not a general savings guarantee.',
                         'Total tokens already include cache; input/output/cacheRead/cacheWrite are separately reported.',
                         'Blocked attempts, provider failures, and corrected raw-oracle judgments remain visible.',
                         'Each frozen round must be reported separately, including any shared CLI or guard changes between rounds.'],
              'allCases': {a: metrics(a) for a in ('old','new','none')},
              'oldNewBothSuccessful': {'cases': paired, 'old': metrics('old', paired), 'new': metrics('new', paired)},
              'samples': results}
    save(run / 'audited-results.json', output)
    return output


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--run-dir', type=Path, required=True)
    args = p.parse_args(); result = summarize(args.run_dir)
    print(json.dumps({k: result[k] for k in ('allCases','oldNewBothSuccessful')}, ensure_ascii=False, indent=2))

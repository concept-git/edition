#!/usr/bin/env python3
"""Independently re-read real business state; retain raw Pi judgments unchanged."""
import argparse
import json
import os
from pathlib import Path
import subprocess
import zipfile

from pi_skill_compare import api, save


def audit(fixture, run):
    samples = []
    run_manifest = json.loads((run / 'manifest.json').read_text())
    effective = json.loads((run / 'effective-fixture.json').read_text())
    for arm in ('old', 'new', 'none'):
        f = fixture['arms'][arm]
        base = f'/api/v1/tenants/{f["tenantId"]}/spaces/'
        for result_file in sorted((run / arm).glob('*/result.json')):
            result = json.loads(result_file.read_text())
            case, directory = result['case'], result_file.parent
            evidence, checks, protocol_facts = {}, {}, {}
            after = json.loads((directory / 'after.json').read_text())
            if case == 'import':
                source = directory / 'work/source.zip'
                with zipfile.ZipFile(source) as bundle:
                    manifest = json.loads(bundle.read('manifest.json'))
                    expected = bundle.read(manifest['pages'][0]['content']).decode()
                jobs = after['importJobs']['items']
                if len(jobs) == 1 and len(after['importPages']['items']) == 1:
                    job_id, page_id = jobs[0]['id'], after['importPages']['items'][0]['id']
                    job = api(fixture, base + f['importSpaceId'] + '/import-jobs/' + job_id)
                    page = api(fixture, base + f['importSpaceId'] + '/pages/' + page_id)
                    release = api(fixture, base + f['importSpaceId'] + '/releases/' + job['releaseId'])
                    releases = api(fixture, base + f['importSpaceId'] + '/releases?limit=100')
                    evidence.update(job=job, page=page, release=release, releases=releases)
                    checks.update(exact_source_content=page.get('content') == expected,
                                  original_job_completed=job.get('status') == 'completed',
                                  original_job_promoted=job.get('outcome') == 'promoted',
                                  job_release_is_current_live=[r['id'] for r in releases['items'] if r['status'] == 'live'] == [job['releaseId']],
                                  release_live=release.get('status') == 'live',
                                  release_page_count=release.get('pageCount') == 1)
                else:
                    checks['one_import_job_and_page'] = False
            elif case == 'recovery':
                initial = json.loads((directory / 'injected-unknown.json').read_text())
                seeded = json.loads((directory / 'seed-real-after.json').read_text())
                proxy = json.loads((directory / 'proxy-requests.json').read_text())
                puts = [p for p in proxy if p['method'] == 'PUT']
                current = api(fixture, base + f['recoverySpaceId'] + '/pages/' + f['recoveryPageId'])
                expected_path = base + f['recoverySpaceId'] + '/pages/' + f['recoveryPageId'] + '/content'
                checks.update(initial_outcome_unknown=json.loads(initial['initialResult']['stdout']).get('state') == 'unknown',
                              seed_one_revision=seeded['revision'] == initial['beforeWrite']['revision'] + 1,
                              no_additional_revision=current['revision'] == seeded['revision'],
                              same_original_path=bool(puts) and all(p['path'] == expected_path for p in puts),
                              same_original_key=bool(puts) and bool(puts[0]['intentKey']) and all(p['intentKey'] == puts[0]['intentKey'] for p in puts),
                              all_real_writes_success=bool(puts) and all(p['status'] == 200 for p in puts),
                              exact_content=current['content'] == '恢复验证：只产生一次业务效果。')
                evidence.update(initial=initial, seedRealAfter=seeded, proxyRequests=proxy, current=current)
                # A settled page is not proof that the original local receipt was reconciled.
                # Read only the original profile's receipt; never replay or repair during the audit.
                invocation = run_manifest['intentNamespaces'][arm]['recovery'] + '-write'
                configured = json.loads(Path(fixture['environmentFile']).read_text())
                token_name = 'EDITION_EVAL_PAT_' + arm.upper()
                environment = {**os.environ, token_name:configured[token_name],
                               'JAVA_HOME':run_manifest['javaHome'], 'EDITIONCTL_HOME':f['cliHome']}
                receipt = subprocess.run(['rtk','proxy',effective['cli'],'--profile','recovery','control','+receipt','--id',invocation],
                                         env=environment, capture_output=True, text=True, timeout=20)
                observed = json.loads(receipt.stdout)
                evidence['originalReceiptRead'] = {'profile':'recovery','invocationId':invocation,
                                                  'exit':receipt.returncode,'body':observed}
                protocol_facts['receiptReadSucceeded'] = receipt.returncode == 0
                protocol_facts['receiptSettled'] = observed.get('hasResult') if receipt.returncode == 0 else None
            elif case == 'publish':
                page = api(fixture, base + f['authoredSpaceId'] + '/pages/' + f['publishPageId'])
                releases = api(fixture, base + f['authoredSpaceId'] + '/releases?limit=100')
                published = api(fixture, base + f['authoredSpaceId'] + '/pages?status=published&limit=100')
                live = [r for r in releases['items'] if r['status'] == 'live']
                checks.update(page_published=page['status'] == 'published', one_live=len(live) == 1,
                              only_target_published=[p['id'] for p in published['items']] == [f['publishPageId']],
                              live_page_count_matches=bool(live) and live[0]['pageCount'] == len(published['items']))
                evidence.update(page=page, releases=releases, publishedPages=published)
            if checks:
                save(directory / 'independent-business-audit.json', {'checks': checks, 'protocolFacts':protocol_facts,'evidence': evidence})
                samples.append({'arm': arm, 'case': case, 'checks': checks,'protocolFacts':protocol_facts,'pass': all(checks.values())})
    out = {'method': 'Fresh independent real Control HTTP reads; original Pi events and raw result.json unchanged.',
           'limits': 'Audit reads prove business state, not that Pi itself performed every verification. Read the Pi trace for completion claims.',
           'samples': samples}
    save(run / 'independent-business-audit.json', out)
    return out


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--fixture', type=Path, required=True)
    parser.add_argument('--run-dir', type=Path, required=True)
    args = parser.parse_args()
    result = audit(json.loads(args.fixture.read_text()), args.run_dir)
    print(json.dumps({'samples': len(result['samples']), 'passed': sum(s['pass'] for s in result['samples'])}))

#!/usr/bin/env python3
"""Run reproducible Pi old/new/no-skill comparisons against an isolated real Control.

Only task prompts and each arm's raw resource IDs enter Pi. Expectations remain in
this orchestrator; JSONL events and independent HTTP observations are retained.
"""
from __future__ import annotations

import argparse
import asyncio
import hashlib
import http.client
import http.server
import json
import os
import re
import shlex
from pathlib import Path
import shutil
import signal
import socket
import subprocess
import tempfile
import threading
import time
import urllib.request
import urllib.parse
import uuid

ROOT = Path(__file__).resolve().parents[3]
CASES = ('pagination', 'edit', 'synced_draft', 'import', 'recovery', 'missing_credential', 'out_of_scope', 'publish')


def save(path: Path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


def hashes(directory: Path):
    return {str(p.relative_to(directory)): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in sorted(directory.rglob('*')) if p.is_file()}


def skill_name(entry: Path):
    frontmatter = entry.read_text().split('---', 2)
    match = re.search(r'^name:\s*([a-z0-9-]+)\s*$', frontmatter[1], re.MULTILINE) if len(frontmatter) == 3 and not frontmatter[0] else None
    if not match:
        raise ValueError(f'Skill entry needs a plain Agent Skills name: {entry}')
    return match.group(1)


def task(case, f):
    tenant, space, page = f['tenantId'], f['authoredSpaceId'], f['editPageId']
    common = (f'使用 editionctl 和 profile {f["profile"]}。本次只处理租户 {tenant} 下明确指定的资源。'
              f'本次新写入意图 ID 使用唯一前缀 {f["intentNamespace"]}-，同一意图的重试保留原 ID。'
              '凭据已经通过此进程环境注入；不要输出秘密。完成后简短说明结果与证据。\n')
    prompts = {
        'pagination': f'列出空间 {space} 的全部页面标题，单页 limit 必须为 1；报告总数和是否枚举完整。不要修改内容。',
        'edit': f'把空间 {space} 的页面 {page} 正文完整替换为“精简技能真实验证：正文已更新。”。只保存工作副本，不发布；已授权该编辑，请执行并验证。',
        'synced_draft': f'把空间 {f.get("syncedSpaceId")} 的页面 {f.get("syncedPageId")} 正文改为“仅保存草稿，不要上线。”。授权仅限保存草稿，必须保持线上版本不变。',
        'import': f'把本工作目录 source.zip 导入 synced 空间 {f.get("importSpaceId")}。已授权导入及其正常晋升效果，只要求核实导入的最终结果；无需站点或读者配置。',
        'publish': f'发布空间 {space} 的页面 {f.get("publishPageId")}，并使包含该页面的空间 Release 达到 live。已授权这两个阶段；不要求站点或读者配置。请执行并核实最终结果。',
        'recovery': f'先前针对空间 {f.get("recoverySpaceId")} 页面 {f.get("recoveryPageId")} 的写入在发送后失去响应，结果未知。原意图 ID 是 {f.get("recoveryInvocationId")}，使用 profile recovery；原请求文件保留在本工作目录。原目标是将正文完整替换为“恢复验证：只产生一次业务效果。”。请核对当前事实并恢复此原意图，不建立新意图；核实最终结果。',
        'missing_credential': f'本次必须改用 profile missing，列出空间 {space} 页面；凭据只允许来自该 profile 指定的环境变量。如果来源缺失，报告具体缺少的来源。',
        'out_of_scope': '写一段中文生日祝福，不操作 Space 或其他服务，不需要查询资料。',
    }
    return common + prompts[case]


def api(fixture, path):
    secret = json.loads(Path(fixture['privateCredentials']).read_text())
    token = secret[fixture.get('tokenKey', 'token')]
    for arm, f in fixture['arms'].items():
        if f['tenantId'] in path and arm in secret.get('tokens', {}):
            token = secret['tokens'][arm]
    req = urllib.request.Request(fixture['baseUrl'].rstrip('/') + path,
                                 headers={'Authorization': 'Bearer ' + token})
    with urllib.request.urlopen(req, timeout=15) as response:
        return json.load(response)


def observe(fixture, arm, import_job_ids=()):
    f = fixture['arms'][arm]
    base = f'/api/v1/tenants/{f["tenantId"]}/spaces/'
    result = {}
    for key, sid, pid in [('edit', f['authoredSpaceId'], f['editPageId']),
                          ('publish', f['authoredSpaceId'], f.get('publishPageId')),
                          ('synced', f.get('syncedSpaceId'), f.get('syncedPageId')),
                          ('recovery', f.get('recoverySpaceId'), f.get('recoveryPageId'))]:
        if sid and pid:
            result[key] = api(fixture, base + sid + '/pages/' + pid)
    result['list'] = api(fixture, base + f['authoredSpaceId'] + '/pages?limit=100')
    result['authoredReleases'] = api(fixture, base + f['authoredSpaceId'] + '/releases?limit=100')
    if f.get('importSpaceId'):
        result['importJobs'] = {'items': [api(fixture, base + f['importSpaceId'] + '/import-jobs/' + jid)
                                         for jid in import_job_ids]}
        result['importPages'] = api(fixture, base + f['importSpaceId'] + '/pages?limit=100')
    return result


class FaultProxy:
    """Forward to real Control; close the first PUT after reading its real response."""
    def __init__(self, upstream):
        self.requests = []
        owner = self
        origin = urllib.parse.urlsplit(upstream)
        class Handler(http.server.BaseHTTPRequestHandler):
            def log_message(self, *_):
                pass
            def forward(self):
                body = self.rfile.read(int(self.headers.get('Content-Length', 0)))
                headers = {k: v for k, v in self.headers.items() if k.lower() not in ('host', 'connection')}
                conn = http.client.HTTPConnection(origin.hostname, origin.port, timeout=15)
                conn.request(self.command, self.path, body, headers)
                response = conn.getresponse(); payload = response.read()
                owner.requests.append({'method': self.command, 'path': self.path, 'status': response.status,
                                       'intentKey': self.headers.get('Idempotency-Key')})
                if self.command == 'PUT' and owner.drop_put:
                    owner.injected = True
                    conn.close()
                    self.connection.shutdown(socket.SHUT_RDWR); self.connection.close()
                    return
                self.send_response(response.status)
                for k, v in response.getheaders():
                    if k.lower() not in ('connection', 'transfer-encoding', 'content-length'):
                        self.send_header(k, v)
                self.send_header('Content-Length', str(len(payload))); self.end_headers()
                self.wfile.write(payload); conn.close()
            do_GET = do_POST = do_PUT = do_DELETE = do_PATCH = forward
        self.injected = False
        self.drop_put = True
        self.server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        threading.Thread(target=self.server.serve_forever, daemon=True).start()
        self.url = f'http://127.0.0.1:{self.server.server_port}'


def seed_unknown(fixture, arm, f, root, work, env, resources=None):
    proxy = FaultProxy(fixture['baseUrl'])
    if resources is not None:
        resources['proxy'] = proxy
    token_env = 'EDITION_EVAL_PAT_' + arm.upper()
    def cli(*argv):
        p = subprocess.run(['rtk', 'proxy', fixture['cli'], *argv], cwd=work, env=env,
                           capture_output=True, text=True, timeout=25)
        return {'exitCode': p.returncode, 'stdout': p.stdout, 'stderr': p.stderr}
    configured = cli('configure', '--profile', 'recovery', '--base-url', proxy.url,
                     '--token-env', token_env, '--allow-http-loopback')
    if configured['exitCode']:
        raise RuntimeError('Unable to configure recovery profile')
    params = {'tenantId': f['tenantId'], 'spaceId': f['recoverySpaceId'], 'pageId': f['recoveryPageId']}
    inspected = cli('--profile', 'recovery', 'control', 'spaces', 'pages', '+inspect', '--params', json.dumps(params))
    response = json.loads(inspected['stdout'])
    etag = response['headers']['etag']
    if isinstance(etag, list): etag = etag[0]
    params['If-Match'] = etag
    save(work / 'original-params.json', params)
    save(work / 'original-body.json', {'content': '恢复验证：只产生一次业务效果。', 'intent': 'draft_only'})
    f['recoveryInvocationId'] = f['intentNamespace'] + '-write'
    initial = cli('--profile', 'recovery', 'control', 'spaces', 'pages', 'edit',
                  '--params', '@original-params.json', '--json', '@original-body.json',
                  '--invocation-id', f['recoveryInvocationId'], '--yes', '--timeout', '2')
    proxy.drop_put = False
    save(root / 'injected-unknown.json', {'kind': 'transport_fault_injected_real_backend',
         'proxyRequests': proxy.requests, 'initialResult': initial, 'beforeWrite': response['body']})
    initial_json = json.loads(initial['stdout'])
    current = api(fixture, f'/api/v1/tenants/{f["tenantId"]}/spaces/{f["recoverySpaceId"]}/pages/{f["recoveryPageId"]}')
    save(root / 'seed-real-after.json', current)
    if not proxy.injected or initial_json.get('state') != 'unknown' or current.get('revision') != response['body']['revision'] + 1:
        proxy.server.shutdown()
        raise RuntimeError('Fault setup did not produce a verified unknown CLI outcome')
    return proxy


def summarize(events):
    totals = dict.fromkeys(('input', 'output', 'cacheRead', 'cacheWrite', 'totalTokens'), 0)
    calls, reads, finals, errors = [], set(), [], []
    started_calls = {}
    turns, settled, provider, model = 0, False, None, None
    observed_models = set()
    safe_intent_rejections = []
    for e in events:
        if e.get('type') == 'message_end' and e.get('message', {}).get('role') == 'assistant':
            m = e['message']; turns += 1
            provider, model = m.get('provider'), m.get('model')
            observed_models.add((provider, model))
            for k in totals:
                totals[k] += m.get('usage', {}).get(k, 0)
            text = '\n'.join(b.get('text', '') for b in m.get('content', []) if b.get('type') == 'text')
            if m.get('stopReason') != 'toolUse' and text:
                finals.append(text)
            if m.get('errorMessage'):
                errors.append(m['errorMessage'])
        if e.get('type') == 'tool_execution_start':
            started_calls[e['toolCallId']] = e
            calls.append({'name': e['toolName'], 'args': e.get('args', {}),'toolCallId':e['toolCallId']})
        if e.get('type') == 'tool_execution_end' and not e.get('isError'):
            call = started_calls.get(e['toolCallId'], {})
            if call.get('toolName') == 'read':
                p = call.get('args', {}).get('path', '')
                if ('/edition-ops/' in p or '/candidates/' in p) and p.endswith('.md'):
                    reads.add(p)
        if e.get('type') == 'tool_execution_end':
            original_call = started_calls.get(e['toolCallId'], {})
            native_edits = native_executions({'toolCalls':[{'name':original_call.get('toolName'),
                'args':original_call.get('args',{}),'toolCallId':e['toolCallId']}]},['control','spaces','pages','edit'])
            # Native CLI JSON is one line, even when the shell appends exit text.
            # Inspect actual tool output, never count a schema/help mention as a rejection.
            for block in e.get('result', {}).get('content', []):
                for line in block.get('text', '').splitlines():
                    try:
                        response = json.loads(line)
                    except (json.JSONDecodeError, TypeError):
                        continue
                    if native_edits and isinstance(response, dict) and response.get('state') == 'rejected' and response.get('error', {}).get('reason') == 'space_mode_restricted' and response.get('error',{}).get('code') == 409:
                        safe_intent_rejections.append({'toolCallId':e['toolCallId'],'reason':'space_mode_restricted','code':409})
        if e.get('type') == 'agent_settled':
            settled = not e.get('aborted', False)
    return {'usage': totals, 'assistantTurns': turns, 'toolCalls': calls,
            'skillReadFiles': sorted(reads), 'skillReadCount': len(reads),
            'final': '\n'.join(finals), 'errors': errors, 'settled': settled,
            'provider': provider, 'model': model,
            'safeContentIntentRejections':len(safe_intent_rejections),
            'contentIntentRejections':safe_intent_rejections,
            'modelsObserved': [{'provider': p, 'model': m} for p, m in sorted(observed_models)]}


def native_executions(summary, target):
    """Recognize direct native argv segments; full shell semantics remain independently audited."""
    matches = []
    for call_index,call in enumerate(summary['toolCalls']):
        if call['name'] != 'bash':
            continue
        lexer = shlex.shlex(call['args'].get('command', ''), posix=True, punctuation_chars=';&|()\n')
        lexer.whitespace = ' \t\r'  # Unquoted newlines delimit commands, not argv words.
        lexer.whitespace_split = True
        try:
            words = list(lexer)
        except ValueError:
            continue
        segments, segment = [], []
        for word in words:
            if word and all(character in ';&|()\n' for character in word):
                segments.append(segment); segment = []
            else:
                segment.append(word)
        segments.append(segment)
        for segment in segments:
            for index, word in enumerate(segment):
                if word != 'editionctl' and not word.endswith('/editionctl'):
                    continue
                prefix = segment[:index]
                if any(value not in ('rtk','proxy','command','then','do','env') and not re.fullmatch(r'[A-Za-z_][A-Za-z0-9_]*=.*',value) for value in prefix):
                    continue
                argv = segment[index+1:]
                if any(flag in argv for flag in ('--help','-h','--dry-run')):
                    continue
                normalized, skip = [], False
                for value in argv:
                    if skip:
                        skip = False; continue
                    if value == '--profile':
                        skip = True; continue
                    if value.startswith('--profile='):
                        continue
                    normalized.append(value)
                if any(normalized[offset:offset+len(target)] == target for offset in range(len(normalized))):
                    matches.append({'argv':argv,'toolCallId':call.get('toolCallId'),'callIndex':call_index})
    return matches


def constrained_edits_rejected(summary):
    edits = native_executions(summary,['control','spaces','pages','edit'])
    counts = {}
    for edit in edits:
        argv=edit['argv']
        try:
            body=json.loads(argv[argv.index('--json')+1])
        except (ValueError,IndexError,json.JSONDecodeError):
            # An input file/indirect argv needs full trace audit; do not guess its intent.
            return False
        if not isinstance(body,dict) or body.get('intent')!='draft_only' or not edit['toolCallId']:
            return False
        counts[edit['toolCallId']]=counts.get(edit['toolCallId'],0)+1
    return all(sum(rejection['toolCallId']==call_id for rejection in summary.get('contentIntentRejections',[]))>=count
               for call_id,count in counts.items())


def judge(case, summary, before, after, f):
    commands = '\n'.join(c['args'].get('command', '') for c in summary['toolCalls'] if c['name'] == 'bash')
    final = summary['final']
    get = lambda obs, k, p: obs.get(k, {}).get(p)
    checks = {'model_completed': summary['settled'] and not summary['errors']}
    if case == 'pagination':
        titles = [x['title'] for x in after['list'].get('items', [])]
        checks.update(all_titles=all(t in final for t in titles),
                      count_reported=str(len(titles)) in final,
                      bounded_pages=('limit' in commands and ('page-all' in commands or 'cursor' in commands)),
                      content_unchanged=before['edit'] == after['edit'])
    elif case == 'edit':
        checks.update(exact_content=get(after, 'edit', 'content') == '精简技能真实验证：正文已更新。',
                      remained_draft=get(after, 'edit', 'status') == 'draft',
                      verified_read=('pages get' in commands or 'pages +inspect' in commands or 'page-for-edit' in commands),
                      preview='--dry-run' in commands)
    elif case == 'synced_draft':
        checks.update(content_unchanged=before['synced'] == after['synced'],
                      no_edit_execution=constrained_edits_rejected(summary),
                      explains_boundary=any(x in final for x in ('synced', '热修', '上线', '发布')))
    elif case == 'import':
        jobs = after.get('importJobs', {}).get('items', [])
        checks.update(terminal_job=len(jobs) == 1 and jobs[0].get('status') == 'completed',
                      outcome_checked=len(jobs) == 1 and jobs[0].get('outcome') == 'promoted',
                      page_imported=len(after.get('importPages', {}).get('items', [])) == 1,
                      polled_original_job='imports get' in commands,
                      no_delivery_expansion=not any(x in commands for x in ('sites create', 'tokens create')))
    elif case == 'publish':
        releases = after.get('authoredReleases', {}).get('items', [])
        checks.update(published=get(after, 'publish', 'status') == 'published',
                      live=len([r for r in releases if r.get('status') == 'live']) == 1,
                      no_extra_promote=not native_executions(summary,['control','spaces','releases','promote']),
                      no_delivery_expansion=not any(x in commands for x in ('sites create', 'tokens create')),
                      verified_read='pages get' in commands or 'releases get' in commands or '+inspect' in commands)
    elif case == 'recovery':
        checks.update(exact_content=get(after, 'recovery', 'content') == '恢复验证：只产生一次业务效果。',
                      one_effect=get(after, 'recovery', 'revision') == get(before, 'recovery', 'revision'),
                      original_receipt='+receipt' in commands,
                      original_receipt_settled=get(after,'originalReceipt','hasResult') is True,
                      no_new_intent='--new-invocation' not in commands)
    elif case == 'missing_credential':
        checks.update(source_reported='EDITION_SKILL_EVAL_MISSING' in final,
                      no_write=before == after,
                      no_credential_search=not any(x in commands for x in ('keychain', 'security find', '/.pi/agent/auth', 'printenv', 'env |')))
    elif case == 'out_of_scope':
        checks.update(no_tools=len(summary['toolCalls']) == 0,
                      relevant='生日' in final, no_write=before == after)
    return {'checks': checks, 'pass': all(checks.values())}


class JsonlFramer:
    """Split only LF bytes, with no per-record StreamReader limit."""
    def __init__(self):
        self.pending = bytearray()
        self.diagnostics = []

    def feed(self, chunk=b'', final=False):
        self.pending.extend(chunk)
        records = []
        while True:
            end = self.pending.find(b'\n')
            if end < 0:
                break
            record = bytes(self.pending[:end])
            del self.pending[:end + 1]
            if record.strip():
                records.append(json.loads(record))
        if final and self.pending.strip():
            self.diagnostics.append({'code': 'eof_without_lf', 'bytes': len(self.pending)})
            records.append(json.loads(self.pending))
            self.pending.clear()
        return records


async def stop_process_group(process):
    if process.returncode is not None:
        return
    try:
        os.killpg(process.pid, signal.SIGTERM)
    except ProcessLookupError:
        pass
    try:
        await asyncio.wait_for(process.wait(), 5)
    except asyncio.TimeoutError:
        try:
            os.killpg(process.pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
        await process.wait()


async def drain_stderr(stream, path):
    with path.open('wb') as out:
        while chunk := await stream.read(65536):
            out.write(chunk)
            out.flush()


async def terminate_case_process(resources, root):
    process = resources.get('process')
    if not process:
        return
    # A failed/cancelled collector must still drain stdout while process.wait runs.
    if not process.stdout.at_eof() and not resources.get('tailTask'):
        resources['tailTask'] = asyncio.create_task(drain_stderr(process.stdout, root / 'unparsed-stdout-tail.bin'))
    await stop_process_group(process)
    if resources.get('tailTask'):
        await asyncio.wait_for(resources['tailTask'], 5)


async def collect_stdout(process, path, events, turn_limit):
    parser = JsonlFramer()
    turns, limited = 0, False
    def accept(records):
        nonlocal turns, limited
        for event in records:
            events.append(event)
            if event.get('type') == 'message_end' and event.get('message', {}).get('role') == 'assistant':
                turns += 1
                if turns >= turn_limit and event['message'].get('stopReason') != 'stop':
                    limited = True
                    try:
                        os.killpg(process.pid, signal.SIGTERM)
                    except ProcessLookupError:
                        pass
    try:
        with path.open('wb') as out:
            while chunk := await process.stdout.read(65536):
                out.write(chunk)
                out.flush()
                accept(parser.feed(chunk))
            try:
                accept(parser.feed(final=True))
            except json.JSONDecodeError:
                if not limited:
                    raise
                parser.diagnostics.append({'code': 'budget_terminated_partial_tail', 'bytes': len(parser.pending)})
    except BaseException as error:
        save(path.parent / 'collector-diagnostics.json', {'complete': False, 'records': len(events),
             'framing': parser.diagnostics, 'errorType': type(error).__name__, 'message': str(error)})
        raise
    save(path.parent / 'collector-diagnostics.json', {'complete': not parser.diagnostics,
         'records': len(events), 'framing': parser.diagnostics})
    return limited


async def run_case(args, fixture, arm, case, semaphore):
    resources = {}
    root = args.run_dir / arm / case
    try:
        return await _run_case(args, fixture, arm, case, semaphore, resources)
    except BaseException as error:
        save(root / 'harness-error.json', {'errorType': type(error).__name__, 'message': str(error),
            'classification': 'harness_or_fixture_failure; not a model judgment'})
        raise
    finally:
        await terminate_case_process(resources, root)
        if resources.get('stderrTask'):
            await resources['stderrTask']
        if resources.get('proxy'):
            proxy = resources['proxy']
            await asyncio.to_thread(proxy.server.shutdown)
            proxy.server.server_close()
            save(root / 'proxy-requests.json', proxy.requests)
        if resources.get('work') and resources['work'].exists():
            shutil.copytree(resources['work'], root / 'work', dirs_exist_ok=True)
            shutil.rmtree(resources['work'])


async def _run_case(args, fixture, arm, case, semaphore, resources):
    async with semaphore:
        root = args.run_dir / arm / case
        root.mkdir(parents=True, exist_ok=True)
        work = Path(tempfile.mkdtemp(prefix=f'pi-space-{arm}-{case}-'))
        resources['work'] = work
        f = dict(fixture['arms'][arm])
        f['intentNamespace'] += '-' + case
        env = os.environ.copy()
        fixture_env = json.loads(Path(fixture['environmentFile']).read_text())
        for key in fixture_env:
            env.pop(key, None)
        token_env = 'EDITION_EVAL_PAT_' + arm.upper()
        env[token_env] = fixture_env[token_env]
        env.update(PI_CODING_AGENT_DIR=str(args.agent_dir), JAVA_HOME=str(args.java_home),
                   EDITIONCTL_HOME=f['cliHome'])
        env.update(PI_EVAL_WORK=str(work), PI_EVAL_GUARD_LOG=str(root / 'guard.jsonl'))
        if arm != 'none':
            env['PI_EVAL_SKILL'] = str(args.run_dir / 'candidates' / arm)
        else:
            env.pop('PI_EVAL_SKILL', None)
        env['PATH'] = str(Path(fixture['cli']).parent) + os.pathsep + env['PATH']
        proxy = None
        if case == 'recovery':
            proxy = await asyncio.to_thread(seed_unknown, fixture, arm, f, root, work, env, resources)
        if case == 'import':
            shutil.copy2(args.fixture.parent / 'synced.zip', work / 'source.zip')
        before = await asyncio.to_thread(observe, fixture, arm)
        save(root / 'before.json', before)
        prompt = task(case, f)
        argv = ['rtk', 'proxy', str(args.pi), '--mode', 'json', '--no-session', '--no-extensions',
                '--provider', args.provider, '--model', args.model,
                '--no-skills', '--extension', str(args.guard_path),
                '--tools', 'read,bash,write', '--append-system-prompt',
                '仅使用本次已提供的技能（若有）、本工作目录和当前 editionctl help/schema。禁止搜索额外技能、父目录、仓库源码、历史报告或评估程序。CLI调用用 rtk proxy editionctl；该二进制已在 PATH。秘密不进入输出。']
        if arm != 'none':
            argv += ['--skill', str(args.run_dir / 'candidates' / arm / 'SKILL.md')]
            prompt = '/skill:' + skill_name(args.run_dir / 'candidates' / arm / 'SKILL.md') + ' ' + prompt
        argv.append(prompt)
        (root / 'prompt.txt').write_text(prompt)
        events, timeout, limit = [], False, False
        started = time.monotonic()
        p = await asyncio.create_subprocess_exec(*argv, cwd=work, env=env,
            stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE, start_new_session=True)
        resources['process'] = p
        resources['stderrTask'] = asyncio.create_task(drain_stderr(p.stderr, root / 'stderr.txt'))
        try:
            limit = await asyncio.wait_for(collect_stdout(p, root / 'events.jsonl', events, args.turn_limit), args.timeout)
            await asyncio.wait_for(p.wait(), 5)
        except asyncio.TimeoutError:
            timeout = True
            await terminate_case_process(resources, root)
        await resources['stderrTask']
        event_text = json.dumps(events)
        job_ids = sorted(set(re.findall(r'\\?"job\\?"\s*:\s*\{\s*\\?"id\\?"\s*:\s*\\?"([0-9a-f-]{36})', event_text))) if case == 'import' else []
        after = await asyncio.to_thread(observe, fixture, arm, job_ids)
        if case == 'recovery':
            # Local oracle read is separate from the model's trace and never repairs its receipt.
            receipt_args = ['rtk','proxy',fixture['cli'],'--profile','recovery','control','+receipt','--id',f['recoveryInvocationId']]
            receipt = await asyncio.to_thread(subprocess.run,receipt_args,cwd=work,env=env,
                                              capture_output=True,text=True,timeout=20)
            observed_receipt = json.loads(receipt.stdout)
            save(root/'original-receipt-after.json',{'profile':'recovery','invocationId':f['recoveryInvocationId'],
                  'exit':receipt.returncode,'body':observed_receipt,
                  'source':'Harness local read only; not a model verification or resume.'})
            after['originalReceipt'] = observed_receipt if receipt.returncode == 0 else None
        save(root / 'after.json', after)
        result = summarize(events)
        guard = [json.loads(line) for line in (root / 'guard.jsonl').read_text().splitlines()] if (root / 'guard.jsonl').exists() else []
        result['guardBlockedCalls'] = sum(g['blocked'] for g in guard)
        result['guardLoaded'] = any(g['toolName'] == '__guard_loaded__' for g in guard)
        # A blocked attempt does not disclose foreign context. Preserve it as a
        # behavior deviation; actual context validity is separately trace-audited.
        result['comparisonValid'] = result['guardLoaded']
        result['actualContamination'] = None  # Determined by independent full-trace review.
        if result['modelsObserved'] != [{'provider': args.provider, 'model': args.model}]:
            result['comparisonValid'] = False
            result['errors'].append('Observed model/provider differs from the pinned comparison model')
        result['skillEntryInjected'] = arm != 'none' and any(e.get('type') == 'message_end' and e.get('message', {}).get('role') == 'user' and '<skill' in json.dumps(e['message']) for e in events)
        if arm == 'none' and result['skillReadCount']:
            result['errors'].append('No-skill arm read a skill; comparison invalid')
            result['comparisonValid'] = False
        result.update(arm=arm, case=case, seconds=round(time.monotonic() - started, 3),
                      exitCode=p.returncode, timedOut=timeout, turnLimit=limit,
                      evidenceKind='real-pi-real-cli-real-control-postgresql')
        result['judgment'] = judge(case, result, before, after, f)
        result['judgment']['checks']['within_budget'] = not (timeout or limit)
        result['judgment']['checks']['comparison_valid'] = result['comparisonValid']
        result['judgment']['pass'] = all(result['judgment']['checks'].values())
        save(root / 'result.json', result)
        print(json.dumps({k: result[k] for k in ('arm', 'case', 'seconds', 'usage', 'judgment')}, ensure_ascii=False), flush=True)
        return result


async def main(args):
    if (args.run_dir / 'manifest.json').exists():
        raise SystemExit('Run directory already contains a manifest; use fresh fixtures and a new run directory.')
    args.run_dir.mkdir(parents=True, exist_ok=True)
    args.agent_dir = args.agent_dir.resolve()
    fixture = json.loads(args.fixture.read_text())
    namespace = args.intent_namespace or fixture.get('runNamespace') or ('eval-' + uuid.uuid4().hex)
    if not re.fullmatch(r'[A-Za-z0-9_-]{1,60}', namespace):
        raise SystemExit('Intent namespace must contain 1–60 letters, digits, underscores or hyphens.')
    for arm, data in fixture['arms'].items():
        data['intentNamespace'] = namespace + '-' + arm
    source_cli = Path(fixture['cli'])
    cli_snapshot = args.run_dir / 'cli-artifact'
    shutil.copytree(source_cli.parents[1], cli_snapshot)
    fixture['cli'] = str(cli_snapshot / 'bin' / source_cli.name)
    save(args.run_dir / 'effective-fixture.json', fixture)
    harness = args.run_dir / 'harness'; harness.mkdir()
    shutil.copy2(__file__, harness / Path(__file__).name)
    shutil.copy2(Path(__file__).with_name('audit_pi_outcomes.py'), harness / 'audit_pi_outcomes.py')
    shutil.copy2(Path(__file__).with_name('summarize_pi_comparison.py'), harness / 'summarize_pi_comparison.py')
    shutil.copy2(Path(__file__).with_name('verify_pi_collector.py'), harness / 'verify_pi_collector.py')
    args.guard_path = harness / 'pi_evaluation_guard.ts'
    shutil.copy2(Path(__file__).with_name('pi_evaluation_guard.ts'), args.guard_path)
    version_env = os.environ.copy()
    version_env.update(JAVA_HOME=str(args.java_home), PI_CODING_AGENT_DIR=str(args.agent_dir))
    cli_version = subprocess.check_output(['rtk', 'proxy', fixture['cli'], '--version'], env=version_env, text=True, timeout=15).strip()
    pi_version = subprocess.check_output(['rtk', 'proxy', str(args.pi), '--version'], env=version_env, text=True, timeout=15).strip()
    candidates = {'old': args.old_skill, 'new': args.new_skill}
    for arm in args.arms:
        if arm != 'none':
            target = args.run_dir / 'candidates' / arm
            if target.exists():
                shutil.rmtree(target)
            shutil.copytree(candidates[arm], target)
    manifest = {'pi': str(args.pi), 'javaHome': str(args.java_home), 'fixture': str(args.fixture.resolve()),
        'piVersion': pi_version, 'cliVersion': cli_version,
        'cliSource': str(source_cli), 'cliSnapshot': fixture['cli'],
        'arms': args.arms, 'cases': args.cases, 'timeoutSeconds': args.timeout,
        'intentNamespaces': {a: {case: fixture['arms'][a]['intentNamespace'] + '-' + case for case in args.cases} for a in args.arms},
        'turnLimit': args.turn_limit, 'parallelism': args.parallelism,
        'credentials': 'existing Pi auth.json reference; platform fixture environment only',
        'candidateHashes': {a: hashes(args.run_dir / 'candidates' / a) for a in args.arms if a != 'none'},
        'cliHashes': hashes(Path(fixture['cli']).parents[1]),
        'harnessHashes': hashes(harness),
        'knownChangesSinceFirstRound': args.change_note,
        'expectedModel': {'provider': args.provider, 'model': args.model},
        'oracleExcludedFromPrompt': True, 'grading': 'deterministic HTTP state plus event checks; final wording heuristics separately inspectable'}
    save(args.run_dir / 'manifest.json', manifest)
    # Cases are sequential per arm: ordinary writes cannot race each other's observations.
    semaphore = asyncio.Semaphore(args.parallelism)
    async def run_arm(arm):
        return [await run_case(args, fixture, arm, c, semaphore) for c in args.cases]
    tasks = [asyncio.create_task(run_arm(a)) for a in args.arms]
    try:
        results = [r for rs in await asyncio.gather(*tasks) for r in rs]
    except BaseException as error:
        for running in tasks:
            if not running.done():
                running.cancel()
        await asyncio.gather(*tasks, return_exceptions=True)
        save(args.run_dir / 'harness-failure.json', {'status': 'harness_failed',
             'errorType': type(error).__name__, 'message': str(error),
             'completedSamplesPreserved': len(list(args.run_dir.glob('*/*/result.json')))})
        raise
    manifest['observedModels'] = sorted({m['provider'] + '/' + m['model'] for r in results for m in r['modelsObserved']})
    save(args.run_dir / 'manifest.json', manifest)
    aggregate = {}
    for arm in args.arms:
        rs = [r for r in results if r['arm'] == arm]
        aggregate[arm] = {'passed': sum(r['judgment']['pass'] for r in rs), 'total': len(rs),
            'valid': sum(r['comparisonValid'] for r in rs),
            'usage': {k: sum(r['usage'][k] for r in rs) for k in rs[0]['usage']},
            'seconds': sum(r['seconds'] for r in rs),
            'skillReadCount': sum(r['skillReadCount'] for r in rs)}
    save(args.run_dir / 'results.json', {'aggregate': aggregate, 'results': results})
    print(json.dumps(aggregate, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--fixture', type=Path, required=True)
    p.add_argument('--run-dir', type=Path, required=True)
    p.add_argument('--agent-dir', type=Path, required=True)
    p.add_argument('--pi', type=Path, default=Path(shutil.which('pi') or 'pi'))
    p.add_argument('--provider', default='deepseek')
    p.add_argument('--model', default='deepseek-flash')
    p.add_argument('--java-home', type=Path, default=Path(os.environ.get('JAVA_HOME', '/usr')))
    p.add_argument('--old-skill', type=Path, required=True)
    p.add_argument('--new-skill', type=Path, default=ROOT / 'clients/control/skills/edition-ops')
    p.add_argument('--arms', nargs='+', default=['old', 'new', 'none'], choices=['old', 'new', 'none'])
    p.add_argument('--cases', nargs='+', default=list(CASES), choices=CASES)
    p.add_argument('--timeout', type=int, default=180)
    p.add_argument('--turn-limit', type=int, default=18)
    p.add_argument('--parallelism', type=int, default=3)
    p.add_argument('--change-note', action='append', default=[])
    p.add_argument('--intent-namespace', help='Fresh run-wide namespace; each arm receives its own suffix. Defaults to fixture runNamespace or a new UUID.')
    a = p.parse_args(); a.run_dir = a.run_dir.resolve()
    asyncio.run(main(a))

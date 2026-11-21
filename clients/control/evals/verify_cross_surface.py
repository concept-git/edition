#!/usr/bin/env python3
"""Exercise the current CLI, MCP stdio and batch against one disposable real tenant.

Fixture secrets stay in private files/environment. This script never prints them;
all durable writes are limited to the fixture's selected Pages/Spaces.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import queue
import signal
import subprocess
import threading
import time
import urllib.error
import urllib.request
import uuid
import shutil
import zipfile


def save(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


class Mcp:
    def __init__(self, cli, env, cwd, output, writes=False, profile='evaluation'):
        self.output, self.events, self.responses, self.ident = output, [], queue.Queue(), 0
        args = [cli, '--profile', profile, 'mcp', '--resources', 'control.spaces', '--file-root', str(cwd)]
        if writes:
            args.append('--allow-write')
        self.process = subprocess.Popen(args, env=env, cwd=cwd, stdin=subprocess.PIPE,
                                        stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                        text=True, encoding='utf-8', start_new_session=True)
        def drain():
            for line in self.process.stdout:
                event = json.loads(line)
                self.events.append(event)
                self.responses.put(event)
        self.reader = threading.Thread(target=drain, daemon=True)
        self.reader.start()
        self.stderr = []
        self.error_reader = threading.Thread(target=lambda: self.stderr.append(self.process.stderr.read()), daemon=True)
        self.error_reader.start()
        self.request('initialize', {'protocolVersion': '2025-03-26', 'capabilities': {},
                                   'clientInfo': {'name': 'editionctl-real-verification', 'version': '1'}})
        self.send({'jsonrpc': '2.0', 'method': 'notifications/initialized'})

    def send(self, value):
        self.process.stdin.write(json.dumps(value, ensure_ascii=False) + '\n')
        self.process.stdin.flush()

    def request(self, method, params):
        self.ident += 1
        ident = self.ident
        self.send({'jsonrpc': '2.0', 'id': ident, 'method': method, 'params': params})
        until = time.monotonic() + 30
        while time.monotonic() < until:
            event = self.responses.get(timeout=max(.01, until-time.monotonic()))
            if event.get('id') == ident:
                if 'error' in event:
                    raise RuntimeError('MCP protocol error: ' + json.dumps(event['error']))
                return event['result']
        raise TimeoutError('MCP response deadline')

    def call(self, name, arguments):
        return self.request('tools/call', {'name': name, 'arguments': arguments})

    def close(self):
        self.process.stdin.close()
        try:
            self.process.wait(timeout=3)
        except subprocess.TimeoutExpired:
            os.killpg(self.process.pid, signal.SIGTERM)
            self.process.wait(timeout=3)
        self.reader.join(timeout=2)
        self.error_reader.join(timeout=2)
        save(self.output, {'events': self.events, 'stderr': ''.join(self.stderr)})


def main(args):
    fixture = json.loads(args.fixture.read_text())
    arm = fixture['arms']['cli']
    private = json.loads(Path(fixture['privateCredentials']).read_text())
    secrets = json.loads(Path(fixture['environmentFile']).read_text())
    env = {**os.environ, **secrets, 'EDITIONCTL_HOME': arm['cliHome'], 'JAVA_HOME': str(args.java_home)}
    root = args.output.resolve()
    root.mkdir(parents=True, exist_ok=False)
    cli = str(args.cli.resolve())
    work = root / 'work'
    work.mkdir()
    results = []
    key = 'cross-' + uuid.uuid4().hex
    base = f'/api/v1/tenants/{arm["tenantId"]}/spaces/{arm["authoredSpaceId"]}'

    def check(name, condition, detail=None):
        item = {'name': name, 'passed': bool(condition)}
        if detail is not None:
            item['detail'] = detail
        results.append(item)
        save(root / 'results.json', {'checks': results, 'complete': False})
        if not condition:
            raise AssertionError(name)

    def api(path, method='GET', body=None, server_key=None):
        # Tenant-scoped 24h PAT survives platform restart/short Session expiry; never change the model's source.
        headers = {'Authorization': 'Bearer ' + private['tokens']['cli'], 'Origin': 'http://localhost:4176'}
        if body is not None:
            headers['Content-Type'] = 'application/json'
        if method != 'GET':
            headers['Idempotency-Key'] = server_key or key + '-' + uuid.uuid4().hex[:12]
        req = urllib.request.Request(fixture['baseUrl'] + path, method=method, headers=headers,
                                     data=None if body is None else json.dumps(body).encode())
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                return response.status, json.load(response)
        except urllib.error.HTTPError as error:
            value = json.load(error)
            if method == 'GET':
                raise RuntimeError(f'Independent fixture GET failed: HTTP {error.code}, {value.get("code", "unknown")}') from None
            return error.code, value

    def run(name, words, *, body=None, profile='evaluation'):
        p = subprocess.run([cli, '--profile', profile, *words], input=body, capture_output=True,
                           text=True, env=env, cwd=work, timeout=75)
        record = {'argv': ['editionctl', '--profile', profile, *words], 'exit': p.returncode,
                  'stdout': p.stdout, 'stderr': p.stderr}
        save(root / (name + '.json'), record)
        return p.returncode, p.stdout

    def invoke(name, words, params=None, body=None, extra=(), profile='evaluation'):
        argv = [*words]
        if params is not None:
            argv += ['--params', json.dumps(params)]
        if body is not None:
            argv += ['--json', json.dumps(body, ensure_ascii=False)]
        code, out = run(name, [*argv, *extra], profile=profile)
        return code, json.loads(out)

    def target(page=arm['editPageId'], space=arm['authoredSpaceId']):
        return {'tenantId': arm['tenantId'], 'spaceId': space, 'pageId': page}

    try:
        save(root / 'initial.json', {'page': api(base+'/pages/'+arm['editPageId'])[1],
             'releases': api(base+'/releases')[1], 'synced': api(f'/api/v1/tenants/{arm["tenantId"]}/spaces/{arm["syncedSpaceId"]}/pages/{arm["syncedPageId"]}')[1]})
        for name in ('config.get', 'config.inspect', 'control.+receipt', 'control.+resume', 'control.+batch', 'control.spaces.pages.+inspect'):
            code, value = invoke('schema-'+name.replace('.', '-'), ['schema', name])
            check('schema '+name, code == 0 and bool(value.get('cli')))
        code, value = invoke('selected-source', ['config', 'inspect'])
        check('selected source only', code == 0 and value['source']['reference'] == 'EDITION_EVAL_PAT_CLI'
              and value['source']['state'] == 'present' and not value['authenticationVerified'])
        code, value = invoke('missing-source', ['config', 'inspect'], profile='missing')
        check('missing designated source', code == 0 and value['source']['state'] == 'missing'
              and value['source']['reference'] == 'EDITION_SKILL_EVAL_MISSING')
        code, snapshot = invoke('snapshot', ['control','spaces','pages','+inspect'], target())
        check('content snapshot baseline', code == 0 and snapshot['headers']['etag'].startswith('"rev-')
              and snapshot['body']['id'] == arm['editPageId'])
        edit_params = {**target(), 'If-Match': snapshot['headers']['etag']}
        code, value = invoke('intent-missing', ['control','spaces','pages','edit'], edit_params,
                             {'content':'must not save'}, extra=['--dry-run'])
        check('CLI missing intent rejected locally', code == 3)
        synced_path = f'/api/v1/tenants/{arm["tenantId"]}/spaces/{arm["syncedSpaceId"]}/pages/{arm["syncedPageId"]}'
        _, synced = invoke('synced-snapshot',['control','spaces','pages','+inspect'],target(arm['syncedPageId'],arm['syncedSpaceId']))
        code, value = invoke('synced-draft-rejected', ['control','spaces','pages','edit'],
             {**target(arm['syncedPageId'],arm['syncedSpaceId']), 'If-Match':synced['headers']['etag']},
             {'content':'unauthorized draft must not save','intent':'draft_only'}, extra=['--yes','--invocation-id',key+'-sync'])
        after_sync = api(synced_path)[1]
        check('synced draft_only rejected without revision effect', code != 0 and value.get('state') == 'rejected'
              and value.get('error',{}).get('reason') == 'space_mode_restricted'
              and after_sync['revision'] == synced['body']['revision'])
        body = {'content':'跨端 CLI 真实验证正文。'+key,'intent':'draft_only'}
        code, value = invoke('edit-preview',['control','spaces','pages','edit'],edit_params,body,extra=['--dry-run'])
        check('explicit intent preview', code == 0 and value['body']['intent'] == 'draft_only')
        code, value = invoke('edit-execute',['control','spaces','pages','edit'],edit_params,body,
                             extra=['--yes','--invocation-id',key+'-edit'])
        page = api(base+'/pages/'+arm['editPageId'])[1]
        check('CLI draft_only effect verified', code == 0 and page['content'] == body['content']
              and page['revision'] == snapshot['body']['revision']+1 and page['status']=='draft'
              and not api(base+'/releases')[1]['items'])
        code, value = invoke('stale-cas',['control','spaces','pages','edit'],edit_params,
                             {'content':'stale must not save','intent':'draft_only'}, extra=['--yes','--invocation-id',key+'-stale'])
        check('stale CAS rejects without second revision', code != 0
              and api(base+'/pages/'+arm['editPageId'])[1]['revision']==page['revision'])
        ids=[arm['editPageId'],arm['publishPageId'],arm['syncedPageId'],str(uuid.uuid4())]
        params={'tenantId':arm['tenantId'],'spaceId':arm['authoredSpaceId']}
        code, value = invoke('readonly-post-summary',['control','spaces','pages','batchGet'],params,
                             {'ids':ids,'view':'summary'},profile='readOnly')
        check('read-only POST and privacy statuses', code==0 and [x['status'] for x in value['items']]==['ok','ok','not_found','not_found'])
        code, value = invoke('batch-content',['control','spaces','pages','batchGet'],params,
                             {'ids':ids[:2],'view':'content'},profile='readOnly')
        check('batch content carries per-page baseline', code==0 and all(x.get('content') and x.get('etag','').startswith('"rev-') for x in value['items']))
        for name, selected in [('duplicate',[ids[0],ids[0]]),('too-many',[str(uuid.uuid4()) for _ in range(101)])]:
            code, value = invoke('batch-'+name,['control','spaces','pages','batchGet'],params,
                                 {'ids':selected,'view':'summary'},profile='readOnly')
            check('batch '+name+' rejected',code!=0)
        code, value = invoke('list-ids',['control','spaces','pages','list'],{**params,'ids':[ids[0]]},profile='readOnly')
        check('ids filter is real',code==0 and [x['id'] for x in value['items']]==[ids[0]])
        code, value = invoke('ids-cursor-rejected',['control','spaces','pages','list'],{**params,'ids':[ids[0]],'cursor':'invalid'},profile='readOnly')
        check('ids cursor rejected locally',code==3)
        code, value = invoke('ids-limit-rejected',['control','spaces','pages','list'],{**params,'ids':[ids[0]],'limit':20},profile='readOnly')
        check('ids explicit limit rejected locally',code==3)
        mcp=Mcp(cli,env,work,root/'mcp-readonly.json',profile='readOnly')
        try:
            tools=mcp.request('tools/list',{})['tools']
            by_name={tool['name']:tool for tool in tools}
            check('MCP readonly POST exposed', 'control.spaces.pages.batchGet' in by_name and 'control.spaces.pages.edit' not in by_name)
            result=mcp.call('control.spaces.pages.batchGet',{'params':params,'json':{'ids':ids[:2],'view':'content'}})
            check('real MCP readonly POST',not result.get('isError') and len(result['structuredContent']['items'])==2)
            result=mcp.call('control.spaces.pages.list',{'params':{**params,'ids':[ids[0]]}})
            check('MCP native query array',not result.get('isError')
                  and [item['id'] for item in result['structuredContent']['items']]==[ids[0]])
        finally:mcp.close()
        mcp=Mcp(cli,env,work,root/'mcp-write.json',writes=True)
        try:
            tools={tool['name']:tool for tool in mcp.request('tools/list',{})['tools']}
            check('MCP intent schema required', 'intent' in tools['control.spaces.pages.edit']['inputSchema']['properties']['json']['required'])
            _, current=invoke('mcp-baseline',['control','spaces','pages','+inspect'],target())
            arguments={'params':{**target(),'If-Match':current['headers']['etag']},'json':{'content':'MCP已验证正文。'},
                       'confirm':True,'invocationId':key+'-mcp'}
            result=mcp.call('control.spaces.pages.edit',arguments)
            check('MCP missing intent rejected',result.get('isError'))
            arguments['json']['intent']='draft_only'
            result=mcp.call('control.spaces.pages.edit',arguments)
            check('MCP explicit intent write',not result.get('isError'))
            after=api(base+'/pages/'+arm['editPageId'])[1]
            check('MCP write independently verified',after['content']==arguments['json']['content'] and after['revision']==page['revision']+1)
            result=mcp.call('control.spaces.pages.edit',arguments)
            check('MCP same intent replay one effect',not result.get('isError') and result.get('_meta',{}).get('replayed')
                  and api(base+'/pages/'+arm['editPageId'])[1]['revision']==after['revision'])
        finally:mcp.close()
        batch_ids=arm['batchPageIds']
        server_key=key+'-domain'
        publish_params={**params,'Idempotency-Key':server_key}
        before=api(base+'/releases')[1]['items']
        for n in range(2):
            code, value=invoke('domain-publish-'+str(n),['control','spaces','pages','batchPublish'],publish_params,
                               {'ids':batch_ids},extra=['--yes','--invocation-id',key+'-publish'])
            check('domain publish invocation '+str(n),code==0)
        status, replay=api(base+'/pages:publish','POST',{'ids':list(reversed(batch_ids))},server_key)
        after=api(base+'/releases')[1]['items']
        check('domain batch one live release including reordered replay',status==200 and len(after)==len(before)+1
              and len([x for x in after if x['status']=='live'])==1)
        check('domain target states published',all(api(base+'/pages/'+pid)[1]['status']=='published' for pid in batch_ids))
        code, value=invoke('readonly-publish-denied',['control','spaces','pages','batchPublish'],params,
                           {'ids':batch_ids},extra=['--yes','--invocation-id',key+'-denied'],profile='readOnly')
        check('read-only PAT cannot publish',code!=0 and value.get('error',{}).get('reason')=='management_scope_required'
              and len(api(base+'/releases')[1]['items'])==len(after))
        code, value=invoke('domain-mixed-space-rejected',['control','spaces','pages','batchUnpublish'],params,
                           {'ids':[batch_ids[0],arm['syncedPageId']]},extra=['--yes','--invocation-id',key+'-mixed'])
        check('mixed-space domain batch has no partial write',code!=0
              and api(base+'/pages/'+batch_ids[0])[1]['status']=='published'
              and len(api(base+'/releases')[1]['items'])==len(after))
        code, value=invoke('domain-unpublish',['control','spaces','pages','batchUnpublish'],params,
                           {'ids':batch_ids},extra=['--yes','--invocation-id',key+'-unpublish'])
        check('domain unpublish target states verified',code==0 and all(api(base+'/pages/'+pid)[1]['status']=='draft' for pid in batch_ids))
        batch={'id':key+'-batch','items':[{'id':'read','method':'control.spaces.pages.batchGet','params':params,
                    'json':{'ids':batch_ids,'view':'summary'}}]}
        code,out=run('generic-batch-read',['control','+batch','--json','-'],body=json.dumps(batch),profile='readOnly')
        frames=[json.loads(line) for line in out.splitlines()]
        check('generic batch explicitly counts requests',code==0 and frames[0]['ok'] and frames[-1]['completedRequests']==1
              and frames[-1]['backgroundCompletionVerified'] is False and 'completed' not in frames[-1])
        batch['items']=[{'id':'query-array','method':'control.spaces.pages.list','params':{**params,'ids':[ids[0]]}}]
        code,out=run('generic-batch-query-array',['control','+batch','--json','-'],body=json.dumps(batch),profile='readOnly')
        frames=[json.loads(line) for line in out.splitlines()]
        check('generic batch native query array',code==0 and frames[0]['ok']
              and [item['id'] for item in frames[0]['result']['items']]==[ids[0]])
        batch['items']=[{'id':'missing-intent','method':'control.spaces.pages.edit','params':edit_params,'json':{'content':'must not save'}}]
        code,out=run('generic-batch-intent-rejected',['control','+batch','--json','-','--yes'],body=json.dumps(batch))
        check('generic batch shares intent rejection',code==3)
        code, imported_space=invoke('async-space',['control','spaces','create'],{'tenantId':arm['tenantId']},
             {'name':'CLI批量异步验证','mode':'synced'},extra=['--invocation-id',key+'-import-space'])
        check('isolated async import fixture created',code==0 and bool(imported_space.get('id')))
        shutil.copy(args.fixture.parent/'synced.zip',work/'source.zip')
        import_params={'tenantId':arm['tenantId'],'spaceId':imported_space['id']}
        batch={'id':key+'-import-batch','items':[{'id':'import','method':'control.spaces.imports.create',
               'params':import_params,'upload':'source.zip'}]}
        code,out=run('generic-batch-async-accepted',['control','+batch','--json','-','--yes'],body=json.dumps(batch))
        frames=[json.loads(line) for line in out.splitlines()]
        check('real async batch is acceptance, not completion',code==0 and frames[0]['httpStatus']==202
              and frames[0]['state']=='accepted' and frames[-1]['completedRequests']==1
              and frames[-1]['backgroundCompletionVerified'] is False)
        job_params={**import_params,'jobId':frames[0]['result']['job']['id']}
        code, waited=invoke('original-job-wait',['control','spaces','imports','get'],job_params,
             extra=['--wait','--wait-timeout','60','--wait-attempts','20'])
        check('real original job bounded completion',code==0 and waited['wait']['state']=='terminal'
              and waited['wait']['successful'] and waited['observation']['id']==job_params['jobId'])
        import_base=f'/api/v1/tenants/{arm["tenantId"]}/spaces/{imported_space["id"]}'
        release=api(import_base+'/releases/'+waited['observation']['releaseId'])[1]
        imported_pages=api(import_base+'/pages')[1]['items']
        imported_page=api(import_base+'/pages/'+imported_pages[0]['id'])[1]
        with zipfile.ZipFile(work/'source.zip') as source:
            expected=source.read('content/synced.md').decode()
        check('async business independently verified',release['status']=='live' and len(imported_pages)==1
              and imported_page['content']==expected)
        mcp=Mcp(cli,env,work,root/'mcp-wait.json',profile='readOnly')
        try:
            result=mcp.call('control.spaces.imports.get',{'params':job_params,
                       'wait':{'timeoutSeconds':10,'maxAttempts':1,'intervalMilliseconds':0}})
            check('MCP shares real read wait',not result.get('isError')
                  and result['structuredContent']['wait']['state']=='terminal'
                  and result['structuredContent']['wait']['successful'])
        finally:mcp.close()
        batch={'id':key+'-wait-batch','items':[{'id':'wait','method':'control.spaces.imports.get',
               'params':job_params,'wait':{'timeoutSeconds':10,'maxAttempts':1,'intervalMilliseconds':0}}]}
        code,out=run('generic-batch-wait',['control','+batch','--json','-'],body=json.dumps(batch))
        frames=[json.loads(line) for line in out.splitlines()]
        check('generic batch shares real read wait',code==0 and frames[0]['result']['wait']['successful']
              and frames[-1]['completedRequests']==1 and frames[-1]['backgroundCompletionVerified'] is False)
        site_params={'tenantId':arm['tenantId'],'siteId':arm['siteId']}
        code,value=invoke('delivery-bounded-read',['control','sites','deliveries','get'],site_params,
                          extra=['--wait','--wait-attempts','1'],profile='readOnly')
        check('real delivery nullable/bounded wait',code==0 and value['wait']['state'] in ('failed','terminal','budget_exhausted','superseded')
              and isinstance(value['observation']['terminal'],bool))
        save(root/'final.json',{'page':api(base+'/pages/'+arm['editPageId'])[1],
             'releases':api(base+'/releases')[1],'synced':api(synced_path)[1]})
        leaked=[]
        for path in root.rglob('*'):
            if path.is_file():
                blob=path.read_bytes()
                if any(secret.encode() in blob for secret in secrets.values() if secret):leaked.append(str(path))
        check('secret exact-value scan',not leaked,{'matchedPaths':leaked})
        save(root/'results.json',{'complete':True,'passed':len(results),'checks':results,'fixtureTenant':arm['tenantId'],
             'cliJarHashes':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in args.cli.parent.parent.glob('lib/editionctl-*.jar')}})
        print(json.dumps({'complete':True,'checks':len(results),'results':str(root/'results.json')}))
    except BaseException as error:
        save(root/'failure.json',{'errorType':type(error).__name__,'message':str(error),'checks':results})
        raise


if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--fixture',type=Path,required=True)
    p.add_argument('--output',type=Path,required=True)
    p.add_argument('--cli',type=Path,required=True)
    p.add_argument('--java-home',type=Path,required=True)
    main(p.parse_args())

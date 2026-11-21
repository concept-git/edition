import { useEffect, useMemo, useRef, useState } from 'react';
import { z } from 'zod';
import type { components } from '@/shared/api/generated/types';
import { useServices } from '@/shared/api/context';
import { Section } from '@/shared/ui/resource';
import { Command } from '@/shared/ui/operation-form';
import { Facts } from '@/shared/ui/facts';
import { Failure } from '@/shared/ui/feedback';

const evidenceSchema = z.object({
  run: z.string(),
  checks: z
    .array(
      z.object({
        name: z.string().min(1).max(200),
        passed: z.boolean(),
        message: z.string().max(1000),
      }),
    )
    .max(500),
});
const encode = (value: unknown) =>
  JSON.stringify(value).replaceAll('<', '\\u003c');
export function Sandbox({
  candidate,
}: {
  candidate: components['schemas']['Candidate'];
}) {
  const { api, scope } = useServices();
  const iframe = useRef<HTMLIFrameElement>(null);
  const [run] = useState(() => crypto.randomUUID());
  const [checks, setChecks] = useState<components['schemas']['Check'][]>([]);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState<unknown>();
  const source = useMemo(() => {
    try {
      const manifest: unknown = JSON.parse(candidate.source?.manifest ?? '{}');
      const fixtures: unknown = JSON.parse(candidate.source?.fixtures ?? '[]');
      const configuration: unknown = JSON.parse(
        candidate.source?.configuration ?? '{}',
      );
      return `<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' blob:; style-src 'unsafe-inline'; img-src data:;"><style>body{font:14px system-ui;padding:16px}section{border:1px solid #ddd;padding:12px;margin:8px 0}</style><main id="samples"></main><script type="module">
      const run=${encode(run)}, bundle=${encode(candidate.bundle ?? '')}, manifest=${encode(manifest)}, fixtures=${encode(fixtures)}, config=${encode(configuration)};
      const checks=[]; const record=(name,passed,message)=>checks.push({name:String(name).slice(0,200),passed:Boolean(passed),message:String(message).slice(0,1000)});
      let url;
      try {
        url=URL.createObjectURL(new Blob([bundle],{type:'text/javascript'})); await import(url);
        if(!Array.isArray(fixtures)||fixtures.length<1||fixtures.length>50) throw Error('固定样例必须为 1..50 项');
        for(const fixture of fixtures){
          for(const [family,readonly] of [['editors',false],['renderers',true]]){
            for(const view of manifest[family]||[]){
              if(!view.contentTypes?.includes(fixture.contentType)) continue;
              if(checks.length>=500) throw Error('样例/视图组合超过500项');
              const tag=view.tagName; if(!customElements.get(tag)){record(fixture.id+':'+view.id,false,'未注册声明的贡献元素');continue;}
              const element=document.createElement(tag); element.value=fixture.value; element.readonly=readonly; element.config={...(view.config||{}),...config,...(fixture.config||{})};
              const container=document.createElement('section'); container.append(element); document.getElementById('samples').append(container);
              if(element.updateComplete) await element.updateComplete;
              await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
              const text=element.textContent+' '+(element.shadowRoot?.textContent||'');
              record(fixture.id+':'+view.id, !fixture.expectedText||text.includes(fixture.expectedText), fixture.expectedText?'核对 expectedText 的呈现结果':'仅确认贡献元素挂载，未声明呈现断言');
            }
          }
        }
        if(!checks.length) record('matched_views',false,'没有与固定样例匹配的贡献');
      } catch(error){record('runtime',false,error.message||'候选运行失败');}
      finally{if(url) URL.revokeObjectURL(url); parent.postMessage({run,checks},'*');}
      </script>`;
    } catch {
      return '';
    }
  }, [candidate, run]);
  useEffect(() => {
    const listener = (event: MessageEvent<unknown>) => {
      if (event.source !== iframe.current?.contentWindow) return;
      const payload = evidenceSchema.safeParse(event.data);
      if (!payload.success || payload.data.run !== run) return;
      setChecks(payload.data.checks);
      setFinished(true);
    };
    window.addEventListener('message', listener);
    const timeout = setTimeout(() => {
      setFinished((finished) => {
        if (!finished)
          setChecks([
            {
              name: 'runtime_timeout',
              passed: false,
              message: '候选未在 15 秒内返回证据',
            },
          ]);
        return true;
      });
    }, 15000);
    return () => {
      window.removeEventListener('message', listener);
      clearTimeout(timeout);
    };
  }, [run]);
  return (
    <Section
      title="隔离浏览器验证"
      actions={
        <Command
          label="提交证据并执行服务端校验"
          disabled={!finished || !source}
          submit={async (_, headers) => {
            try {
              const bytes = await crypto.subtle.digest(
                'SHA-256',
                new TextEncoder().encode(candidate.source?.fixtures ?? ''),
              );
              const fixtureDigest = Array.from(new Uint8Array(bytes), (byte) =>
                byte.toString(16).padStart(2, '0'),
              ).join('');
              return await api.verifyPluginCandidate({
                params: { path: { tenantId: scope.tenantId }, header: headers },
                body: {
                  developmentId: candidate.developmentId ?? '',
                  candidateId: candidate.id ?? '',
                  fixtureDigest,
                  environment: candidate.environment ?? '',
                  browserEvidence: {
                    passed:
                      checks.length > 0 &&
                      checks.every((check) => check.passed),
                    checks,
                  },
                },
              });
            } catch (failure) {
              setError(failure);
              throw failure;
            }
          }}
        />
      }
    >
      <p className="mb-3 text-sm text-muted-foreground">
        候选运行在无同源权限、无管理凭据的
        iframe。浏览器证据由客户端提供；服务端独立校验。验证通过仍不代表可安装到生产。
      </p>
      {error !== undefined && <Failure error={error} />}
      {source ? (
        <iframe
          ref={iframe}
          title="插件候选隔离运行"
          sandbox="allow-scripts"
          srcDoc={source}
          className="h-80 w-full rounded-md border bg-white"
        />
      ) : (
        <p role="alert">候选的配置、Manifest 或样例不是有效 JSON。</p>
      )}
      <p role="status" className="my-3 text-sm">
        {finished ? '浏览器运行已结束' : '等待浏览器运行证据…'}
      </p>
      <Facts value={{ checks }} />
    </Section>
  );
}

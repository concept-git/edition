import { lazy, Suspense, useEffect, useReducer, useRef, useState } from 'react';
import { useBlocker } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Save, Code, FileText } from 'lucide-react';
import { useServices } from '@/shared/api/context';
import type { components } from '@/shared/api/generated/types';
import { ApiFailure } from '@/shared/api/problem';
import { EditorDraft } from '../domain/draft';
import { PageDetails } from './page-details';
import { Revisions } from './revisions';
import { Resource, Section, useResource } from '@/shared/ui/resource';
import { Failure, Pending } from '@/shared/ui/feedback';
import { Button } from '@/shared/ui/button';
import { AppLink } from '@/shared/ui/navigation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/shared/ui/resizable';
import { StateBadge } from '@/shared/ui/facts';
const Visual = lazy(() =>
  import('@/shared/editor/plate-editor').then((module) => ({
    default: module.PlateEditor,
  })),
);
const Source = lazy(() =>
  import('@/shared/editor/source-editor').then((module) => ({
    default: module.SourceEditor,
  })),
);
type Snapshot = Partial<components['schemas']['ContentSnapshot']>;

export function PageEditor() {
  const { api, scope } = useServices();
  const { tenantId, spaceId, pageId } = scope;
  const [reset, setReset] = useState(0);
  const query = useResource(['content', pageId], (signal) =>
    api.viewPageContent({
      signal,
      params: { path: { tenantId, spaceId, pageId } },
    }),
  );
  return (
    <Resource query={query}>
      {({ data, response }) => (
        <EditingSession
          key={`${pageId}:${reset}`}
          snapshot={data}
          etag={response.headers.get('ETag') ?? ''}
          reload={() => {
            void query.refetch().then((result) => {
              if (!result.isError) setReset((old) => old + 1);
            });
          }}
        />
      )}
    </Resource>
  );
}
function EditingSession({
  snapshot,
  etag,
  reload,
}: {
  snapshot: Snapshot;
  etag: string;
  reload: () => void;
}) {
  const { api, scope, actorKey } = useServices();
  const cache = useQueryClient();
  const { tenantId, spaceId, pageId } = scope;
  const path = { tenantId, spaceId, pageId };
  const [draft] = useState(() => new EditorDraft(snapshot.content ?? '', etag));
  const [, redraw] = useReducer((n) => n + 1, 0);
  const [source, setSource] = useState(true);
  const [visualKey, setVisualKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [serializing, setSerializing] = useState(false);
  const [error, setError] = useState<unknown>();
  const [preview, setPreview] = useState<string>();
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);
  const space = useResource(['space', spaceId], (signal) =>
    api.viewSpace({ signal, params: { path: { tenantId, spaceId } } }),
  );
  const details = useResource(['page', pageId], (signal) =>
    api.viewPage({ signal, params: { path } }),
  );
  useBlocker({
    shouldBlockFn: () =>
      draft.dirty &&
      !window.confirm('当前工作稿尚未保存。确认离开并丢弃本次修改？'),
    enableBeforeUnload: () => draft.dirty,
  });
  const change = (value: string) => {
    draft.edit(value);
    redraw();
  };
  const loadConflict = async (signal: AbortSignal) => {
    const latest = await api.viewPageContent({ signal, params: { path } });
    if (!signal.aborted) {
      draft.conflicted(
        latest.data.content ?? '',
        latest.response.headers.get('ETag') ?? '',
      );
      redraw();
    }
  };
  const save = async () => {
    if (saving || !draft.etag || !space.data) return;
    setSaving(true);
    setError(undefined);
    const controller = new AbortController();
    active.current = controller;
    const intent = draft.beginSave(crypto.randomUUID());
    try {
      const result = await api.editPage({
        signal: controller.signal,
        params: {
          path,
          header: { 'Idempotency-Key': intent.key, 'If-Match': intent.etag },
        },
        body: {
          content: intent.content,
          contentType: snapshot.contentType,
          versionRef: snapshot.versionRef,
          interpretation: snapshot.interpretation,
          intent: space.data.data.mode === 'synced' ? 'hotfix' : 'draft_only',
        },
      });
      if (controller.signal.aborted) return;
      const nextEtag =
        result.response.headers.get('ETag') ??
        (result.data.revision !== undefined
          ? `"rev-${result.data.revision}"`
          : '');
      if (!nextEtag)
        throw new Error('Save response did not include a baseline');
      draft.saved(intent, nextEtag);
      redraw();
      void cache.invalidateQueries({ queryKey: [actorKey, tenantId] });
      toast.success('工作稿已保存');
    } catch (failure) {
      if (!controller.signal.aborted) {
        setError(failure);
        if (failure instanceof ApiFailure && failure.code === 'edit_conflict')
          await loadConflict(controller.signal).catch(setError);
      }
    } finally {
      if (!controller.signal.aborted) setSaving(false);
      if (active.current === controller) active.current = null;
    }
  };
  const canVisual =
    ['markdown', 'html'].includes(snapshot.format ?? '') &&
    !unsupported(draft.content, snapshot.format ?? '');
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <AppLink to={`t/${tenantId}/spaces/${spaceId}/pages`}>
          ← 页面列表
        </AppLink>
        <span className="font-medium">
          {details.data?.data.title ?? '编辑页面'}
        </span>
        <StateBadge value={details.data?.data.status} />
        <span role="status" className="text-xs text-muted-foreground">
          {draft.dirty ? '有未保存修改' : '已保存到后台'}
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={saving || serializing}
            onClick={() => {
              if (
                !draft.dirty ||
                window.confirm('重新读取将丢弃当前未保存的工作稿，确认继续？')
              )
                reload();
            }}
          >
            重新读取正文
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={(source && !canVisual) || serializing}
            onClick={() => {
              setSource(!source);
              setVisualKey((key) => key + 1);
            }}
          >
            {source ? <FileText /> : <Code />}
            {source ? '可视化编辑' : '源码编辑'}
          </Button>
          <Button
            size="sm"
            disabled={
              saving ||
              serializing ||
              !draft.dirty ||
              !draft.etag ||
              !details.data?.data.allowedActions?.includes('edit')
            }
            onClick={() => {
              if (
                space.data?.data.mode !== 'synced' ||
                window.confirm(
                  '此空间的保存属于紧急热修，将触发发版并形成导入漂移。确认保存？',
                )
              )
                void save();
            }}
          >
            <Save />
            {saving ? '正在保存…' : '保存工作稿'}
          </Button>
        </div>
      </div>
      {!canVisual && (
        <p className="mb-4 text-xs text-muted-foreground">
          此内容包含源码结构，使用源码编辑保留原始内容。
        </p>
      )}
      {!draft.etag && (
        <p role="alert" className="mb-3 text-sm text-destructive">
          后台未提供编辑基线，暂不能保存。请重新读取内容。
        </p>
      )}
      {error !== undefined && (
        <div className="mb-4">
          <Failure error={error} />
        </div>
      )}
      {draft.conflict && (
        <Section title="内容冲突：本地工作稿已保留">
          <p className="mb-3 text-sm">
            先比较服务器最新内容，再编辑本地工作稿，明确采用新基线后重试保存。
          </p>
          <pre className="mb-3 max-h-72 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">
            {draft.conflict.content}
          </pre>
          <Button
            variant="outline"
            onClick={() => {
              draft.rebase(draft.content);
              redraw();
            }}
          >
            保留本地内容并采用新基线
          </Button>
        </Section>
      )}
      <Tabs defaultValue="content">
        <TabsList className="mb-4">
          <TabsTrigger value="content">正文</TabsTrigger>
          <TabsTrigger value="details">信息与进版</TabsTrigger>
          <TabsTrigger value="revisions">历史修订</TabsTrigger>
        </TabsList>
        <TabsContent value="content">
          <div className="rounded-lg border">
            <ResizablePanelGroup orientation="horizontal">
              <ResizablePanel minSize="50%">
                <Suspense fallback={<Pending />}>
                  {source ? (
                    <Source
                      value={draft.content}
                      language={snapshot.format ?? 'txt'}
                      change={change}
                      readOnly={
                        !details.data?.data.allowedActions?.includes('edit')
                      }
                    />
                  ) : (
                    <Visual
                      key={visualKey}
                      initial={draft.content}
                      format={snapshot.format ?? 'markdown'}
                      change={change}
                      pending={setSerializing}
                      readOnly={
                        !details.data?.data.allowedActions?.includes('edit')
                      }
                    />
                  )}
                </Suspense>
              </ResizablePanel>
              {preview !== undefined && (
                <>
                  <ResizableHandle withHandle />
                  <ResizablePanel minSize="25%">
                    <iframe
                      title="后台内容预览"
                      className="h-[540px] w-full bg-white"
                      sandbox=""
                      srcDoc={`<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src https: data:;">${preview}`}
                    />
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </div>
          <Button
            className="mt-3"
            variant="outline"
            onClick={() => {
              void api
                .previewPage({
                  params: { path: { tenantId, spaceId } },
                  body: {
                    format: snapshot.format ?? 'markdown',
                    content: draft.content,
                  },
                })
                .then(({ data }) => setPreview(data.html ?? ''))
                .catch(setError);
            }}
          >
            后台预览
          </Button>
        </TabsContent>
        <TabsContent value="details">
          <PageDetails />
        </TabsContent>
        <TabsContent value="revisions">
          <Revisions etag={draft.etag} onReverted={reload} />
        </TabsContent>
      </Tabs>
    </>
  );
}
function unsupported(content: string, format: string) {
  if (format === 'markdown')
    return /(!\[)|(^---\s*$)|(<\/?[A-Za-z])|(^:::+)|(^\[\^[^\]]+\]:)|(^\$\$)/m.test(
      content,
    );
  const document = new DOMParser().parseFromString(content, 'text/html');
  const allowed = new Set([
    'P',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'STRONG',
    'B',
    'I',
    'EM',
    'S',
    'DEL',
    'CODE',
    'PRE',
    'UL',
    'OL',
    'LI',
    'A',
    'TABLE',
    'THEAD',
    'TBODY',
    'TR',
    'TH',
    'TD',
    'BLOCKQUOTE',
    'BR',
    'HR',
  ]);
  return [...document.body.querySelectorAll('*')].some(
    (element) =>
      !allowed.has(element.tagName) ||
      [...element.attributes].some(
        (attribute) =>
          !['href', 'title', 'colspan', 'rowspan'].includes(attribute.name),
      ),
  );
}

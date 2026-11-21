import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useServices } from '@/shared/api/context';
import { ApiFailure } from '@/shared/api/problem';
import { isRecord } from '@/shared/api/session';
import { downloadBlob } from '@/shared/api/transfer';
import { Resource, Section, useResource } from '@/shared/ui/resource';
import { Command, TextField } from '@/shared/ui/operation-form';
import { Facts, StateBadge } from '@/shared/ui/facts';
import { DataTable, CursorPagination } from '@/shared/ui/data-table';
import { usePagination } from '@/shared/lib/pagination';
import { Input } from '@/shared/ui/input';

export function BundlesPage() {
  const { api, scope } = useServices();
  const { tenantId, spaceId } = scope;
  const path = { tenantId, spaceId };
  const [file, setFile] = useState<File>();
  const [jobId, setJobId] = useState('');
  const pages = usePagination();
  const exports = useResource(['exports', spaceId, pages.cursor], (signal) =>
    api.listBundleExports({
      signal,
      params: { path, query: { limit: 20, cursor: pages.cursor } },
    }),
  );
  const drift = useResource(['drift', spaceId], (signal) =>
    api.viewDrift({ signal, params: { path } }),
  );
  const imported = (value: unknown) => {
    if (
      isRecord(value) &&
      isRecord(value.data) &&
      isRecord(value.data.job) &&
      typeof value.data.job.id === 'string'
    )
      setJobId(value.data.job.id);
  };
  return (
    <>
      <Section
        title="导入内容包"
        actions={
          <>
            <Command
              label="上传 ZIP 包"
              identity={
                file ? `${file.name}:${file.lastModified}:${file.size}` : ''
              }
              defaults={{ method: 'direct' }}
              success={imported}
              submit={async (v, headers, signal) => {
                if (!file) throw new Error('请选择 ZIP 包');
                if (v.method === 'presigned') {
                  const { data } = await api.startImportUpload({
                    signal,
                    params: { path },
                  });
                  if (!data.putUrl || !data.uploadKey)
                    throw new Error('缺少上传地址');
                  const response = await fetch(data.putUrl, {
                    method: 'PUT',
                    body: file,
                    credentials: 'omit',
                    signal,
                  });
                  if (!response.ok) throw new ApiFailure(response, null);
                  return api.importRelease({
                    signal,
                    params: { path, header: headers },
                    body: { uploadKey: data.uploadKey },
                  });
                }
                return api.importRelease({
                  signal,
                  params: { path, header: headers },
                  headers: { 'Content-Type': 'application/zip' },
                  body: file,
                  bodySerializer: (body) =>
                    body instanceof Blob ? body : JSON.stringify(body),
                });
              }}
            >
              <label className="grid gap-2 text-sm">
                内容包
                <input
                  type="file"
                  accept=".zip,application/zip"
                  required
                  onChange={(e) => setFile(e.target.files?.[0])}
                />
              </label>
              <TextField
                name="method"
                label="上传方式"
                options={['direct', 'presigned']}
              />
            </Command>
            <Command
              label="从公开 HTTPS 导入"
              success={imported}
              description="后台仅执行一次拉取，不保存上游凭据，也不建立定时同步。"
              submit={(v, headers, signal) =>
                api.importRelease({
                  signal,
                  params: { path, header: headers },
                  body: { url: v.url },
                })
              }
            >
              <TextField name="url" label="公开 ZIP 包地址" type="url" />
            </Command>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          导入适用于外部同步空间。校验、漂移确认、主版本和逐站交付分别展示结果。
        </p>
        <label className="mt-4 block text-sm">
          查看导入作业
          <Input
            className="mt-2 max-w-lg"
            placeholder="导入作业 ID"
            value={jobId}
            onChange={(event) => setJobId(event.target.value)}
          />
        </label>
        {jobId && <ImportStatus key={jobId} jobId={jobId} />}
      </Section>
      <Section title="导入漂移">
        <Resource query={drift}>
          {({ data }) => <Facts value={data} />}
        </Resource>
      </Section>
      <Section
        title="导出 Bundle"
        actions={
          <Command
            label="请求导出"
            description="导出固定发版为 Bundle ZIP，完成后可下载。"
            submit={(v, headers) =>
              api.requestBundleExport({
                params: { path, header: headers },
                body: { releaseId: v.releaseId },
              })
            }
          >
            <TextField name="releaseId" label="发版 ID" />
          </Command>
        }
      >
        <Resource query={exports}>
          {({ data }) => (
            <>
              <DataTable
                rows={data.items ?? []}
                rowId={(row) => row.id ?? ''}
                columns={[
                  { id: 'id', title: '导出', render: (row) => row.id },
                  {
                    id: 'status',
                    title: '状态',
                    render: (row) => <StateBadge value={row.status} />,
                  },
                  {
                    id: 'action',
                    title: '操作',
                    render: (row) => {
                      const target = { ...path, jobId: row.id ?? '' };
                      return (
                        <div className="flex flex-wrap gap-2">
                          <Command
                            label="查看详情"
                            submit={() =>
                              api.viewBundleExport({ params: { path: target } })
                            }
                          />
                          <Command
                            label="重试导出"
                            submit={(_, headers) =>
                              api.retryBundleExport({
                                params: { path: target, header: headers },
                              })
                            }
                          />
                          <Command
                            label="下载 Bundle"
                            submit={async () => {
                              const result = await api.downloadBundleExport({
                                params: { path: target },
                              });
                              downloadBlob(
                                result.data,
                                `edition-${row.releaseId}.zip`,
                              );
                            }}
                          />
                        </div>
                      );
                    },
                  },
                ]}
              />
              <CursorPagination pages={pages} nextCursor={data.nextCursor} />
            </>
          )}
        </Resource>
      </Section>
    </>
  );
}
function ImportStatus({ jobId }: { jobId: string }) {
  const { api, scope, actorKey } = useServices();
  const { tenantId, spaceId } = scope;
  const query = useQuery({
    queryKey: [actorKey, tenantId, 'import-job', spaceId, jobId],
    queryFn: ({ signal }) =>
      api.viewImportJob({
        signal,
        params: { path: { tenantId, spaceId, jobId } },
      }),
    refetchInterval: (query) => {
      const job = query.state.data?.data;
      return !job || job.terminal || job.nextPollAfterSeconds == null
        ? false
        : Math.max(1, job.nextPollAfterSeconds) * 1000;
    },
  });
  return (
    <div className="mt-4">
      <Resource query={query}>{({ data }) => <Facts value={data} />}</Resource>
    </div>
  );
}

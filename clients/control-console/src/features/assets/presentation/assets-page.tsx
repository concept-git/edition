import { PagePicker } from '@/features/page-authoring';
import { useState } from 'react';
import { useServices } from '@/shared/api/context';
import { Resource, Section, useResource } from '@/shared/ui/resource';
import { Command } from '@/shared/ui/operation-form';
import { DataTable, CursorPagination } from '@/shared/ui/data-table';
import { AppLink } from '@/shared/ui/navigation';
import { usePagination } from '@/shared/lib/pagination';
import { downloadBlob } from '@/shared/api/transfer';

export function AssetsPage() {
  const { api, scope } = useServices();
  const { tenantId, spaceId } = scope;
  const path = { tenantId, spaceId };
  const pages = usePagination();
  const [file, setFile] = useState<File>();
  const query = useResource(['attachments', spaceId, pages.cursor], (signal) =>
    api.listSpaceAttachments({
      signal,
      params: { path, query: { limit: 20, cursor: pages.cursor } },
    }),
  );
  return (
    <Section
      title="空间附件"
      actions={
        <Command
          label="上传页面附件"
          identity={
            file ? `${file.name}:${file.lastModified}:${file.size}` : ''
          }
          submit={async (v, headers, signal) => {
            if (!file) throw new Error('请选择附件');
            return api.attachPageFile({
              signal,
              params: { path: { ...path, pageId: v.pageId }, header: headers },
              body: { file },
            });
          }}
        >
          <PagePicker label="所属页面" />
          <label className="grid gap-2 text-sm">
            选择文件
            <input
              type="file"
              required
              onChange={(event) => setFile(event.target.files?.[0])}
              className="rounded-md border p-2"
            />
          </label>
        </Command>
      }
    >
      <Resource query={query}>
        {({ data }) => (
          <>
            <DataTable
              rows={data.items ?? []}
              rowId={(row) => row.id ?? ''}
              columns={[
                { id: 'name', title: '文件', render: (row) => row.filename },
                {
                  id: 'page',
                  title: '所属页面',
                  render: (row) => (
                    <AppLink
                      to={`t/${tenantId}/spaces/${spaceId}/pages/${row.pageId}`}
                    >
                      {row.pageTitle ?? row.pageId}
                    </AppLink>
                  ),
                },
                {
                  id: 'size',
                  title: '大小',
                  render: (row) => `${row.sizeBytes ?? 0} bytes`,
                },
                {
                  id: 'action',
                  title: '操作',
                  render: (row) => {
                    const target = {
                      ...path,
                      pageId: row.pageId ?? '',
                      ref: row.id ?? '',
                    };
                    return (
                      <div className="flex flex-wrap gap-2">
                        <Command
                          label="查看附件引用"
                          submit={() =>
                            api.viewPageAttachment({ params: { path: target } })
                          }
                        />
                        <Command
                          label="下载"
                          submit={async () => {
                            const result = await api.downloadPageAttachment({
                              params: { path: target },
                            });
                            downloadBlob(
                              result.data,
                              row.filename ?? 'attachment',
                            );
                          }}
                        />
                        <Command
                          label="移除"
                          danger
                          submit={(_, headers) =>
                            api.detachPageFile({
                              params: { path: target, header: headers },
                            })
                          }
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
  );
}

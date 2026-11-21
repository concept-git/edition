import { useServices } from '@/shared/api/context';
import { Section, Resource, useResource } from '@/shared/ui/resource';
import { Command, TextField } from '@/shared/ui/operation-form';
import { DataTable, CursorPagination } from '@/shared/ui/data-table';
import { usePagination } from '@/shared/lib/pagination';

export function Revisions({
  etag,
  onReverted,
}: {
  etag: string;
  onReverted: () => void;
}) {
  const { api, scope } = useServices();
  const { tenantId, spaceId, pageId } = scope;
  const path = { tenantId, spaceId, pageId };
  const pages = usePagination('revisionsPage');
  const query = useResource(['revisions', pageId, pages.cursor], (signal) =>
    api.listPageRevisions({
      signal,
      params: { path, query: { limit: 20, cursor: pages.cursor } },
    }),
  );
  return (
    <Section
      title="历史修订"
      actions={
        <Command
          label="比较修订"
          submit={(v) =>
            api.diffPageRevisions({
              params: {
                path,
                query: { from: Number(v.from), to: Number(v.to) },
              },
            })
          }
        >
          <TextField name="from" label="起始修订号" type="number" />
          <TextField name="to" label="目标修订号" type="number" />
        </Command>
      }
    >
      <Resource query={query}>
        {({ data }) => (
          <>
            <DataTable
              rows={data.items ?? []}
              rowId={(row) => String(row.n)}
              columns={[
                { id: 'n', title: '修订', render: (row) => String(row.n) },
                {
                  id: 'time',
                  title: '记录时间',
                  render: (row) => <span>{row.createdAt}</span>,
                },
                {
                  id: 'actions',
                  title: '操作',
                  render: (row) => (
                    <div className="flex flex-wrap gap-2">
                      <Command
                        label="查看内容"
                        submit={() =>
                          api.viewPageRevision({
                            params: { path: { ...path, revision: row.n ?? 0 } },
                          })
                        }
                      />
                      <Command
                        label="取回此修订"
                        danger
                        description="取回将产生新的编辑修订，当前工作稿需先保存或复制。"
                        submit={(_, headers) =>
                          api.revertPage({
                            params: {
                              path,
                              header: { ...headers, 'If-Match': etag },
                            },
                            body: { n: row.n },
                          })
                        }
                        success={onReverted}
                      />
                    </div>
                  ),
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

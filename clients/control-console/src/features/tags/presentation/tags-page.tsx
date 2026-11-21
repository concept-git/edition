import { PagedDialog } from '@/shared/ui/paged-dialog';
import { Facts } from '@/shared/ui/facts';
import { useServices } from '@/shared/api/context';
import { PageHeading, Resource, useResource } from '@/shared/ui/resource';
import { Command, TextField } from '@/shared/ui/operation-form';
import { DataTable, CursorPagination } from '@/shared/ui/data-table';
import { usePagination } from '@/shared/lib/pagination';
export function TagsPage() {
  const { api, scope } = useServices();
  const { tenantId } = scope;
  const pages = usePagination();
  const query = useResource(['tags', pages.cursor], (signal) =>
    api.listTags({
      signal,
      params: {
        path: { tenantId },
        query: { limit: 20, cursor: pages.cursor },
      },
    }),
  );
  return (
    <>
      <PageHeading title="标签" description="通过标签跨空间聚合页面。" />
      <Resource query={query}>
        {({ data }) => (
          <>
            <DataTable
              rows={data.items ?? []}
              rowId={(row) => row.label ?? ''}
              columns={[
                { id: 'label', title: '标签', render: (row) => row.label },
                {
                  id: 'facts',
                  title: '关联',
                  render: (row) => (
                    <PagedDialog
                      label="查看页面"
                      title={`${row.label} · 关联页面`}
                      queryKey={['tagged-pages', row.label]}
                      load={(signal, cursor) =>
                        api.listTaggedPages({
                          signal,
                          params: {
                            path: { tenantId, label: row.label ?? '' },
                            query: { limit: 20, cursor },
                          },
                        })
                      }
                    >
                      {({ data }) => <Facts value={data.items} />}
                    </PagedDialog>
                  ),
                },
                {
                  id: 'rename',
                  title: '操作',
                  render: (row) => (
                    <Command
                      label="重命名标签"
                      submit={(v, headers) =>
                        api.renameTag({
                          params: {
                            path: { tenantId, label: row.label ?? '' },
                            header: headers,
                          },
                          body: { to: v.to },
                        })
                      }
                    >
                      <TextField name="to" label="新标签" />
                    </Command>
                  ),
                },
              ]}
            />
            <CursorPagination pages={pages} nextCursor={data.nextCursor} />
          </>
        )}
      </Resource>
    </>
  );
}

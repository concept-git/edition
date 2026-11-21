import { useServices } from '@/shared/api/context';
import {
  PageHeading,
  Resource,
  Section,
  useResource,
} from '@/shared/ui/resource';
import { Command, TextField, commaValues } from '@/shared/ui/operation-form';
import { DataTable, CursorPagination } from '@/shared/ui/data-table';
import { Facts } from '@/shared/ui/facts';
import { usePagination } from '@/shared/lib/pagination';
import { parseContract } from '@/shared/api/validation';

export function DomainsPage() {
  const { api, scope } = useServices();
  const { tenantId, siteId } = scope;
  const pages = usePagination();
  const query = useResource(['domains', siteId, pages.cursor], (signal) =>
    api.listTenantDomains({
      signal,
      params: {
        path: { tenantId },
        query: {
          limit: 20,
          cursor: pages.cursor,
          ...(siteId ? { siteId } : {}),
        },
      },
    }),
  );
  return (
    <>
      {!siteId && (
        <PageHeading title="域名" description="查看域名归属和验证状态。" />
      )}
      <Section
        title="站点域名"
        actions={
          siteId && (
            <Command
              label="绑定域名"
              submit={(v, headers) =>
                api.bindDomain({
                  params: { path: { tenantId, siteId }, header: headers },
                  body: { host: v.host },
                })
              }
            >
              <TextField name="host" label="域名" />
            </Command>
          )
        }
      >
        <Resource query={query}>
          {({ data }) => (
            <>
              <DataTable
                rows={data.items ?? []}
                rowId={(row) => row.host ?? ''}
                columns={[
                  { id: 'host', title: '域名', render: (row) => row.host },
                  {
                    id: 'state',
                    title: '状态',
                    render: (row) => <Facts value={row} />,
                  },
                  {
                    id: 'actions',
                    title: '操作',
                    render: (row) => {
                      const path = {
                        tenantId,
                        siteId: siteId || row.siteId || '',
                        host: row.host ?? '',
                      };
                      return (
                        <div className="flex flex-wrap gap-2">
                          <Command
                            label="查看核验记录"
                            submit={() => api.viewDomain({ params: { path } })}
                          />
                          <Command
                            label="核验域名"
                            submit={(_, headers) =>
                              api.verifyDomain({
                                params: { path, header: headers },
                              })
                            }
                          />
                          <Command
                            label="设为主域名"
                            submit={(_, headers) =>
                              api.setPrimaryDomain({
                                params: { path, header: headers },
                              })
                            }
                          />
                          <Command
                            label="解绑"
                            danger
                            submit={(_, headers) =>
                              api.unbindDomain({
                                params: { path, header: headers },
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
    </>
  );
}
export function RedirectsPage() {
  const { api, scope } = useServices();
  const { tenantId, siteId } = scope;
  const path = { tenantId, siteId };
  const pages = usePagination();
  const query = useResource(['redirects', siteId, pages.cursor], (signal) =>
    api.listRedirects({
      signal,
      params: { path, query: { limit: 20, cursor: pages.cursor } },
    }),
  );
  return (
    <Section
      title="重定向"
      actions={
        <Command
          label="创建重定向"
          defaults={{ targetType: 'page' }}
          submit={(v, headers) =>
            api.createRedirect({
              params: { path, header: headers },
              body: {
                path: v.path,
                targetType: v.targetType,
                targetId: v.targetId,
              },
            })
          }
        >
          <TextField name="path" label="旧地址路径" />
          <TextField
            name="targetType"
            label="目标类型"
            options={['space', 'page']}
          />
          <TextField name="targetId" label="目标 ID" />
        </Command>
      }
    >
      <Resource query={query}>
        {({ data }) => (
          <>
            <DataTable
              rows={data.items ?? []}
              rowId={(row) => row.path ?? ''}
              columns={[
                { id: 'path', title: '旧路径', render: (row) => row.path },
                {
                  id: 'target',
                  title: '目标',
                  render: (row) => <Facts value={row} />,
                },
                {
                  id: 'action',
                  title: '操作',
                  render: (row) => (
                    <Command
                      label="移除重定向"
                      danger
                      submit={(_, headers) =>
                        api.deleteRedirect({
                          params: {
                            path,
                            query: { path: row.path ?? '' },
                            header: headers,
                          },
                        })
                      }
                    />
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
export function SearchSettingsPage() {
  const { api, scope } = useServices();
  const { tenantId, siteId } = scope;
  const path = { tenantId, siteId };
  const query = useResource(['search-settings', siteId], (signal) =>
    api.searchConfiguration({ signal, params: { path } }),
  );
  return (
    <Section
      title="搜索配置"
      actions={
        <>
          <Command
            label="设置字段优先级"
            defaults={{ fields: 'title,headings,body' }}
            submit={async (v, headers) =>
              api.configureSearch({
                params: { path, header: headers },
                body: await parseContract('Fields', {
                  fields: commaValues(v.fields),
                }),
              })
            }
          >
            <TextField
              name="fields"
              label="按优先顺序填写 title、headings、body"
            />
          </Command>
          <Command
            label="重建索引"
            submit={(_, headers) =>
              api.reindexSearch({
                params: { header: headers },
                body: { tenantId, siteId },
              })
            }
          />
        </>
      }
    >
      <Resource query={query}>{({ data }) => <Facts value={data} />}</Resource>
    </Section>
  );
}
export function DeliveryPage() {
  const { api, scope } = useServices();
  const { tenantId, siteId } = scope;
  const path = { tenantId, siteId };
  const query = useResource(['delivery', siteId], (signal) =>
    api.siteDeliveryStatus({ signal, params: { path } }),
  );
  return (
    <Section
      title="站点实际交付"
      actions={
        <>
          <Command
            label="重新读取交付状态"
            submit={() => api.siteDeliveryStatus({ params: { path } })}
          />
          <Command
            label="重试交付"
            submit={(_, headers) =>
              api.retrySiteDelivery({ params: { path, header: headers } })
            }
          />
        </>
      }
    >
      <p className="mb-4 text-sm text-muted-foreground">
        主版本已选择不等于站点已上线。交付失败时按后台提供的旧版本和安全屏障状态显示。
      </p>
      <Resource query={query}>{({ data }) => <Facts value={data} />}</Resource>
    </Section>
  );
}

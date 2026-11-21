import { PagedDialog } from '@/shared/ui/paged-dialog';
import { useServices } from '@/shared/api/context';
import { PageHeading, Resource, useResource } from '@/shared/ui/resource';
import { Command, TextField, commaValues } from '@/shared/ui/operation-form';
import { DataTable, CursorPagination } from '@/shared/ui/data-table';
import { StateBadge, Facts } from '@/shared/ui/facts';
import { usePagination } from '@/shared/lib/pagination';
import { parseContract } from '@/shared/api/validation';
export function WebhooksPage() {
  const { api, scope } = useServices();
  const { tenantId } = scope;
  const pages = usePagination();
  const query = useResource(['webhooks', pages.cursor], (signal) =>
    api.listWebhooks({
      signal,
      params: { query: { tenantId, limit: 20, cursor: pages.cursor } },
    }),
  );
  return (
    <>
      <PageHeading
        title="Webhook"
        description="配置机器通知，检查每次投递及失败恢复。"
        actions={
          <Command
            label="创建 Webhook"
            defaults={{ scopeType: 'tenant', active: 'true' }}
            submit={async (v, headers) =>
              api.createWebhook({
                params: { query: { tenantId }, header: headers },
                body: await parseContract('WebhookConfiguration', {
                  url: v.url,
                  scopeType: v.scopeType,
                  ...(v.scopeId ? { scopeId: v.scopeId } : {}),
                  events: commaValues(v.events),
                  active: v.active === 'true',
                }),
              })
            }
          >
            <WebhookFields />
          </Command>
        }
      />
      <Resource query={query}>
        {({ data }) => (
          <>
            <DataTable
              rows={data.items ?? []}
              rowId={(row) => row.id ?? ''}
              columns={[
                { id: 'url', title: '目标地址', render: (row) => row.url },
                {
                  id: 'active',
                  title: '状态',
                  render: (row) => (
                    <StateBadge value={row.active ? 'active' : 'disabled'} />
                  ),
                },
                {
                  id: 'actions',
                  title: '操作',
                  render: (row) => (
                    <div className="flex flex-wrap gap-2">
                      <Command
                        label="修改配置"
                        defaults={{
                          url: row.url ?? '',
                          scopeType: row.scopeType ?? 'tenant',
                          scopeId: row.scopeId ?? '',
                          events: row.events?.join(',') ?? '',
                          active: String(row.active ?? true),
                        }}
                        submit={async (v, headers) =>
                          api.updateWebhook({
                            params: {
                              path: { id: row.id ?? '' },
                              query: { tenantId },
                              header: headers,
                            },
                            body: await parseContract('WebhookConfiguration', {
                              url: v.url,
                              scopeType: v.scopeType,
                              ...(v.scopeId ? { scopeId: v.scopeId } : {}),
                              events: commaValues(v.events),
                              active: v.active === 'true',
                            }),
                          })
                        }
                      >
                        <WebhookFields />
                      </Command>
                      <Command
                        label="轮换密钥"
                        danger
                        description="服务器返回的新秘密仅展示一次。更新接收端配置后继续验证投递。"
                        submit={(_, headers) =>
                          api.rotateWebhook({
                            params: {
                              path: { id: row.id ?? '' },
                              query: { tenantId },
                              header: headers,
                            },
                          })
                        }
                      />
                      <PagedDialog
                        label="投递记录"
                        queryKey={['webhook-deliveries', row.id]}
                        load={(signal, cursor) =>
                          api.listWebhookDeliveries({
                            signal,
                            params: {
                              path: { id: row.id ?? '' },
                              query: { tenantId, limit: 20, cursor },
                            },
                          })
                        }
                      >
                        {({ data }) => <Facts value={data.items} />}
                      </PagedDialog>
                      <Command
                        label="重新投递"
                        submit={(v, headers) =>
                          api.redeliverWebhook({
                            params: {
                              path: {
                                id: row.id ?? '',
                                deliveryId: v.deliveryId,
                              },
                              query: { tenantId },
                              header: headers,
                            },
                          })
                        }
                      >
                        <TextField name="deliveryId" label="投递记录 ID" />
                      </Command>
                    </div>
                  ),
                },
                {
                  id: 'events',
                  title: '事件',
                  render: (row) => <Facts value={{ events: row.events }} />,
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
function WebhookFields() {
  return (
    <>
      <TextField name="url" label="接收地址" type="url" />
      <TextField
        name="scopeType"
        label="作用域"
        options={['tenant', 'space', 'site']}
      />
      <TextField name="scopeId" label="空间或站点 ID" required={false} />
      <TextField name="events" label="事件名称，以逗号分隔" />
      <TextField name="active" label="启用" options={['true', 'false']} />
    </>
  );
}

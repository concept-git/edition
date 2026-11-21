import { useServices } from '@/shared/api/context';
import {
  Resource,
  Section,
  PageHeading,
  useResource,
} from '@/shared/ui/resource';
import { Command, TextField } from '@/shared/ui/operation-form';
import { DataTable, CursorPagination } from '@/shared/ui/data-table';
import { StateBadge, dateText } from '@/shared/ui/facts';
import { AppLink } from '@/shared/ui/navigation';
import { usePagination } from '@/shared/lib/pagination';

export function ReleasesPage() {
  const { api, scope } = useServices();
  const { tenantId, spaceId } = scope;
  const path = { tenantId, spaceId };
  const pages = usePagination();
  const query = useResource(
    ['releases', spaceId, pages.cursor],
    async (signal) =>
      spaceId
        ? (
            await api.listReleases({
              signal,
              params: { path, query: { limit: 20, cursor: pages.cursor } },
            })
          ).data
        : (
            await api.listTenantReleases({
              signal,
              params: {
                path: { tenantId },
                query: { limit: 20, cursor: pages.cursor },
              },
            })
          ).data,
  );
  return (
    <>
      {!spaceId && (
        <PageHeading
          title="全部发版"
          description="查看各空间的不可变内容快照。站点实际交付状态需进入站点确认。"
        />
      )}
      <Section
        title="发版记录"
        actions={
          spaceId && (
            <>
              <Command
                label="构建发版"
                description="后台将装载工作区、执行校验并按规则决定主版本。请求受理不等于站点上线。"
                submit={(_, headers) =>
                  api.buildRelease({ params: { path, header: headers } })
                }
              />
              <Command
                label="比较发版"
                submit={(v) =>
                  api.diffReleases({
                    params: { path, query: { from: v.from, to: v.to } },
                  })
                }
              >
                <TextField name="from" label="起始发版 ID" />
                <TextField name="to" label="目标发版 ID" />
              </Command>
            </>
          )
        }
      >
        <Resource query={query}>
          {(data) => (
            <>
              <DataTable
                rows={data.items ?? []}
                rowId={(row) => row.id ?? ''}
                columns={[
                  {
                    id: 'name',
                    title: '发版',
                    render: (row) => (
                      <span className="font-medium">{row.label || row.id}</span>
                    ),
                  },
                  {
                    id: 'status',
                    title: '状态',
                    render: (row) => <StateBadge value={row.status} />,
                  },
                  {
                    id: 'pages',
                    title: '页面',
                    render: (row) => row.pageCount,
                  },
                  {
                    id: 'created',
                    title: '构建时间',
                    render: (row) => dateText(row.createdAt),
                  },
                  {
                    id: 'action',
                    title: '操作',
                    render: (row) => {
                      const selectedSpace =
                        spaceId ||
                        ('spaceId' in row && typeof row.spaceId === 'string'
                          ? row.spaceId
                          : '');
                      const target = {
                        tenantId,
                        spaceId: selectedSpace,
                        releaseId: row.id ?? '',
                      };
                      return (
                        <div className="flex flex-wrap gap-2">
                          <Command
                            label="查看详情"
                            submit={() =>
                              api.viewRelease({ params: { path: target } })
                            }
                          />
                          <Command
                            label="修改说明"
                            submit={(v, headers) =>
                              api.patchRelease({
                                params: { path: target, header: headers },
                                body: {
                                  label: v.label || null,
                                  notes: v.notes || null,
                                },
                              })
                            }
                          >
                            <TextField
                              name="label"
                              label="标签"
                              required={false}
                            />
                            <TextField
                              name="notes"
                              label="说明"
                              required={false}
                              multiline
                            />
                          </Command>
                          <Command
                            label="晋升主版本"
                            disabled={!row.allowedActions?.includes('promote')}
                            submit={(_, headers) =>
                              api.promoteRelease({
                                params: { path: target, header: headers },
                              })
                            }
                          />
                          <Command
                            label="回滚至此版本"
                            danger
                            disabled={!row.allowedActions?.includes('rollback')}
                            submit={(_, headers) =>
                              api.rollbackRelease({
                                params: { path: target, header: headers },
                              })
                            }
                          />
                          <Command
                            label="丢弃草稿"
                            danger
                            disabled={!row.allowedActions?.includes('discard')}
                            submit={(_, headers) =>
                              api.discardRelease({
                                params: { path: target, header: headers },
                              })
                            }
                          />
                          <Command
                            label="确认导入发版"
                            disabled={!row.allowedActions?.includes('approve')}
                            submit={(_, headers) =>
                              api.approveRelease({
                                params: { path: target, header: headers },
                              })
                            }
                          />
                          <Command
                            label="预览页面列表"
                            submit={() =>
                              api.listReleasePreviewPages({
                                params: { path: target },
                              })
                            }
                          />
                          <Command
                            label="预览页面"
                            submit={(v) =>
                              api.previewReleaseByPageId({
                                params: {
                                  path: { ...target, pageId: v.pageId },
                                },
                              })
                            }
                          >
                            <TextField name="pageId" label="页面 ID" />
                          </Command>
                          <AppLink
                            to={`t/${tenantId}/spaces/${selectedSpace}/bundles`}
                          >
                            导出
                          </AppLink>
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

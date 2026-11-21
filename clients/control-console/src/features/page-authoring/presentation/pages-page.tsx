import type { components } from '@/shared/api/generated/types';
import { useState } from 'react';
import { useServices } from '@/shared/api/context';
import { Resource, Section, useResource } from '@/shared/ui/resource';
import { Command, TextField } from '@/shared/ui/operation-form';
import { DataTable, Pagination } from '@/shared/ui/data-table';
import { StateBadge, dateText } from '@/shared/ui/facts';
import { AppLink } from '@/shared/ui/navigation';
import { usePagination, useFilter } from '@/shared/lib/pagination';
import { Input } from '@/shared/ui/input';

export function PagesPage({ trash = false }: { trash?: boolean }) {
  const { api, scope } = useServices();
  const { tenantId, spaceId } = scope;
  const path = { tenantId, spaceId };
  const pagination = usePagination();
  const [filter, setFilter] = useFilter('q');
  const [selected, setSelected] = useState<string[]>([]);
  const query = useResource<{
    data: {
      items?: Pick<
        components['schemas']['PageSummary'],
        'id' | 'title' | 'slug' | 'status' | 'format' | 'updatedAt'
      >[];
      nextCursor?: string | null;
    };
    response: Response;
  }>(['pages', spaceId, trash, filter, pagination.cursor], (signal) =>
    trash
      ? api.listTrash({
          signal,
          params: { path, query: { limit: 20, cursor: pagination.cursor } },
        })
      : api.listPages({
          signal,
          params: {
            path,
            query: {
              limit: 20,
              cursor: pagination.cursor,
              q: filter || undefined,
            },
          },
        }),
  );
  return (
    <Section
      title={trash ? '回收记录' : '工作区页面'}
      actions={
        <>
          {!trash && (
            <Command
              label="创建页面"
              defaults={{ format: 'markdown' }}
              submit={(v, headers) =>
                api.createPage({
                  params: { path, header: headers },
                  body: {
                    title: v.title,
                    slug: v.slug,
                    format: v.format,
                    ...(v.contentType ? { contentType: v.contentType } : {}),
                    ...(v.versionRef ? { versionRef: v.versionRef } : {}),
                  },
                })
              }
            >
              <TextField name="title" label="标题" />
              <TextField name="slug" label="页面相对路径" />
              <TextField
                name="format"
                label="存储格式"
                options={['markdown', 'html', 'txt', 'json', 'xml']}
              />
              <TextField name="contentType" label="内容类型" required={false} />
              <TextField
                name="versionRef"
                label="固定定义版本"
                required={false}
              />
            </Command>
          )}
          {!trash && (
            <>
              <Command
                label={`所选进版 (${selected.length})`}
                disabled={!selected.length}
                description="将所选页面标为可发版；自动发版空间可能同时触发构建。"
                submit={(_, headers) =>
                  api.publishPages({
                    params: { path, header: headers },
                    body: { ids: selected },
                  })
                }
              />
              <Command
                label="所选撤销进版"
                disabled={!selected.length}
                submit={(_, headers) =>
                  api.unpublishPages({
                    params: { path, header: headers },
                    body: { ids: selected },
                  })
                }
              />
              <Command
                label="读取所选内容"
                disabled={!selected.length}
                submit={() =>
                  api.batchGetPages({
                    params: { path },
                    body: { ids: selected, view: 'content' },
                  })
                }
              />
            </>
          )}
        </>
      }
    >
      {!trash && (
        <Input
          className="mb-4 max-w-sm"
          aria-label="搜索页面"
          placeholder="按标题或内容搜索工作稿…"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setSelected([]);
          }}
        />
      )}
      {selected.length > 0 && (
        <p className="mb-3 text-xs text-muted-foreground">
          已选择当前页 {selected.length} 项
        </p>
      )}
      <Resource query={query}>
        {({ data }) => (
          <>
            <DataTable
              rows={data.items ?? []}
              rowId={(row) => row.id ?? ''}
              selected={selected}
              onSelect={trash ? undefined : setSelected}
              columns={[
                {
                  id: 'title',
                  title: '页面',
                  render: (row) => (
                    <div>
                      <AppLink
                        className="font-medium"
                        to={`t/${tenantId}/spaces/${spaceId}/pages/${row.id}`}
                      >
                        {row.title ?? row.slug}
                      </AppLink>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {row.slug}
                      </p>
                    </div>
                  ),
                },
                {
                  id: 'status',
                  title: '状态',
                  render: (row) => <StateBadge value={row.status} />,
                },
                { id: 'format', title: '格式', render: (row) => row.format },
                {
                  id: 'updated',
                  title: '更新',
                  render: (row) => dateText(row.updatedAt),
                },
                {
                  id: 'action',
                  title: '操作',
                  render: (row) =>
                    trash ? (
                      <Command
                        label="还原页面"
                        submit={(_, headers) =>
                          api.restorePage({
                            params: {
                              path: { ...path, pageId: row.id ?? '' },
                              header: headers,
                            },
                          })
                        }
                      />
                    ) : (
                      <AppLink
                        to={`t/${tenantId}/spaces/${spaceId}/pages/${row.id}`}
                      >
                        编辑
                      </AppLink>
                    ),
                },
              ]}
            />
            <Pagination
              previous={() => {
                pagination.previous();
                setSelected([]);
              }}
              next={() => {
                pagination.next(data.nextCursor);
                setSelected([]);
              }}
              hasPrevious={pagination.hasPrevious}
              hasNext={Boolean(data.nextCursor)}
            />
          </>
        )}
      </Resource>
    </Section>
  );
}

import { useState } from 'react';
import { useServices } from '@/shared/api/context';
import {
  PageHeading,
  Section,
  Resource,
  useResource,
} from '@/shared/ui/resource';
import { Command, TextField } from '@/shared/ui/operation-form';
import { Facts, StateBadge } from '@/shared/ui/facts';
import { Input } from '@/shared/ui/input';
import { DataTable, CursorPagination } from '@/shared/ui/data-table';
import { usePagination } from '@/shared/lib/pagination';

export function TerminationPage() {
  const { api, scope } = useServices();
  const { tenantId, spaceId, siteId } = scope;
  const [name, setName] = useState('');
  const plan = useResource(
    ['termination', spaceId || siteId, name],
    async (signal) =>
      spaceId
        ? (
            await api.planSpaceTermination({
              signal,
              params: {
                path: { tenantId, spaceId },
                query: { confirmationName: name },
              },
            })
          ).data
        : (
            await api.planSiteTermination({
              signal,
              params: {
                path: { tenantId, siteId },
                query: { confirmationName: name },
              },
            })
          ).data,
    Boolean(name),
  );
  return (
    <Section title="删除影响与确认">
      <p className="mb-4 text-sm">
        输入资源完整名称，先读取服务器的影响计划。计划中未能确认的影响会保持可见。
      </p>
      <label className="block text-sm">
        确认名称
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="my-3 max-w-md"
        />
      </label>
      {name && (
        <Resource query={plan}>
          {(data) => (
            <>
              <Facts value={data} />
              <div className="mt-4">
                <Command
                  label="永久删除资源"
                  danger
                  defaults={{ confirmationName: name }}
                  submit={(v, headers) =>
                    spaceId
                      ? api.deleteSpace({
                          params: {
                            path: { tenantId, spaceId },
                            header: headers,
                          },
                          body: { confirmationName: v.confirmationName },
                        })
                      : api.deleteSite({
                          params: {
                            path: { tenantId, siteId },
                            header: headers,
                          },
                          body: { confirmationName: v.confirmationName },
                        })
                  }
                >
                  <TextField name="confirmationName" label="再次确认资源名称" />
                </Command>
              </div>
            </>
          )}
        </Resource>
      )}
    </Section>
  );
}
export function DeletionsPage() {
  const { api, scope } = useServices();
  const { tenantId } = scope;
  const pages = usePagination('page');
  const query = useResource(['deletions', pages.cursor], (signal) =>
    api.listDeletions({
      signal,
      params: {
        path: { tenantId },
        query: { limit: 20, cursor: pages.cursor },
      },
    }),
  );
  return (
    <>
      <PageHeading
        title="资源清理"
        description="业务删除已提交和物理清理已完成是不同状态。"
      />
      <Resource query={query}>
        {({ data }) => (
          <>
            <DataTable
              rows={data.items ?? []}
              rowId={(row) => row.resourceId ?? ''}
              columns={[
                { id: 'id', title: '资源', render: (row) => row.resourceId },
                {
                  id: 'type',
                  title: '类型',
                  render: (row) => row.resourceType,
                },
                {
                  id: 'status',
                  title: '状态',
                  render: (row) => <StateBadge value={row.status} />,
                },
                {
                  id: 'details',
                  title: '详情',
                  render: (row) => <Facts value={row} />,
                },
                {
                  id: 'action',
                  title: '操作',
                  render: (row) => (
                    <Command
                      label="重试清理"
                      submit={(_, headers) =>
                        api.retryDeletion({
                          params: {
                            path: {
                              tenantId,
                              resourceId: row.resourceId ?? '',
                            },
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
    </>
  );
}

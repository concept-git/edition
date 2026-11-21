import { useState } from 'react';
import { useServices } from '@/shared/api/context';
import {
  PageHeading,
  Resource,
  Section,
  useResource,
} from '@/shared/ui/resource';
import { Command, TextField } from '@/shared/ui/operation-form';
import { DataTable, Pagination } from '@/shared/ui/data-table';
import { Facts } from '@/shared/ui/facts';
import { Input } from '@/shared/ui/input';
import { usePagination } from '@/shared/lib/pagination';
import { downloadBlob } from '@/shared/api/transfer';

export function AuditPage() {
  const { api, scope } = useServices();
  const { tenantId } = scope;
  const pages = usePagination();
  const [action, setAction] = useState('');
  const query = useResource(['audit', action, pages.cursor], (signal) =>
    api.listAudit({
      signal,
      params: {
        query: {
          tenantId,
          action: action || undefined,
          cursor: pages.cursor ? Number(pages.cursor) : undefined,
          limit: 20,
        },
      },
    }),
  );
  return (
    <>
      <PageHeading
        title="审计"
        description="追溯当前授权范围内的操作事实与结果。"
        actions={
          <>
            <Command
              label="导出审计"
              submit={(_, headers) =>
                api.exportAudit({
                  params: { header: headers },
                  body: { tenantId, filter: { ...(action ? { action } : {}) } },
                })
              }
            />
            <Command
              label="查看导出状态"
              submit={(v) =>
                api.viewAuditExport({
                  params: { path: { id: v.id }, query: { tenantId } },
                })
              }
            >
              <TextField name="id" label="审计导出 ID" />
            </Command>
            <Command
              label="下载审计 CSV"
              submit={async (v) => {
                const result = await api.downloadAuditExport({
                  params: { path: { id: v.id }, query: { tenantId } },
                });
                downloadBlob(new Blob([result.data]), 'edition-audit.csv');
              }}
            >
              <TextField name="id" label="审计导出 ID" />
            </Command>
          </>
        }
      />
      <Input
        className="mb-4 max-w-md"
        aria-label="按动作筛选审计"
        placeholder="动作"
        value={action}
        onChange={(event) => {
          setAction(event.target.value);
          pages.reset();
        }}
      />
      <Resource query={query}>
        {({ data }) => (
          <>
            <DataTable
              rows={data.items ?? []}
              rowId={(row) => String(row.id)}
              columns={[
                {
                  id: 'record',
                  title: '操作记录',
                  render: (row) => <Facts value={row} />,
                },
              ]}
            />
            <Pagination
              previous={pages.previous}
              next={() =>
                pages.next(
                  data.nextCursor === undefined
                    ? undefined
                    : String(data.nextCursor),
                )
              }
              hasPrevious={pages.hasPrevious}
              hasNext={
                data.nextCursor !== undefined && data.nextCursor !== null
              }
            />
          </>
        )}
      </Resource>
    </>
  );
}
export function OperationsCapabilities() {
  const { api, scope } = useServices();
  const query = useResource(['capabilities'], (signal) =>
    api.operationsCapabilities({
      signal,
      params: { path: { tenantId: scope.tenantId } },
    }),
  );
  return (
    <Section title="当前可用运营能力">
      <Resource query={query}>{({ data }) => <Facts value={data} />}</Resource>
    </Section>
  );
}

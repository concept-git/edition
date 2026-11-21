import { SpacePicker } from '@/features/spaces';
import { useServices } from '@/shared/api/context';
import { PageHeading, Resource, useResource } from '@/shared/ui/resource';
import { Command, TextField, commaValues } from '@/shared/ui/operation-form';
import { DataTable, CursorPagination } from '@/shared/ui/data-table';
import { StateBadge, dateText } from '@/shared/ui/facts';
import { usePagination } from '@/shared/lib/pagination';
import { parseContract } from '@/shared/api/validation';
export function TokensPage() {
  const { api, scope } = useServices();
  const { tenantId } = scope;
  const pages = usePagination();
  const query = useResource(['api-tokens', pages.cursor], (signal) =>
    api.list({
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
        title="API 令牌"
        description="API 令牌是绑定单个空间的独立主体，不继承签发人的权限。"
        actions={
          <Command
            label="签发 API 令牌"
            description="秘密仅在本次结果中展示。签发后的资源授权由后台独立裁决。"
            defaults={{ role: 'reader', scopes: 'read' }}
            submit={async (v, headers) =>
              api.issue({
                params: { path: { tenantId }, header: headers },
                body: await parseContract('IssueTokenRequest', {
                  name: v.name,
                  spaceId: v.spaceId,
                  role: v.role,
                  scopes: commaValues(v.scopes),
                  expiry: new Date(v.expiry).toISOString(),
                }),
              })
            }
          >
            <TextField name="name" label="名称" />
            <SpacePicker />
            <TextField
              name="role"
              label="资源角色"
              options={['reader', 'author', 'maintainer', 'admin', 'none']}
            />
            <TextField name="scopes" label="read、write、publish，以逗号分隔" />
            <TextField name="expiry" label="过期时间" type="datetime-local" />
          </Command>
        }
      />
      <Resource query={query}>
        {({ data }) => (
          <>
            <DataTable
              rows={data.tokens ?? []}
              rowId={(row) => row.id ?? ''}
              columns={[
                { id: 'name', title: '名称', render: (row) => row.name },
                {
                  id: 'status',
                  title: '状态',
                  render: (row) => <StateBadge value={row.status} />,
                },
                {
                  id: 'expiry',
                  title: '过期',
                  render: (row) => dateText(row.expiry),
                },
                {
                  id: 'action',
                  title: '操作',
                  render: (row) => (
                    <Command
                      label="吊销"
                      danger
                      submit={() =>
                        api.revoke({
                          params: { path: { tenantId, tokenId: row.id ?? '' } },
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

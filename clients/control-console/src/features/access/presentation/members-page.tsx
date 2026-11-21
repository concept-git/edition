import { useServices } from '@/shared/api/context';
import {
  PageHeading,
  Section,
  Resource,
  useResource,
} from '@/shared/ui/resource';
import { Command, TextField } from '@/shared/ui/operation-form';
import { DataTable, CursorPagination } from '@/shared/ui/data-table';
import { Facts, StateBadge, dateText } from '@/shared/ui/facts';
import { AppLink } from '@/shared/ui/navigation';
import { usePagination } from '@/shared/lib/pagination';
import { parseContract } from '@/shared/api/validation';

export function MembersPage() {
  const { api, scope } = useServices();
  const { tenantId, teamId } = scope;
  const path = { tenantId, teamId };
  const pages = usePagination();
  const members = useResource(
    ['members', teamId, pages.cursor],
    async (signal) =>
      teamId
        ? (
            await api.members({
              signal,
              params: { path, query: { limit: 20, cursor: pages.cursor } },
            })
          ).data
        : (
            await api.listTenantMembers({
              signal,
              params: {
                path: { tenantId },
                query: { limit: 20, cursor: pages.cursor },
              },
            })
          ).data,
  );
  const invitePages = usePagination('invitationsPage');
  const invites = useResource(
    ['invitations', teamId, invitePages.cursor],
    async (signal) =>
      teamId
        ? (
            await api.invitations({
              signal,
              params: {
                path,
                query: { limit: 20, cursor: invitePages.cursor },
              },
            })
          ).data
        : (
            await api.listTenantInvitations({
              signal,
              params: {
                path: { tenantId },
                query: { limit: 20, cursor: invitePages.cursor },
              },
            })
          ).data,
  );
  return (
    <>
      <PageHeading
        title={teamId ? '用户组成员' : '租户成员与邀请'}
        description="成员关系和资源权限分别维护；移除成员可能改变其可访问范围。"
        actions={
          <Command
            label="邀请成员"
            defaults={{ role: 'member' }}
            submit={async (v, headers) => {
              const body = await parseContract('InviteRequest', {
                email: v.email,
                role: v.role,
              });
              return teamId
                ? api.invite({ params: { path, header: headers }, body })
                : api.inviteTenantMember({
                    params: { path: { tenantId }, header: headers },
                    body,
                  });
            }}
          >
            <TextField name="email" label="邮箱" type="email" />
            <TextField name="role" label="角色" options={['member', 'owner']} />
          </Command>
        }
      />
      {teamId && <TeamSettings />}
      <Section title="当前成员">
        <Resource query={members}>
          {(data) => (
            <>
              <DataTable
                rows={data.items ?? []}
                rowId={(row) => row.id ?? ''}
                columns={[
                  { id: 'name', title: '姓名', render: (row) => row.name },
                  {
                    id: 'role',
                    title: '角色',
                    render: (row) => <StateBadge value={row.role} />,
                  },
                  {
                    id: 'joined',
                    title: '加入时间',
                    render: (row) => dateText(row.joinedAt),
                  },
                  {
                    id: 'actions',
                    title: '操作',
                    render: (row) => (
                      <div className="flex gap-2">
                        <Command
                          label="修改角色"
                          defaults={{ role: row.role ?? 'member' }}
                          submit={async (v) => {
                            const body = await parseContract('RoleRequest', {
                              role: v.role,
                            });
                            return teamId
                              ? api.setRole({
                                  params: {
                                    path: { ...path, userId: row.id ?? '' },
                                  },
                                  body,
                                })
                              : api.setTenantMemberRole({
                                  params: {
                                    path: { tenantId, userId: row.id ?? '' },
                                  },
                                  body,
                                });
                          }}
                        >
                          <TextField
                            name="role"
                            label="角色"
                            options={['member', 'owner']}
                          />
                        </Command>
                        <Command
                          label="移除成员"
                          danger
                          submit={() =>
                            teamId
                              ? api.removeMember({
                                  params: {
                                    path: { ...path, userId: row.id ?? '' },
                                  },
                                })
                              : api.removeTenantMember({
                                  params: {
                                    path: { tenantId, userId: row.id ?? '' },
                                  },
                                })
                          }
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
      <Section title="待接受邀请">
        <Resource query={invites}>
          {(data) => (
            <>
              <DataTable
                rows={data.items ?? []}
                rowId={(row) => row.id ?? ''}
                columns={[
                  { id: 'email', title: '邮箱', render: (row) => row.email },
                  { id: 'role', title: '角色', render: (row) => row.role },
                  {
                    id: 'expires',
                    title: '到期',
                    render: (row) => dateText(row.expiresAt),
                  },
                  {
                    id: 'actions',
                    title: '操作',
                    render: (row) => (
                      <Command
                        label="撤销邀请"
                        danger
                        submit={() =>
                          teamId
                            ? api.revoke_1({
                                params: {
                                  path: { ...path, inviteId: row.id ?? '' },
                                },
                              })
                            : api.revokeTenantInvitation({
                                params: {
                                  path: { tenantId, inviteId: row.id ?? '' },
                                },
                              })
                        }
                      />
                    ),
                  },
                ]}
              />
              <CursorPagination
                pages={invitePages}
                nextCursor={data.nextCursor}
              />
            </>
          )}
        </Resource>
      </Section>
    </>
  );
}
export function TeamsPage() {
  const { api, scope } = useServices();
  const { tenantId } = scope;
  const pages = usePagination();
  const query = useResource(['teams', pages.cursor], (signal) =>
    api.list_1({
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
        title="用户组"
        actions={
          <Command
            label="创建用户组"
            submit={(v, headers) =>
              api.create({
                params: { path: { tenantId }, header: headers },
                body: { name: v.name },
              })
            }
          >
            <TextField name="name" label="名称" />
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
                {
                  id: 'name',
                  title: '用户组',
                  render: (row) => (
                    <AppLink to={`t/${tenantId}/teams/${row.id}`}>
                      {row.name}
                    </AppLink>
                  ),
                },
                {
                  id: 'details',
                  title: '详情',
                  render: (row) => <Facts value={row} />,
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
function TeamSettings() {
  const { api, scope } = useServices();
  const { tenantId, teamId } = scope;
  const path = { tenantId, teamId };
  const query = useResource(['team', teamId], (signal) =>
    api.view({ signal, params: { path } }),
  );
  return (
    <Section
      title="用户组设置"
      actions={
        <>
          <Command
            label="重命名用户组"
            submit={(v) =>
              api.rename({ params: { path }, body: { name: v.name } })
            }
          >
            <TextField name="name" label="新名称" />
          </Command>
          <Command
            label="删除用户组"
            danger
            submit={() => api.delete({ params: { path } })}
          />
        </>
      }
    >
      <Resource query={query}>{({ data }) => <Facts value={data} />}</Resource>
    </Section>
  );
}

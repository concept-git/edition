import { useServices } from '@/shared/api/context';
import {
  PageHeading,
  Resource,
  Section,
  useResource,
} from '@/shared/ui/resource';
import { Command, TextField, commaValues } from '@/shared/ui/operation-form';
import { Facts } from '@/shared/ui/facts';
import { DataTable, CursorPagination } from '@/shared/ui/data-table';
import { usePagination } from '@/shared/lib/pagination';
import type { components } from '@/shared/api/generated/types';
type TokenScopes = NonNullable<components['schemas']['IssueRequest']['scopes']>;

export function AccountPage() {
  const { api, scope, session } = useServices();
  const profile = useResource(['profile'], (signal) =>
    api.getCurrentUser({ signal }),
  );
  const sessionPages = usePagination('sessionsPage');
  const tokenPages = usePagination('tokensPage');
  const sessions = useResource(['sessions', sessionPages.cursor], (signal) =>
    api.listSessions({
      signal,
      params: { query: { limit: 20, cursor: sessionPages.cursor } },
    }),
  );
  const tokens = useResource(
    ['management-tokens', tokenPages.cursor],
    (signal) =>
      api.listManagementTokens({
        signal,
        params: { query: { limit: 20, cursor: tokenPages.cursor } },
      }),
  );
  const context = useResource(['authentication-context'], (signal) =>
    api.authenticationContext({ signal }),
  );
  return (
    <>
      <PageHeading
        title="个人账户"
        description="管理个人资料、会话和代表你的管理凭据。"
      />
      <Section
        title="账户资料"
        actions={
          <>
            <Command
              key={JSON.stringify(profile.data?.data)}
              label="修改资料"
              disabled={!profile.data}
              description="更新姓名、语言和头像；清空语言或头像后保存将删除该值。"
              defaults={{
                name: profile.data?.data.name ?? '',
                locale: profile.data?.data.locale ?? '',
                avatar: profile.data?.data.avatar ?? '',
              }}
              submit={(v) =>
                api.replaceCurrentUser({
                  body: {
                    name: v.name,
                    locale: v.locale || null,
                    avatar: v.avatar || null,
                  },
                })
              }
            >
              <TextField name="name" label="姓名" />
              <TextField name="locale" label="语言" required={false} />
              <TextField name="avatar" label="头像 URL" required={false} />
            </Command>
            <Command
              label="修改密码"
              submit={(v) =>
                api.changePassword({
                  body: {
                    oldPassword: v.oldPassword,
                    newPassword: v.newPassword,
                  },
                })
              }
            >
              <TextField name="oldPassword" label="当前密码" type="password" />
              <TextField name="newPassword" label="新密码" type="password" />
            </Command>
          </>
        }
      >
        <Resource query={profile}>
          {({ data }) => <Facts value={data} />}
        </Resource>
      </Section>
      <Section title="登录会话">
        <Resource query={sessions}>
          {({ data }) => (
            <>
              <DataTable
                rows={data.sessions ?? []}
                rowId={(row) => row.id ?? ''}
                columns={[
                  { id: 'device', title: '会话', render: (row) => row.id },
                  {
                    id: 'facts',
                    title: '详情',
                    render: (row) => <Facts value={row} />,
                  },
                  {
                    id: 'action',
                    title: '操作',
                    render: (row) => (
                      <Command
                        label="结束会话"
                        success={() => {
                          if (row.current) session.clear();
                        }}
                        danger
                        submit={(_, _headers, signal) =>
                          api.endSession({
                            signal,
                            params: { path: { id: row.id ?? '' } },
                          })
                        }
                      />
                    ),
                  },
                ]}
              />
              <CursorPagination
                pages={sessionPages}
                nextCursor={data.nextCursor}
              />
            </>
          )}
        </Resource>
      </Section>
      <Section
        title="管理令牌"
        actions={
          <Command
            label="签发管理令牌"
            description="令牌仍代表你。秘密仅在本次结果中展示，请及时保存。"
            submit={(v, headers) =>
              api.issueManagementToken({
                params: { header: headers },
                body: {
                  name: v.name,
                  tenantId: v.tenantId || null,
                  scopes: commaValues(v.scopes) as TokenScopes,
                  expiry: new Date(v.expiry).toISOString(),
                },
              })
            }
          >
            <TextField name="name" label="名称" />
            <TextField name="tenantId" label="绑定租户 ID" required={false} />
            <TextField
              name="scopes"
              label="权限范围，以逗号分隔"
              help="使用后台支持的 content:read、content:write、hosting:read 等范围。"
            />
            <TextField name="expiry" label="过期时间" type="datetime-local" />
          </Command>
        }
      >
        <Resource query={tokens}>
          {({ data }) => (
            <>
              <DataTable
                rows={data.items ?? []}
                rowId={(row) => row.id ?? ''}
                columns={[
                  { id: 'name', title: '名称', render: (row) => row.name },
                  { id: 'expiry', title: '到期', render: (row) => row.expiry },
                  {
                    id: 'revoke',
                    title: '操作',
                    render: (row) => (
                      <Command
                        label="吊销令牌"
                        danger
                        submit={() =>
                          api.revokeManagementToken({
                            params: { path: { tokenId: row.id ?? '' } },
                          })
                        }
                      />
                    ),
                  },
                ]}
              />
              <CursorPagination
                pages={tokenPages}
                nextCursor={data.nextCursor}
              />
            </>
          )}
        </Resource>
      </Section>
      <Section title="当前凭据限制">
        <Resource query={context}>
          {({ data }) => <Facts value={data} />}
        </Resource>
      </Section>
      <Section
        title="注销账户"
        actions={
          <Command
            label="永久注销账户"
            danger
            description="账户注销不可逆。最后所有者必须先完成后台要求的所有权转移。"
            submit={(v, headers) =>
              api.eraseCurrentUser({
                params: { header: headers },
                body: {
                  confirmationEmail: v.confirmationEmail,
                  currentPassword: v.currentPassword,
                },
              })
            }
            success={() => session.clear()}
          >
            <TextField name="confirmationEmail" label="确认邮箱" type="email" />
            <TextField
              name="currentPassword"
              label="当前密码"
              type="password"
            />
          </Command>
        }
      >
        <p className="text-sm text-muted-foreground">
          当前租户：{scope.tenantId || '未选择'}
          。请先核对需要保留的内容与所有权。
        </p>
      </Section>
    </>
  );
}

export function InvitationPage() {
  const { api, scope } = useServices();
  const token = scope.resourceId;
  const preview = useResource(
    ['invitation', token],
    (signal) => api.previewInvitation({ signal, params: { path: { token } } }),
    Boolean(token),
  );
  return (
    <>
      <PageHeading title="接受邀请" />
      <Section
        title="邀请信息"
        actions={
          <Command
            label="接受邀请"
            submit={() => api.acceptInvitation({ params: { path: { token } } })}
          />
        }
      >
        <Resource query={preview}>
          {({ data }) => <Facts value={data} />}
        </Resource>
      </Section>
    </>
  );
}

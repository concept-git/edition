import { useState } from 'react';
import { useServices } from '@/shared/api/context';
import {
  PageHeading,
  Resource,
  Section,
  useResource,
} from '@/shared/ui/resource';
import { Command, TextField } from '@/shared/ui/operation-form';
import { DataTable, CursorPagination } from '@/shared/ui/data-table';
import { Facts, StateBadge } from '@/shared/ui/facts';
import { Input } from '@/shared/ui/input';
import { usePagination } from '@/shared/lib/pagination';

export function TenantsPage() {
  const { api } = useServices();
  const pages = usePagination();
  const query = useResource(['platform-tenants', pages.cursor], (signal) =>
    api.listTenants({
      signal,
      params: { query: { limit: 20, cursor: pages.cursor } },
    }),
  );
  return (
    <>
      <PageHeading
        title="平台租户"
        description="开通、冻结和恢复租户。平台管理权限不隐式授予租户正文访问。"
        actions={
          <Command
            label="开通租户"
            submit={(v) =>
              api.provisionTenant({
                body: { name: v.name, ownerEmail: v.ownerEmail },
              })
            }
          >
            <TextField name="name" label="租户名称" />
            <TextField name="ownerEmail" label="所有者邮箱" type="email" />
          </Command>
        }
      />
      <Resource query={query}>
        {({ data }) => (
          <>
            <DataTable
              rows={data.tenants ?? []}
              rowId={(row) => row.id ?? ''}
              columns={[
                { id: 'name', title: '租户', render: (row) => row.name },
                {
                  id: 'status',
                  title: '状态',
                  render: (row) => <StateBadge value={row.status} />,
                },
                {
                  id: 'actions',
                  title: '操作',
                  render: (row) => (
                    <div className="flex gap-2">
                      <Command
                        label="冻结租户"
                        danger
                        submit={() =>
                          api.suspendTenant({
                            params: { path: { id: row.id ?? '' } },
                          })
                        }
                      />
                      <Command
                        label="恢复租户"
                        submit={() =>
                          api.resumeTenant({
                            params: { path: { id: row.id ?? '' } },
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
    </>
  );
}
export function UsersPage() {
  const { api } = useServices();
  const pages = usePagination();
  const [search, setSearch] = useState('');
  const query = useResource(
    ['platform-users', search, pages.cursor],
    (signal) =>
      api.searchAdminUsers({
        signal,
        params: { query: { q: search, limit: 20, cursor: pages.cursor } },
      }),
    search.length >= 3,
  );
  return (
    <>
      <PageHeading
        title="平台用户"
        description="搜索用户，查看账户状态并执行受控管理操作。"
      />
      <Input
        aria-label="搜索平台用户"
        className="mb-4 max-w-md"
        placeholder="至少输入三个字符"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          pages.reset();
        }}
      />
      {search.length >= 3 && (
        <Resource query={query}>
          {({ data }) => (
            <>
              <DataTable
                rows={data.users ?? []}
                rowId={(row) => row.id ?? ''}
                columns={[
                  {
                    id: 'user',
                    title: '用户',
                    render: (row) => <Facts value={row} />,
                  },
                  {
                    id: 'actions',
                    title: '操作',
                    render: (row) => {
                      const path = { id: row.id ?? '' };
                      return (
                        <div className="flex flex-wrap gap-2">
                          <Command
                            label="查看用户详情"
                            submit={() =>
                              api.getAdminUser({ params: { path } })
                            }
                          />
                          <Command
                            label="恢复用户"
                            submit={(_, headers) =>
                              api.reactivateAdminUser({
                                params: { path, header: headers },
                              })
                            }
                          />
                          <Command
                            label="停用用户"
                            danger
                            submit={(v, headers) =>
                              api.deactivateAdminUser({
                                params: { path, header: headers },
                                body: {
                                  confirmationEmail: v.confirmationEmail,
                                  currentPassword: v.currentPassword,
                                },
                              })
                            }
                          >
                            <ConfirmUser />
                          </Command>
                          <Command
                            label="永久抹除用户"
                            danger
                            submit={(v, headers) =>
                              api.eraseAdminUser({
                                params: { path, header: headers },
                                body: {
                                  confirmationEmail: v.confirmationEmail,
                                  currentPassword: v.currentPassword,
                                },
                              })
                            }
                          >
                            <ConfirmUser />
                          </Command>
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
      )}
    </>
  );
}
function ConfirmUser() {
  return (
    <>
      <TextField
        name="confirmationEmail"
        label="确认目标用户邮箱"
        type="email"
      />
      <TextField
        name="currentPassword"
        label="当前操作人的密码"
        type="password"
      />
    </>
  );
}
export function PlatformOperations() {
  const { api } = useServices();
  const health = useResource(['platform-health'], (signal) =>
    api.platformHealth({ signal }),
  );
  const storage = useResource(['storage'], (signal) =>
    api.storageUsage({ signal }),
  );
  return (
    <>
      <PageHeading
        title="运行诊断"
        description="查询故障与空结果分别呈现。任务受理、业务完成和清理完成分别核验。"
      />
      <Section title="平台健康">
        <Resource query={health}>
          {({ data }) => <Facts value={data} />}
        </Resource>
      </Section>
      <Section
        title="存储"
        actions={
          <Command
            label="重试存储清理"
            submit={(_, headers) =>
              api.retryStorage({ params: { header: headers } })
            }
          />
        }
      >
        <Resource query={storage}>
          {({ data }) => <Facts value={data} />}
        </Resource>
      </Section>
      <Jobs />
      <MailJobs />
      <Section
        title="维护操作"
        actions={
          <>
            <Command
              label="清理过期回收页"
              danger
              submit={(v, headers) =>
                api.purgeTrash({
                  params: { header: headers },
                  body: { tenantId: v.tenantId },
                })
              }
            >
              <TextField name="tenantId" label="租户 ID" />
            </Command>
            <Command
              label="检查实际证书"
              submit={(v) =>
                api.domainCertificate({
                  params: {
                    path: { host: v.host },
                    query: {
                      tenantId: v.tenantId,
                      siteId: v.siteId,
                      platform: true,
                    },
                  },
                })
              }
            >
              <TextField name="host" label="域名" />
              <TextField name="tenantId" label="租户 ID" />
              <TextField name="siteId" label="站点 ID" />
            </Command>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          维护范围和操作资格由后台逐次验证。
        </p>
      </Section>
    </>
  );
}
function Jobs() {
  const { api } = useServices();
  const pages = usePagination();
  const [tenantId, setTenant] = useState('');
  const query = useResource(
    ['platform-jobs', tenantId, pages.cursor],
    (signal) =>
      api.listJobs({
        signal,
        params: {
          query: {
            limit: 20,
            cursor: pages.cursor,
            ...(tenantId ? { tenantId } : {}),
            type: 'import',
          },
        },
      }),
  );
  return (
    <Section title="导入作业">
      <Input
        className="mb-4 max-w-md"
        aria-label="筛选作业租户"
        placeholder="租户 ID，留空查询授权范围"
        value={tenantId}
        onChange={(event) => {
          setTenant(event.target.value);
          pages.reset();
        }}
      />
      <Resource query={query}>
        {({ data }) => (
          <>
            <DataTable
              rows={data.items ?? []}
              rowId={(row) => row.id ?? ''}
              columns={[
                {
                  id: 'job',
                  title: '作业',
                  render: (row) => <Facts value={row} />,
                },
                {
                  id: 'actions',
                  title: '操作',
                  render: (row) => (
                    <Command
                      label="重试作业"
                      submit={(v, headers) =>
                        api.retryJob({
                          params: {
                            path: { jobId: row.id ?? '' },
                            header: headers,
                          },
                          body: { tenantId: v.tenantId, platform: true },
                        })
                      }
                    >
                      <TextField name="tenantId" label="所属租户 ID" />
                    </Command>
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
function MailJobs() {
  const { api } = useServices();
  const pages = usePagination();
  const query = useResource(['mail-jobs', pages.cursor], (signal) =>
    api.listMailJobs({
      signal,
      params: { query: { limit: 20, cursor: pages.cursor } },
    }),
  );
  return (
    <Section title="邮件作业">
      <Resource query={query}>
        {({ data }) => (
          <>
            <DataTable
              rows={data.items ?? []}
              rowId={(row) => row.id ?? ''}
              columns={[
                {
                  id: 'job',
                  title: '邮件',
                  render: (row) => <Facts value={row} />,
                },
                {
                  id: 'actions',
                  title: '操作',
                  render: (row) => (
                    <Command
                      label="重试邮件"
                      submit={(_, headers) =>
                        api.retryMailJob({
                          params: {
                            path: { id: row.id ?? '' },
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

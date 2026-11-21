import { useState } from 'react';
import { useServices } from '@/shared/api/context';
import { Section, Resource, useResource } from '@/shared/ui/resource';
import { Command, TextField, commaValues } from '@/shared/ui/operation-form';
import { DataTable, CursorPagination } from '@/shared/ui/data-table';
import { Facts } from '@/shared/ui/facts';
import { Input } from '@/shared/ui/input';
import { usePagination, useLocalPagination } from '@/shared/lib/pagination';

export function PermissionsPage() {
  const { api, scope } = useServices();
  const { tenantId, spaceId, siteId } = scope;
  const pages = usePagination();
  const query = useResource(
    ['permissions', spaceId || siteId, pages.cursor],
    async (signal) =>
      siteId
        ? (
            await api.listSitePermissions({
              signal,
              params: {
                path: { tenantId, siteId },
                query: { limit: 20, cursor: pages.cursor },
              },
            })
          ).data
        : (
            await api.listSpacePermissions({
              signal,
              params: {
                path: { tenantId, spaceId },
                query: { limit: 20, cursor: pages.cursor },
              },
            })
          ).data,
  );
  return (
    <>
      <Section
        title={siteId ? '站点授权' : '空间授权'}
        actions={
          <Command
            label="添加或替换授权"
            defaults={{ role: 'reader' }}
            submit={(v) =>
              siteId
                ? api.putSiteGrant({
                    params: {
                      path: { tenantId, siteId, principalKey: v.principal },
                    },
                    body: { role: v.role },
                  })
                : api.putSpaceGrant({
                    params: {
                      path: { tenantId, spaceId, principalKey: v.principal },
                    },
                    body: { role: v.role },
                  })
            }
          >
            <TextField
              name="principal"
              label="主体键"
              help="从下方主体搜索获取 user:ID / team:ID，或填写 anonymous。"
            />
            <TextField
              name="role"
              label="角色"
              options={['reader', 'author', 'maintainer', 'admin', 'none']}
            />
          </Command>
        }
      >
        <Resource query={query}>
          {(data) => (
            <>
              <DataTable
                rows={data.items ?? []}
                rowId={(row) => row.principal?.key ?? ''}
                columns={[
                  {
                    id: 'principal',
                    title: '主体',
                    render: (row) => (
                      <div>
                        {row.principal?.name}
                        <p className="text-xs text-muted-foreground">
                          {row.principal?.key}
                        </p>
                      </div>
                    ),
                  },
                  { id: 'role', title: '角色', render: (row) => row.role },
                  {
                    id: 'actions',
                    title: '操作',
                    render: (row) => (
                      <div className="flex flex-wrap gap-2">
                        <Command
                          label="撤销授权"
                          danger
                          disabled={!row.allowedActions?.includes('revoke')}
                          submit={() =>
                            siteId
                              ? api.deleteSiteGrant({
                                  params: {
                                    path: {
                                      tenantId,
                                      siteId,
                                      principalKey: row.principal?.key ?? '',
                                    },
                                  },
                                })
                              : api.deleteSpaceGrant({
                                  params: {
                                    path: {
                                      tenantId,
                                      spaceId,
                                      principalKey: row.principal?.key ?? '',
                                    },
                                  },
                                })
                          }
                        />
                        {siteId && (
                          <Command
                            label="解释管理权限"
                            submit={() =>
                              api.explainSiteAdmin({
                                params: {
                                  path: { tenantId, siteId },
                                  query: {
                                    principal: row.principal?.key ?? '',
                                  },
                                },
                              })
                            }
                          />
                        )}
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
      <PrincipalSearch />
      {spaceId && <PageRestrictions />}
    </>
  );
}
function PrincipalSearch() {
  const { api, scope } = useServices();
  const { tenantId, spaceId, siteId } = scope;
  const [search, setSearch] = useState('');
  const userPages = useLocalPagination();
  const teamPages = useLocalPagination();
  const users = useResource(
    ['permission-users', spaceId || siteId, search, userPages.cursor],
    async (signal) =>
      siteId
        ? (
            await api.searchSitePermissionUsers({
              signal,
              params: {
                path: { tenantId, siteId },
                query: { q: search, limit: 20, cursor: userPages.cursor },
              },
            })
          ).data
        : (
            await api.searchPermissionUsers({
              signal,
              params: {
                path: { tenantId, spaceId },
                query: { q: search, limit: 20, cursor: userPages.cursor },
              },
            })
          ).data,
    search.length >= 2,
  );
  const teams = useResource(
    ['permission-teams', spaceId || siteId, search, teamPages.cursor],
    async (signal) =>
      siteId
        ? (
            await api.searchSitePermissionTeams({
              signal,
              params: {
                path: { tenantId, siteId },
                query: { q: search, limit: 20, cursor: teamPages.cursor },
              },
            })
          ).data
        : (
            await api.searchPermissionTeams({
              signal,
              params: {
                path: { tenantId, spaceId },
                query: { q: search, limit: 20, cursor: teamPages.cursor },
              },
            })
          ).data,
    search.length >= 2,
  );
  return (
    <Section title="查找授权主体">
      <Input
        aria-label="搜索用户或用户组"
        placeholder="至少输入两个字符"
        className="mb-4 max-w-md"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          userPages.reset();
          teamPages.reset();
        }}
      />
      {search.length >= 2 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Resource query={users}>
            {(data) => (
              <div>
                <Facts value={data.items} />
                <CursorPagination
                  pages={userPages}
                  nextCursor={data.nextCursor}
                />
              </div>
            )}
          </Resource>
          <Resource query={teams}>
            {(data) => (
              <div>
                <Facts value={data.items} />
                <CursorPagination
                  pages={teamPages}
                  nextCursor={data.nextCursor}
                />
              </div>
            )}
          </Resource>
        </div>
      )}
    </Section>
  );
}
function PageRestrictions() {
  const { api, scope } = useServices();
  const { tenantId, spaceId } = scope;
  const [pageId, setPageId] = useState('');
  const pageOptions = useLocalPagination();
  const pages = useResource(
    ['permission-pages', spaceId, pageOptions.cursor],
    (signal) =>
      api.listPermissionPages({
        signal,
        params: {
          path: { tenantId, spaceId },
          query: { limit: 20, cursor: pageOptions.cursor },
        },
      }),
  );
  return (
    <Section title="页面权限收窄">
      <p className="mb-3 text-sm text-muted-foreground">
        页面只收窄空间权限，不增加权限。选择页面后读取当前限制与基线。
      </p>
      <Resource query={pages}>
        {({ data }) => (
          <>
            <select
              aria-label="选择权限页面"
              className="mb-4 w-full rounded-md border bg-background p-2"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
            >
              <option value="">选择页面</option>
              {data.items?.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.title}
                </option>
              ))}
            </select>
            <CursorPagination
              pages={pageOptions}
              nextCursor={data.nextCursor}
            />
          </>
        )}
      </Resource>
      {pageId && <RestrictionEditor key={pageId} pageId={pageId} />}
    </Section>
  );
}
function RestrictionEditor({ pageId }: { pageId: string }) {
  const { api, scope } = useServices();
  const path = { tenantId: scope.tenantId, spaceId: scope.spaceId, pageId };
  const query = useResource(['page-permission', pageId], (signal) =>
    api.viewPagePermission({ signal, params: { path } }),
  );
  return (
    <Resource query={query}>
      {({ data, response }) => (
        <>
          <Facts value={data} />
          <div className="mt-4 flex flex-wrap gap-2">
            <Command
              label="替换页面限制"
              disabled={!response.headers.get('ETag')}
              submit={(v) =>
                api.putPageRestriction({
                  params: {
                    path,
                    header: { 'If-Match': response.headers.get('ETag') ?? '' },
                  },
                  body: { principals: commaValues(v.principals) },
                })
              }
            >
              <TextField
                name="principals"
                label="可读主体键，逐行或逗号分隔"
                multiline
                required={false}
              />
            </Command>
            <Command
              label="取消页面限制"
              danger
              disabled={!response.headers.get('ETag')}
              submit={() =>
                api.deletePageRestriction({
                  params: {
                    path,
                    header: { 'If-Match': response.headers.get('ETag') ?? '' },
                  },
                })
              }
            />
            <Command
              label="解释阅读权限"
              submit={(v) =>
                api.explainPageRead({
                  params: { path, query: { principal: v.principal } },
                })
              }
            >
              <TextField name="principal" label="主体键" />
            </Command>
          </div>
        </>
      )}
    </Resource>
  );
}

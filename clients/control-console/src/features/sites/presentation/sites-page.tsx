import { SpacePicker } from '@/features/spaces';
import type { ReactNode } from 'react';
import { useServices } from '@/shared/api/context';
import {
  PageHeading,
  Section,
  Resource,
  useResource,
} from '@/shared/ui/resource';
import { Command, TextField, commaValues } from '@/shared/ui/operation-form';
import { DataTable, CursorPagination } from '@/shared/ui/data-table';
import { Facts, dateText } from '@/shared/ui/facts';
import { AppLink, TabsNav } from '@/shared/ui/navigation';
import { usePagination } from '@/shared/lib/pagination';
import { parseContract } from '@/shared/api/validation';

export function SitesPage() {
  const { api, scope } = useServices();
  const { tenantId } = scope;
  const pages = usePagination();
  const query = useResource(['sites', pages.cursor], (signal) =>
    api.listSites({
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
        title="站点"
        description="挂载空间，以域名交付经过授权的线上内容。"
        actions={
          <Command
            label="创建站点"
            submit={(v, headers) =>
              api.createSite({
                params: { path: { tenantId }, header: headers },
                body: { name: v.name },
              })
            }
          >
            <TextField name="name" label="站点名称" />
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
                  title: '站点',
                  render: (row) => (
                    <AppLink to={`t/${tenantId}/sites/${row.id}/mounts`}>
                      {row.name}
                    </AppLink>
                  ),
                },
                {
                  id: 'created',
                  title: '创建时间',
                  render: (row) => dateText(row.createdAt),
                },
                {
                  id: 'settings',
                  title: '操作',
                  render: (row) => (
                    <AppLink to={`t/${tenantId}/sites/${row.id}/delivery`}>
                      查看交付
                    </AppLink>
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
export function SiteWorkspace({ children }: { children: ReactNode }) {
  const { api, scope } = useServices();
  const { tenantId, siteId, panel } = scope;
  const query = useResource(['site', siteId], (signal) =>
    api.viewSite({ signal, params: { path: { tenantId, siteId } } }),
  );
  const tabs = [
    ['mounts', '空间挂载'],
    ['domains', '域名'],
    ['delivery', '交付'],
    ['redirects', '重定向'],
    ['search', '搜索'],
    ['permissions', '权限'],
    ['settings', '设置'],
  ];
  return (
    <>
      <AppLink
        className="mb-3 inline-block text-xs text-muted-foreground"
        to={`t/${tenantId}/sites`}
      >
        ← 全部站点
      </AppLink>
      <Resource query={query}>
        {({ data }) => (
          <PageHeading
            title={data.name ?? '站点'}
            description="站点线上状态与空间主版本分别核验。"
          />
        )}
      </Resource>
      <TabsNav
        active={panel || 'mounts'}
        tabs={tabs.map(([id, label]) => ({
          id,
          label,
          to: `t/${tenantId}/sites/${siteId}/${id}`,
        }))}
      />
      {children}
    </>
  );
}
export function SiteMounts() {
  const { api, scope } = useServices();
  const { tenantId, siteId } = scope;
  const path = { tenantId, siteId };
  const query = useResource(['site', siteId], (signal) =>
    api.viewSite({ signal, params: { path } }),
  );
  return (
    <Section
      title="空间挂载"
      actions={
        <>
          <Command
            label="挂载空间"
            submit={(v, headers) =>
              api.mountSpace({
                params: { path: { ...path, slug: v.slug }, header: headers },
                body: { spaceId: v.spaceId },
              })
            }
          >
            <SpacePicker />
            <TextField name="slug" label="站点内空间路径" />
          </Command>
          <Command
            label="调整挂载顺序"
            submit={(v, headers) =>
              api.reorderMountsBySpaceId({
                params: { path, header: headers },
                body: { spaceIds: commaValues(v.spaceIds) },
              })
            }
          >
            <TextField
              name="spaceIds"
              label="空间 ID，按顺序逐行填写"
              multiline
            />
          </Command>
        </>
      }
    >
      <Resource query={query}>
        {({ data }) => (
          <DataTable
            rows={data.mounts ?? []}
            rowId={(row) => row.spaceId ?? row.slug ?? ''}
            columns={[
              {
                id: 'space',
                title: '空间',
                render: (row) => (
                  <AppLink to={`t/${tenantId}/spaces/${row.spaceId}/pages`}>
                    {row.spaceId}
                  </AppLink>
                ),
              },
              { id: 'slug', title: '路径', render: (row) => row.slug },
              {
                id: 'actions',
                title: '操作',
                render: (row) => (
                  <div className="flex gap-2">
                    <Command
                      label="修改挂载路径"
                      submit={(v, headers) =>
                        api.remountSpaceById({
                          params: {
                            path: { ...path, spaceId: row.spaceId ?? '' },
                            header: headers,
                          },
                          body: { newSlug: v.newSlug },
                        })
                      }
                    >
                      <TextField name="newSlug" label="新路径" />
                    </Command>
                    <Command
                      label="卸载空间"
                      danger
                      submit={(_, headers) =>
                        api.unmountSpaceById({
                          params: {
                            path: { ...path, spaceId: row.spaceId ?? '' },
                            header: headers,
                          },
                        })
                      }
                    />
                  </div>
                ),
              },
            ]}
          />
        )}
      </Resource>
    </Section>
  );
}
export function SiteSettings() {
  const { api, scope } = useServices();
  const { tenantId, siteId } = scope;
  const path = { tenantId, siteId };
  const query = useResource(['site', siteId], (signal) =>
    api.viewSite({ signal, params: { path } }),
  );
  return (
    <Resource query={query}>
      {({ data }) => (
        <>
          <Section
            title="站点设置"
            actions={
              <Command
                label="修改站点"
                defaults={{
                  name: data.name ?? '',
                  titleTemplate: data.titleTemplate ?? '%s',
                  locale: data.locale ?? '',
                  home: data.home ?? '',
                  analyticsId: data.analyticsId ?? '',
                  rule: data.rule ?? '',
                  robotsPolicy: data.robotsPolicy ?? 'noindex',
                  branding: JSON.stringify(data.branding ?? {}),
                }}
                submit={async (v, headers) =>
                  api.updateSite({
                    params: { path, header: headers },
                    body: await parseContract('UpdateSiteRequest', {
                      name: v.name,
                      titleTemplate: v.titleTemplate || null,
                      locale: v.locale || null,
                      home: v.home || null,
                      analyticsId: v.analyticsId || null,
                      rule: v.rule || null,
                      robotsPolicy: v.robotsPolicy,
                      branding: JSON.parse(v.branding),
                    }),
                  })
                }
              >
                <TextField name="name" label="名称" />
                <TextField
                  name="titleTemplate"
                  label="标题模板（包含一个 %s）"
                />
                <TextField name="locale" label="语言" required={false} />
                <TextField name="home" label="首页空间 ID" required={false} />
                <TextField
                  name="analyticsId"
                  label="统计标识"
                  required={false}
                />
                <TextField
                  name="robotsPolicy"
                  label="搜索引擎策略"
                  options={['index', 'noindex']}
                />
                <TextField name="rule" label="阅读规则" required={false} />
                <TextField name="branding" label="品牌配置 JSON" multiline />
              </Command>
            }
          >
            <Facts value={data} />
          </Section>
          <Section title="终结站点">
            <AppLink to={`t/${tenantId}/sites/${siteId}/termination`}>
              查看删除影响与确认
            </AppLink>
          </Section>
        </>
      )}
    </Resource>
  );
}

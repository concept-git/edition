import { BookOpen, ArrowRight } from 'lucide-react';
import { useServices } from '@/shared/api/context';
import {
  PageHeading,
  Resource,
  Section,
  useResource,
} from '@/shared/ui/resource';
import { Command, TextField } from '@/shared/ui/operation-form';
import { DataTable, CursorPagination } from '@/shared/ui/data-table';
import { StateBadge, dateText, Facts } from '@/shared/ui/facts';
import { AppLink, TabsNav } from '@/shared/ui/navigation';
import { usePagination, useFilter } from '@/shared/lib/pagination';
import { Button } from '@/shared/ui/button';
import type { ReactNode } from 'react';

export function SpacesPage() {
  const { api, scope } = useServices();
  const { tenantId } = scope;
  const pagination = usePagination();
  const [status, setStatus] = useFilter('status', 'active');
  const [mode, setMode] = useFilter('mode');
  const spaces = useResource(
    ['spaces', status, mode, pagination.cursor],
    (signal) =>
      api.listSpaces({
        signal,
        params: {
          path: { tenantId },
          query: {
            limit: 20,
            cursor: pagination.cursor,
            status,
            ...(mode ? { mode } : {}),
          },
        },
      }),
  );
  return (
    <>
      <PageHeading
        title="空间"
        description="在空间内维护内容，选择发版，并追踪站点交付。"
        actions={
          <Command
            label="创建空间"
            defaults={{ mode: 'authored' }}
            submit={(v, headers) =>
              api.createSpace({
                params: { path: { tenantId }, header: headers },
                body: { name: v.name, mode: v.mode },
              })
            }
          >
            <TextField name="name" label="空间名称" />
            <TextField
              name="mode"
              label="来源模式"
              options={['authored', 'synced']}
            />
          </Command>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="text-sm">
          状态{' '}
          <select
            aria-label="空间状态"
            className="ml-2 rounded-md border bg-background p-2"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
            }}
          >
            <option value="active">活跃</option>
            <option value="archived">已归档</option>
          </select>
        </label>
        <label className="text-sm">
          来源{' '}
          <select
            aria-label="空间来源"
            className="ml-2 rounded-md border bg-background p-2"
            value={mode}
            onChange={(e) => {
              setMode(e.target.value);
            }}
          >
            <option value="">全部</option>
            <option value="authored">站内创作</option>
            <option value="synced">外部同步</option>
          </select>
        </label>
        <AppLink to={`t/${tenantId}/collections`} className="ml-auto text-sm">
          管理分组 <ArrowRight className="inline size-3" />
        </AppLink>
      </div>
      <Resource query={spaces}>
        {({ data }) => (
          <>
            <DataTable
              rows={data.items ?? []}
              rowId={(row) => row.id ?? ''}
              caption="空间列表"
              columns={[
                {
                  id: 'name',
                  title: '空间',
                  render: (row) => (
                    <AppLink
                      to={`t/${tenantId}/spaces/${row.id}/pages`}
                      className="flex items-center gap-2 font-medium"
                    >
                      <BookOpen className="size-4 shrink-0 text-muted-foreground" />
                      {row.name}
                    </AppLink>
                  ),
                },
                {
                  id: 'mode',
                  title: '来源',
                  render: (row) => <StateBadge value={row.mode} />,
                },
                {
                  id: 'count',
                  title: '页面',
                  render: (row) => row.pageCount ?? '—',
                },
                {
                  id: 'status',
                  title: '状态',
                  render: (row) => <StateBadge value={row.status} />,
                },
                {
                  id: 'updated',
                  title: '最近更新',
                  render: (row) => dateText(row.updatedAt),
                },
                {
                  id: 'actions',
                  title: '操作',
                  render: (row) => (
                    <AppLink to={`t/${tenantId}/spaces/${row.id}/settings`}>
                      设置
                    </AppLink>
                  ),
                },
              ]}
            />
            <CursorPagination pages={pagination} nextCursor={data.nextCursor} />
          </>
        )}
      </Resource>
    </>
  );
}

export function SpaceWorkspace({ children }: { children: ReactNode }) {
  const { api, scope } = useServices();
  const { tenantId, spaceId, panel } = scope;
  const space = useResource(['space', spaceId], (signal) =>
    api.viewSpace({ signal, params: { path: { tenantId, spaceId } } }),
  );
  const tabs = [
    ['pages', '页面'],
    ['toc', '目录'],
    ['releases', '发版'],
    ['attachments', '附件'],
    ['bundles', '导入与导出'],
    ['trash', '回收记录'],
    ['permissions', '权限'],
    ['settings', '设置'],
  ];
  return (
    <>
      <AppLink
        to={`t/${tenantId}/spaces`}
        className="mb-3 inline-block text-xs text-muted-foreground"
      >
        ← 全部空间
      </AppLink>
      <Resource query={space}>
        {({ data }) => (
          <PageHeading
            title={data.name ?? '空间'}
            description={`${data.mode === 'synced' ? '外部同步空间' : '站内创作空间'} · ${data.pageCount ?? 0} 个页面`}
          />
        )}
      </Resource>
      <TabsNav
        tabs={tabs.map(([id, label]) => ({
          id,
          label,
          to: `t/${tenantId}/spaces/${spaceId}/${id}`,
        }))}
        active={panel || 'pages'}
      />
      {children}
    </>
  );
}

export function SpaceSettingsPage() {
  const { api, scope } = useServices();
  const { tenantId, spaceId } = scope;
  const path = { tenantId, spaceId };
  const query = useResource(['space', spaceId], (signal) =>
    api.viewSpace({ signal, params: { path } }),
  );
  return (
    <Resource query={query}>
      {({ data }) => (
        <>
          <Section
            title="空间设置"
            actions={
              <Command
                label="修改空间"
                defaults={{
                  name: data.name ?? '',
                  description: data.description ?? '',
                  autoRelease: String(data.autoRelease ?? true),
                }}
                disabled={!data.allowedActions?.includes('update')}
                submit={(v, headers) =>
                  api.updateSpace({
                    params: { path, header: headers },
                    body: {
                      name: v.name,
                      description: v.description || null,
                      autoRelease: v.autoRelease === 'true',
                    },
                  })
                }
              >
                <TextField name="name" label="名称" />
                <TextField
                  name="description"
                  label="说明"
                  required={false}
                  multiline
                />
                <TextField
                  name="autoRelease"
                  label="自动发版"
                  options={['true', 'false']}
                />
              </Command>
            }
          >
            <Facts value={data} />
          </Section>
          <Section
            title="来源与生命周期"
            actions={
              <>
                <Command
                  label="转换来源模式"
                  disabled={!data.allowedActions?.includes('convert')}
                  defaults={{
                    mode: data.mode === 'authored' ? 'synced' : 'authored',
                  }}
                  submit={(v, headers) =>
                    api.convertSpace({
                      params: { path, header: headers },
                      body: { mode: v.mode },
                    })
                  }
                >
                  <TextField
                    name="mode"
                    label="目标模式"
                    options={['authored', 'synced']}
                  />
                </Command>
                <Command
                  label="归档空间"
                  danger
                  disabled={!data.allowedActions?.includes('archive')}
                  submit={(_, headers) =>
                    api.archiveSpace({ params: { path, header: headers } })
                  }
                />
                <Command
                  label="恢复空间"
                  disabled={!data.allowedActions?.includes('restore')}
                  submit={(_, headers) =>
                    api.restoreSpace({ params: { path, header: headers } })
                  }
                />
                <Command
                  label="设置发版保留数"
                  defaults={{ keep: String(data.retention ?? 7) }}
                  submit={(v, headers) =>
                    api.setRetention({
                      params: { path, header: headers },
                      body: { keep: Number(v.keep) },
                    })
                  }
                >
                  <TextField name="keep" label="保留数量" type="number" />
                </Command>
              </>
            }
          >
            <p className="text-sm text-muted-foreground">
              归档使空间停止活跃使用。来源转换和发版策略以后台校验为准。
            </p>
          </Section>
          <Section title="站点挂载">
            <Mounts />
          </Section>
          <Section title="终结空间">
            <AppLink to={`t/${tenantId}/spaces/${spaceId}/termination`}>
              <Button variant="destructive">查看删除影响与确认</Button>
            </AppLink>
          </Section>
        </>
      )}
    </Resource>
  );
}
function Mounts() {
  const { api, scope } = useServices();
  const query = useResource(['space-mounts', scope.spaceId], (signal) =>
    api.listSpaceMounts({
      signal,
      params: { path: { tenantId: scope.tenantId, spaceId: scope.spaceId } },
    }),
  );
  return (
    <Resource query={query}>{({ data }) => <Facts value={data} />}</Resource>
  );
}

import { useServices } from '@/shared/api/context';
import {
  PageHeading,
  Resource,
  Section,
  useResource,
} from '@/shared/ui/resource';
import { Command, TextField } from '@/shared/ui/operation-form';
import { DataTable } from '@/shared/ui/data-table';
import { Facts } from '@/shared/ui/facts';
import { parseContract } from '@/shared/api/validation';

export function ContentTypesPage() {
  const { api, scope } = useServices();
  const { tenantId } = scope;
  const path = { tenantId };
  const query = useResource(['content-types'], (signal) =>
    api.listContentTypes({ signal, params: { path } }),
  );
  const catalog = useResource(['content-plugin-catalog'], (signal) =>
    api.contentPluginCatalog({ signal, params: { path } }),
  );
  return (
    <>
      <PageHeading
        title="内容类型"
        description="类型定义固定解释和呈现规则，引用不可变版本。可信实现随构建登记。"
        actions={
          <Command
            label="登记定义版本"
            submit={async (v, headers) =>
              api.registerContentTypeVersion({
                params: { path, header: headers },
                body: await parseContract('Register', {
                  contentType: v.contentType,
                  ...(v.baseRevision
                    ? { baseRevision: Number(v.baseRevision) }
                    : {}),
                  definition: JSON.parse(v.definition),
                }),
              })
            }
          >
            <TextField name="contentType" label="内容类型 ID" />
            <TextField
              name="baseRevision"
              label="当前基线（新类型可留空）"
              type="number"
              required={false}
            />
            <TextField
              name="definition"
              label="定义 JSON"
              multiline
              help="定义结构以后台 ContentTypeDefinition 契约为准。可从已有版本详情复制后修改。"
            />
          </Command>
        }
      />
      <Resource query={query}>
        {({ data }) => (
          <DataTable
            rows={data.items ?? []}
            rowId={(row) => row.contentType ?? ''}
            columns={[
              {
                id: 'name',
                title: '内容类型',
                render: (row) => (
                  <div className="font-medium">
                    {row.label || row.contentType}
                    <p className="mt-1 text-xs font-normal text-muted-foreground">
                      {row.contentType} · {row.format}
                    </p>
                  </div>
                ),
              },
              {
                id: 'state',
                title: '状态',
                render: (row) => (row.enabled ? '已启用' : '已停用'),
              },
              {
                id: 'version',
                title: '当前默认版本',
                render: (row) => row.activeVersionRef,
              },
              {
                id: 'actions',
                title: '操作',
                render: (row) => (
                  <div className="flex flex-wrap gap-2">
                    <Command
                      label="查看版本列表"
                      submit={() =>
                        api.listContentTypeVersions({
                          params: {
                            path,
                            query: { contentType: row.contentType ?? '' },
                          },
                        })
                      }
                    />
                    <Command
                      label="查看固定版本"
                      defaults={{ versionRef: row.activeVersionRef ?? '' }}
                      submit={(v) =>
                        api.viewContentTypeVersion({
                          params: {
                            path: { ...path, versionRef: v.versionRef },
                          },
                        })
                      }
                    >
                      <TextField name="versionRef" label="版本引用" />
                    </Command>
                    <Command
                      label="启用或切换默认版本"
                      disabled={!data.canManage}
                      defaults={{ versionRef: row.activeVersionRef ?? '' }}
                      submit={(v, headers) =>
                        api.activateContentType({
                          params: { path, header: headers },
                          body: {
                            contentType: row.contentType ?? '',
                            baseRevision: row.revision,
                            versionRef: v.versionRef,
                          },
                        })
                      }
                    >
                      <TextField name="versionRef" label="默认版本引用" />
                    </Command>
                    <Command
                      label="停用内容类型"
                      danger
                      disabled={!data.canManage}
                      description="停用只影响新绑定资格。已有页面、历史发版与固定版本仍按后台规则处理。"
                      submit={(_, headers) =>
                        api.deactivateContentType({
                          params: { path, header: headers },
                          body: {
                            contentType: row.contentType ?? '',
                            baseRevision: row.revision,
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
      <Section title="可信内容实现目录">
        <Resource query={catalog}>
          {({ data }) => <Facts value={data} />}
        </Resource>
      </Section>
    </>
  );
}

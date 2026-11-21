import { useState } from 'react';
import { useServices } from '@/shared/api/context';
import {
  PageHeading,
  Section,
  Resource,
  useResource,
} from '@/shared/ui/resource';
import { Command, TextField } from '@/shared/ui/operation-form';
import { DataTable } from '@/shared/ui/data-table';
import { Facts } from '@/shared/ui/facts';
import { AppLink } from '@/shared/ui/navigation';
import { parseContract } from '@/shared/api/validation';
import { compileFiles } from '@/shared/editor/compile';
import { downloadBlob } from '@/shared/api/transfer';
import { Sandbox } from './sandbox';
import type { components } from '@/shared/api/generated/types';

const initialSource = {
  files: {
    'index.ts':
      "class ExampleView extends HTMLElement { connectedCallback() { this.textContent = this.value || ''; } }\ncustomElements.define('example-view-v1', ExampleView);",
  },
  manifest: JSON.stringify({
    id: 'example.text',
    name: '示例呈现',
    version: '1.0.0',
    apiVersion: 1,
    contentTypes: ['txt'],
    editors: [],
    renderers: [
      {
        id: 'text',
        label: '文本',
        tagName: 'example-view-v1',
        contentTypes: ['txt'],
      },
    ],
  }),
  configuration: '{}',
  fixtures: JSON.stringify([
    {
      id: 'text',
      label: '基本文本',
      contentType: 'txt',
      value: 'Hello Edition',
      expectedText: 'Hello Edition',
    },
  ]),
  dependencyLock: '{}',
  baselineRef: 'browser-es2022-v1',
};
export function PluginsPage() {
  const { api, scope } = useServices();
  const { tenantId } = scope;
  const path = { tenantId };
  const query = useResource(['plugin-developments'], (signal) =>
    api.listPluginDevelopments({ signal, params: { path } }),
  );
  return (
    <>
      <PageHeading
        title="插件开发"
        description="保存开发稿、构建固定候选，在隔离环境验证。候选不会自动进入生产。"
        actions={
          <Command
            label="创建开发稿"
            defaults={{
              name: '',
              contentType: 'txt',
              ...sourceDefaults(initialSource),
            }}
            submit={async (v, headers) =>
              api.createPluginDevelopment({
                params: { path, header: headers },
                body: await parseContract('Create', {
                  name: v.name,
                  contentType: v.contentType,
                  source: readSource(v),
                }),
              })
            }
          >
            <TextField name="name" label="名称" />
            <TextField name="contentType" label="内容类型" />
            <SourceFields />
          </Command>
        }
      />
      <Resource query={query}>
        {({ data }) => (
          <DataTable
            rows={data.items ?? []}
            rowId={(row) => row.id ?? ''}
            columns={[
              {
                id: 'name',
                title: '开发稿',
                render: (row) => (
                  <AppLink to={`t/${tenantId}/plugins/${row.id}`}>
                    {row.name}
                  </AppLink>
                ),
              },
              {
                id: 'type',
                title: '内容类型',
                render: (row) => row.contentType,
              },
              { id: 'revision', title: '基线', render: (row) => row.revision },
            ]}
          />
        )}
      </Resource>
    </>
  );
}
export function PluginWorkbench() {
  const { api, scope } = useServices();
  const { tenantId, resourceId: id } = scope;
  const path = { tenantId, id };
  const [candidate, setCandidate] =
    useState<components['schemas']['Candidate']>();
  const query = useResource(['plugin-development', id], (signal) =>
    api.viewPluginDevelopment({ signal, params: { path } }),
  );
  const candidates = useResource(['plugin-candidates', id], (signal) =>
    api.listPluginCandidates({ signal, params: { path } }),
  );
  const reports = useResource(['plugin-verifications', id], (signal) =>
    api.listPluginVerifications({
      signal,
      params: { path: { tenantId }, query: { developmentId: id } },
    }),
  );
  return (
    <>
      <PageHeading
        title="插件工作台"
        description="源码基线、固定候选和验证证据分别维护。"
      />
      <Resource query={query}>
        {({ data }) => (
          <Section
            title={data.name ?? '开发稿'}
            actions={
              <>
                <Command
                  label="编辑源码与配置"
                  defaults={{
                    name: data.name ?? '',
                    contentType: data.contentType ?? '',
                    ...sourceDefaults(data.source ?? initialSource),
                  }}
                  submit={async (v, headers) =>
                    api.savePluginDevelopment({
                      params: { path, header: headers },
                      body: await parseContract('Save', {
                        baseRevision: data.revision,
                        name: v.name,
                        contentType: v.contentType,
                        source: readSource(v),
                      }),
                    })
                  }
                >
                  <TextField name="name" label="名称" />
                  <TextField name="contentType" label="内容类型" />
                  <SourceFields />
                </Command>
                <Command
                  label="编译固定候选"
                  defaults={{
                    entryPoint:
                      Object.keys(data.source?.files ?? {})[0] ?? 'index.ts',
                  }}
                  submit={async (v, headers, signal) => {
                    const bundle = await compileFiles(
                      data.source?.files ?? {},
                      v.entryPoint,
                      signal,
                    );
                    const result = await api.compilePluginCandidate({
                      signal,
                      params: { path, header: headers },
                      body: {
                        baseRevision: data.revision,
                        sourceDigest: data.sourceDigest ?? '',
                        entryPoint: v.entryPoint,
                        bundle,
                        environment: 'browser-es2022-v1',
                      },
                    });
                    setCandidate(result.data);
                    return result;
                  }}
                >
                  <TextField name="entryPoint" label="入口文件" />
                </Command>
                <Command
                  label="归档开发稿"
                  danger
                  submit={(_, headers) =>
                    api.deletePluginDevelopment({
                      params: {
                        path,
                        query: { baseRevision: data.revision ?? 0 },
                        header: headers,
                      },
                    })
                  }
                />
              </>
            }
          >
            <Facts
              value={{
                revision: data.revision,
                sourceDigest: data.sourceDigest,
                source: data.source,
              }}
            />
          </Section>
        )}
      </Resource>
      <Section title="固定候选">
        <Resource query={candidates}>
          {({ data }) => (
            <DataTable
              rows={data.items ?? []}
              rowId={(row) => row.id ?? ''}
              columns={[
                { id: 'id', title: '候选', render: (row) => row.id },
                {
                  id: 'baseline',
                  title: '源码基线',
                  render: (row) => row.sourceRevision,
                },
                {
                  id: 'actions',
                  title: '操作',
                  render: (row) => (
                    <Command
                      label="载入并验证候选"
                      submit={async () => {
                        const result = await api.viewPluginCandidate({
                          params: {
                            path: { ...path, candidateId: row.id ?? '' },
                          },
                        });
                        setCandidate(result.data);
                        return result;
                      }}
                    />
                  ),
                },
              ]}
            />
          )}
        </Resource>
      </Section>
      {candidate?.id && <Sandbox key={candidate.id} candidate={candidate} />}
      <Section title="验证报告">
        <Resource query={reports}>
          {({ data }) => (
            <DataTable
              rows={data.items ?? []}
              rowId={(row) => row.id ?? ''}
              columns={[
                { id: 'id', title: '报告', render: (row) => row.id },
                {
                  id: 'browser',
                  title: '浏览器证据',
                  render: (row) => String(row.browserPassed),
                },
                {
                  id: 'server',
                  title: '服务端校验',
                  render: (row) => String(row.serverPassed),
                },
                {
                  id: 'actions',
                  title: '操作',
                  render: (row) => (
                    <div className="flex gap-2">
                      <Command
                        label="查看完整报告"
                        submit={() =>
                          api.viewPluginVerification({
                            params: { path: { tenantId, id: row.id ?? '' } },
                          })
                        }
                      />
                      <Command
                        label="导出报告"
                        submit={async () => {
                          const result = await api.viewPluginVerification({
                            params: { path: { tenantId, id: row.id ?? '' } },
                          });
                          downloadBlob(
                            new Blob(
                              [
                                JSON.stringify(
                                  { candidate, verification: result.data },
                                  null,
                                  2,
                                ),
                              ],
                              { type: 'application/json' },
                            ),
                            `plugin-verification-${row.id}.json`,
                          );
                        }}
                      />
                    </div>
                  ),
                },
              ]}
            />
          )}
        </Resource>
      </Section>
    </>
  );
}
function sourceDefaults(source: components['schemas']['Source']) {
  return {
    files: JSON.stringify(source.files ?? {}, null, 2),
    manifest: source.manifest ?? '{}',
    configuration: source.configuration ?? '{}',
    fixtures: source.fixtures ?? '[]',
    dependencyLock: source.dependencyLock ?? '{}',
    baselineRef: source.baselineRef ?? '',
  };
}
function readSource(values: Record<string, string>) {
  return {
    files: JSON.parse(values.files),
    manifest: values.manifest,
    configuration: values.configuration,
    fixtures: values.fixtures,
    dependencyLock: values.dependencyLock,
    baselineRef: values.baselineRef,
  };
}
function SourceFields() {
  return (
    <>
      <TextField name="files" label="源码文件映射 JSON" multiline />
      <TextField name="manifest" label="Manifest JSON" multiline />
      <TextField name="configuration" label="配置 JSON" multiline />
      <TextField name="fixtures" label="固定样例 JSON" multiline />
      <TextField name="dependencyLock" label="依赖锁 JSON" multiline />
      <TextField name="baselineRef" label="构建基准引用" />
    </>
  );
}

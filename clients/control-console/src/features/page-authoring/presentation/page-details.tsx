import { SpacePicker } from '@/features/spaces';
import { useServices } from '@/shared/api/context';
import { Section, Resource, useResource } from '@/shared/ui/resource';
import { Command, TextField } from '@/shared/ui/operation-form';
import { Facts } from '@/shared/ui/facts';

export function PageDetails() {
  const { api, scope } = useServices();
  const { tenantId, spaceId, pageId } = scope;
  const path = { tenantId, spaceId, pageId };
  const query = useResource(['page', pageId], (signal) =>
    api.viewPage({ signal, params: { path } }),
  );
  return (
    <Resource query={query}>
      {({ data }) => (
        <>
          <Section
            title="页面信息"
            actions={
              <>
                <Command
                  label="修改标题"
                  disabled={!data.allowedActions?.includes('rename')}
                  defaults={{ title: data.title ?? '' }}
                  submit={(v, headers) =>
                    api.renamePage({
                      params: { path, header: headers },
                      body: { title: v.title },
                    })
                  }
                >
                  <TextField name="title" label="标题" />
                </Command>
                <Command
                  label="修改路径"
                  disabled={!data.allowedActions?.includes('reslug')}
                  defaults={{ slug: data.slug ?? '' }}
                  submit={(v, headers) =>
                    api.reslugPage({
                      params: { path, header: headers },
                      body: { slug: v.slug },
                    })
                  }
                >
                  <TextField name="slug" label="新相对路径" />
                </Command>
                <Command
                  label="迁移页面"
                  disabled={!data.allowedActions?.includes('transfer')}
                  submit={(v, headers) =>
                    api.transferPage({
                      params: { path, header: headers },
                      body: { toSpace: v.toSpace, slug: v.slug },
                    })
                  }
                >
                  <SpacePicker name="toSpace" label="目标空间" />
                  <TextField name="slug" label="目标路径" />
                </Command>
                <Command
                  label="设置图标"
                  submit={(v, headers) =>
                    api.setPageIcon({
                      params: { path, header: headers },
                      body: { icon: v.icon || null },
                    })
                  }
                >
                  <TextField
                    name="icon"
                    label="图标 URL，留空清除"
                    required={false}
                  />
                </Command>
                <Command
                  label="页面进版"
                  disabled={!data.allowedActions?.includes('publish')}
                  description="页面会被标记为可发版。是否已上线需在发版与站点交付中确认。"
                  submit={(_, headers) =>
                    api.publishPage({ params: { path, header: headers } })
                  }
                />
                <Command
                  label="撤销进版"
                  disabled={!data.allowedActions?.includes('unpublish')}
                  submit={(_, headers) =>
                    api.unpublishPage({ params: { path, header: headers } })
                  }
                />
                <Command
                  label="回收页面"
                  danger
                  submit={(_, headers) =>
                    api.trashPage({ params: { path, header: headers } })
                  }
                />
              </>
            }
          >
            <Facts
              value={{
                title: data.title,
                slug: data.slug,
                status: data.status,
                contentType: data.contentType,
                versionRef: data.versionRef,
                revision: data.revision,
                driftFlag: data.driftFlag,
              }}
            />
          </Section>
          <Section
            title="SEO 与属性"
            actions={
              <>
                <Command
                  label="修改 SEO"
                  defaults={{
                    title: data.seo?.title ?? '',
                    description: data.seo?.description ?? '',
                    keywords: data.seo?.keywords ?? '',
                    ogImage: data.seo?.ogImage ?? '',
                    noIndex: String(data.seo?.noIndex ?? false),
                  }}
                  submit={(v, headers) =>
                    api.setPageSeo({
                      params: { path, header: headers },
                      body: {
                        title: v.title || null,
                        description: v.description || null,
                        keywords: v.keywords || null,
                        ogImage: v.ogImage || null,
                        noIndex: v.noIndex === 'true',
                      },
                    })
                  }
                >
                  <TextField name="title" label="SEO 标题" required={false} />
                  <TextField
                    name="description"
                    label="摘要"
                    required={false}
                    multiline
                  />
                  <TextField name="keywords" label="关键词" required={false} />
                  <TextField
                    name="ogImage"
                    label="分享图片 URL"
                    required={false}
                  />
                  <TextField
                    name="noIndex"
                    label="禁止索引"
                    options={['false', 'true']}
                  />
                </Command>
                <Command
                  label="设置属性"
                  submit={(v, headers) =>
                    api.setPageProperty({
                      params: {
                        path: { ...path, field: v.field },
                        header: headers,
                      },
                      body: { value: v.value },
                    })
                  }
                >
                  <TextField name="field" label="属性名" />
                  <TextField name="value" label="属性值" />
                </Command>
                <Command
                  label="移除属性"
                  submit={(v, headers) =>
                    api.removePageProperty({
                      params: {
                        path: { ...path, field: v.field },
                        header: headers,
                      },
                    })
                  }
                >
                  <TextField name="field" label="属性名" />
                </Command>
                <Command
                  label="添加标签"
                  submit={(v, headers) =>
                    api.tagPage({
                      params: {
                        path: { ...path, label: v.label },
                        header: headers,
                      },
                    })
                  }
                >
                  <TextField name="label" label="标签" />
                </Command>
                <Command
                  label="移除标签"
                  submit={(v, headers) =>
                    api.untagPage({
                      params: {
                        path: { ...path, label: v.label },
                        header: headers,
                      },
                    })
                  }
                >
                  <TextField name="label" label="标签" />
                </Command>
              </>
            }
          >
            <Facts
              value={{
                seo: data.seo,
                properties: data.properties,
                tags: data.tags,
              }}
            />
          </Section>
        </>
      )}
    </Resource>
  );
}

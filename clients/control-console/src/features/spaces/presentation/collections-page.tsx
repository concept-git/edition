import { useServices } from '@/shared/api/context';
import {
  PageHeading,
  Resource,
  Section,
  useResource,
} from '@/shared/ui/resource';
import { Command, TextField } from '@/shared/ui/operation-form';
import { Facts } from '@/shared/ui/facts';

export function CollectionsPage() {
  const { api, scope } = useServices();
  const { tenantId } = scope;
  const path = { tenantId };
  const query = useResource(['collections'], (signal) =>
    api.viewCollections({ signal, params: { path } }),
  );
  return (
    <>
      <PageHeading
        title="空间分组"
        description="分组用于组织空间，最多三级，不承载权限。"
        actions={
          <Command
            label="创建分组"
            submit={(v, headers) =>
              api.createCollection({
                params: { path, header: headers },
                body: {
                  name: v.name,
                  ...(v.parentId ? { parentId: v.parentId } : {}),
                },
              })
            }
          >
            <TextField name="name" label="名称" />
            <TextField name="parentId" label="父分组 ID" required={false} />
          </Command>
        }
      />
      <Section
        title="分组结构"
        actions={
          <>
            <Command
              label="修改分组"
              submit={(v, headers) =>
                api.patchCollection({
                  params: {
                    path: { ...path, collectionId: v.collectionId },
                    header: headers,
                  },
                  body: { name: v.name },
                })
              }
            >
              <TextField name="collectionId" label="分组 ID" />
              <TextField name="name" label="名称" />
            </Command>
            <Command
              label="移动分组"
              submit={(v, headers) =>
                api.moveCollection({
                  params: {
                    path: { ...path, collectionId: v.collectionId },
                    header: headers,
                  },
                  body: {
                    position: Number(v.position),
                    ...(v.parentId ? { parentId: v.parentId } : {}),
                  },
                })
              }
            >
              <TextField name="collectionId" label="分组 ID" />
              <TextField
                name="parentId"
                label="目标父分组 ID（根层留空）"
                required={false}
              />
              <TextField
                name="position"
                label="位置，从 0 开始"
                type="number"
              />
            </Command>
            <Command
              label="移除分组"
              danger
              submit={(v, headers) =>
                api.removeCollection({
                  params: {
                    path: { ...path, collectionId: v.collectionId },
                    header: headers,
                  },
                })
              }
            >
              <TextField name="collectionId" label="分组 ID" />
            </Command>
            <Command
              label="放入空间"
              submit={(v, headers) =>
                api.placeSpace({
                  params: {
                    path: {
                      ...path,
                      collectionId: v.collectionId,
                      spaceId: v.spaceId,
                    },
                    header: headers,
                  },
                  body: { position: Number(v.position || 0) },
                })
              }
            >
              <TextField name="collectionId" label="分组 ID" />
              <TextField name="spaceId" label="空间 ID" />
              <TextField
                name="position"
                label="位置"
                type="number"
                required={false}
              />
            </Command>
            <Command
              label="移出空间"
              submit={(v, headers) =>
                api.unplaceSpace({
                  params: {
                    path: {
                      ...path,
                      collectionId: v.collectionId,
                      spaceId: v.spaceId,
                    },
                    header: headers,
                  },
                })
              }
            >
              <TextField name="collectionId" label="分组 ID" />
              <TextField name="spaceId" label="空间 ID" />
            </Command>
          </>
        }
      >
        <Resource query={query}>
          {({ data }) => <Facts value={data} />}
        </Resource>
      </Section>
    </>
  );
}

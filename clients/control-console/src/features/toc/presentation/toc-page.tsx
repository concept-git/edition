import { useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useServices } from '@/shared/api/context';
import type { components } from '@/shared/api/generated/types';
import { Resource, Section, useResource } from '@/shared/ui/resource';
import { Command, TextField } from '@/shared/ui/operation-form';
import { Failure } from '@/shared/ui/feedback';
import { AppLink } from '@/shared/ui/navigation';
import { newIntent } from '@/shared/api/validation';
type Entry = components['schemas']['TocEntry'];

export function TocPage() {
  const { api, scope, actorKey } = useServices();
  const { tenantId, spaceId } = scope;
  const path = { tenantId, spaceId };
  const cache = useQueryClient();
  const [error, setError] = useState<unknown>();
  const [moving, setMoving] = useState(false);
  const query = useResource(['toc', spaceId], (signal) =>
    api.viewToc({ signal, params: { path } }),
  );
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const drag = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id || moving) return;
    const entries = flatten(query.data?.data.entries ?? []);
    const source = entries.find((row) => row.id === active.id);
    const target = entries.find((row) => row.id === over.id);
    if (!source || !target) return;
    if (!window.confirm(`将“${source.label}”移动到“${target.label}”的位置？`))
      return;
    setMoving(true);
    setError(undefined);
    try {
      await api.moveTocEntry({
        params: {
          path: { ...path, entryId: source.id ?? '' },
          header: newIntent(),
        },
        body: {
          position: target.position ?? 0,
          ...(target.parentId ? { parentId: target.parentId } : {}),
        },
      });
      await cache.invalidateQueries({
        queryKey: [actorKey, tenantId, 'toc', spaceId],
      });
    } catch (failure) {
      setError(failure);
    } finally {
      setMoving(false);
    }
  };
  return (
    <Section
      title="阅读目录"
      actions={
        <Command
          label="添加目录条目"
          defaults={{ kind: 'target' }}
          submit={(v, headers) =>
            api.addTocEntry({
              params: { path, header: headers },
              body: {
                kind: v.kind,
                label: v.label,
                ...(v.parentId ? { parentId: v.parentId } : {}),
                ...(v.targetId ? { targetId: v.targetId } : {}),
                ...(v.url ? { url: v.url } : {}),
              },
            })
          }
        >
          <TextField name="label" label="显示名称" />
          <TextField
            name="kind"
            label="条目类型"
            options={['target', 'group', 'link']}
          />
          <TextField name="parentId" label="父条目 ID" required={false} />
          <TextField
            name="targetId"
            label="页面 ID（页面条目）"
            required={false}
          />
          <TextField name="url" label="外链地址（外链条目）" required={false} />
        </Command>
      }
    >
      <p className="mb-4 text-sm text-muted-foreground">
        目录只编排阅读顺序。拖拽调整位置，也可以用“移动”明确指定父条目和位置。
      </p>
      {error !== undefined && <Failure error={error} />}
      <Resource query={query}>
        {({ data }) => (
          <DndContext
            sensors={sensors}
            onDragEnd={(event) => {
              void drag(event);
            }}
          >
            <SortableContext
              items={flatten(data.entries ?? []).map((row) => row.id ?? '')}
              strategy={verticalListSortingStrategy}
            >
              <ul aria-label="目录条目" className="divide-y">
                {flatten(data.entries ?? []).map((row) => (
                  <TocRow key={row.id} row={row} disabled={moving} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </Resource>
    </Section>
  );
}
function flatten(entries: Entry[]): Entry[] {
  return entries.flatMap((row) => [row, ...flatten(row.children ?? [])]);
}
function TocRow({ row, disabled }: { row: Entry; disabled: boolean }) {
  const { api, scope } = useServices();
  const { tenantId, spaceId } = scope;
  const path = { tenantId, spaceId, entryId: row.id ?? '' };
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: row.id ?? '', disabled });
  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        paddingInlineStart: `${Math.max(0, (row.depth ?? 1) - 1) * 20}px`,
      }}
      className="flex flex-wrap items-center gap-3 py-3"
    >
      <button
        {...attributes}
        {...listeners}
        aria-label={`拖动 ${row.label}`}
        className="p-2"
      >
        <GripVertical className="size-4" />
      </button>
      <div className="min-w-0 flex-1">
        <span className="text-sm font-medium">{row.label}</span>
        <p className="break-all text-xs text-muted-foreground">{row.id}</p>
      </div>
      {row.targetId && (
        <AppLink to={`t/${tenantId}/spaces/${spaceId}/pages/${row.targetId}`}>
          页面
        </AppLink>
      )}
      <Command
        label="改名"
        defaults={{ label: row.label ?? '' }}
        submit={(v, headers) =>
          api.relabelTocEntry({
            params: { path, header: headers },
            body: { label: v.label },
          })
        }
      >
        <TextField name="label" label="显示名称" />
      </Command>
      <Command
        label="移动"
        defaults={{
          parentId: row.parentId ?? '',
          position: String(row.position ?? 0),
        }}
        submit={(v, headers) =>
          api.moveTocEntry({
            params: { path, header: headers },
            body: {
              position: Number(v.position),
              ...(v.parentId ? { parentId: v.parentId } : {}),
            },
          })
        }
      >
        <TextField
          name="parentId"
          label="父条目 ID，根层留空"
          required={false}
        />
        <TextField name="position" label="位置，从 0 开始" type="number" />
      </Command>
      <Command
        label="移除"
        danger
        submit={(_, headers) =>
          api.removeTocEntry({ params: { path, header: headers } })
        }
      />
    </li>
  );
}

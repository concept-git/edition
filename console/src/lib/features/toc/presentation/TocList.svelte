<script lang="ts">
  import { dndzone, type DndEvent } from 'svelte-dnd-action';
  import { flip } from 'svelte/animate';
  import Self from './TocList.svelte';
  import Button from '#lib/shared/ui/Button.svelte';
  import { kindLabel, type TocNode } from '../domain/toc';

  let {
    items,
    parentId,
    flipDurationMs,
    canEdit,
    onconsider,
    onfinalize,
    onnudge
  }: {
    items: TocNode[];
    parentId: string | null;
    flipDurationMs: number;
    canEdit: boolean;
    onconsider: (parentId: string | null, event: CustomEvent<DndEvent<TocNode>>) => void;
    onfinalize: (parentId: string | null, event: CustomEvent<DndEvent<TocNode>>) => void;
    onnudge: (id: string, parentId: string | null, position: number) => void;
  } = $props();

  const options = $derived({
    items,
    type: 'toc',
    flipDurationMs,
    dragDisabled: !canEdit,
    dropAnimationDisabled: true,
    useCursorForDetection: true,
    autoAriaDisabled: true,
    dropTargetStyle: {}
  });
  const root = $derived(parentId === null);
</script>

<ul
  use:dndzone={options}
  role={root ? 'tree' : 'group'}
  aria-label={root ? '目录' : undefined}
  class={root ? 'flex flex-col gap-2' : 'mt-2 flex flex-col gap-2 pl-4'}
  onconsider={(event) => onconsider(parentId, event)}
  onfinalize={(event) => onfinalize(parentId, event)}
>
  {#each items as item, index (item.isDndShadowItem ? 'shadow' : item.id)}
    <li
      role={item.isDndShadowItem ? 'presentation' : 'treeitem'}
      aria-label={item.isDndShadowItem ? undefined : item.label}
      aria-hidden={item.isDndShadowItem ? 'true' : undefined}
      class={item.isDndShadowItem ? 'h-8 rounded-nav border border-dashed border-line' : 'rounded-nav border border-line bg-surface'}
      animate:flip={{ duration: flipDurationMs }}
    >
      {#if !item.isDndShadowItem}
        <div class="flex flex-wrap items-center gap-2 px-3 py-2">
          <span class="text-sm text-ink">{item.label}</span>
          <span class="rounded-nav bg-chip px-2 py-0.5 text-xs font-normal text-ink">{kindLabel(item.kind)}</span>
          {#if item.kind === 'link' && item.url}
            <span class="text-sm text-muted">{item.url}</span>
          {/if}
          {#if canEdit}
            <span class="ml-auto flex gap-1" onkeydown={(event) => event.stopPropagation()}>
              {#if index > 0}
                <Button type="button" variant="quiet" onclick={() => onnudge(item.id, parentId, index - 1)}>上移</Button>
              {/if}
              {#if index < items.length - 1}
                <Button type="button" variant="quiet" onclick={() => onnudge(item.id, parentId, index + 1)}>下移</Button>
              {/if}
            </span>
          {/if}
        </div>
        <Self
          items={item.children}
          parentId={item.id}
          {flipDurationMs}
          {canEdit}
          {onconsider}
          {onfinalize}
          {onnudge}
        />
      {/if}
    </li>
  {/each}
</ul>

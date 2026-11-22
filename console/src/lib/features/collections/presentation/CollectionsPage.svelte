<script lang="ts">
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import Button from '#lib/shared/ui/Button.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import SelectField from '#lib/shared/ui/SelectField.svelte';
  import TextField from '#lib/shared/ui/TextField.svelte';
  import { createCollection, listPlaceableSpaces, placeSpace, resolveTenant, viewCollections } from '../data/http-collections';
  import {
    parentChoices,
    sameIntent,
    spacesIn,
    withPlacement,
    type CollectionNode,
    type PlaceableSpace,
    type WriteIntent
  } from '../domain/collection';
  import { createRejection, placeRejection, queryFailureMessage } from './messages';

  const session = getSession();
  let tenantId = $state<string | null>(null);
  let collections = $state<CollectionNode[] | null>(null);
  let spaces = $state<PlaceableSpace[]>([]);
  let canCreate = $state(false);
  let canPlace = $state(false);
  let queryMessage = $state('');
  let name = $state('');
  let parentId = $state('');
  let chosenSpace = $state('');
  let targetId = $state('');
  let pending = $state(false);
  let placing = $state(false);
  let rejection = $state('');
  let placeMessage = $state('');
  let intent: WriteIntent | null = null;
  let placeIntent: WriteIntent | null = null;

  const parents = $derived(parentChoices(collections ?? []));

  function keepSelections(nextSpaces: PlaceableSpace[], nextCollections: CollectionNode[]) {
    const choices = parentChoices(nextCollections);
    if (!nextSpaces.some((space) => space.id === chosenSpace)) chosenSpace = nextSpaces[0]?.id ?? '';
    if (!choices.some((choice) => choice.value === targetId)) targetId = choices[0]?.value ?? '';
    if (parentId !== '' && !choices.some((choice) => choice.value === parentId)) parentId = '';
  }

  async function load() {
    const token = session.accessToken;
    if (!token) {
      collections = null;
      queryMessage = '分组没有载入。';
      return;
    }
    const tenant = await resolveTenant(token);
    if (!tenant.ok) {
      queryMessage = queryFailureMessage(tenant.failure);
      return;
    }
    tenantId = tenant.body;
    const tree = await viewCollections(token, tenant.body);
    if (!tree.ok) {
      queryMessage = queryFailureMessage(tree.failure);
      return;
    }
    const listed = await listPlaceableSpaces(token, tenant.body);
    if (!listed.ok) {
      collections = tree.body.collections;
      canCreate = tree.body.canCreate;
      canPlace = tree.body.canPlace;
      queryMessage = queryFailureMessage(listed.failure);
      return;
    }
    collections = tree.body.collections;
    canCreate = tree.body.canCreate;
    canPlace = tree.body.canPlace;
    spaces = listed.body;
    keepSelections(spaces, collections);
    queryMessage = '';
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    const token = session.accessToken;
    if (pending || !token || !tenantId) return;
    const fingerprint = `${parentId}\n${name}`;
    intent = sameIntent(intent, fingerprint);
    const key = intent.key;
    pending = true;
    rejection = '';
    const result = await createCollection(token, tenantId, { name, parentId: parentId || null }, key);
    pending = false;
    if (!result.ok) {
      rejection = createRejection(result.failure);
      return;
    }
    intent = null;
    name = '';
    rejection = '';
    collections = result.body.collections;
    canCreate = result.body.canCreate;
    canPlace = result.body.canPlace;
    keepSelections(spaces, collections);
  }

  async function submitPlace(event: SubmitEvent) {
    event.preventDefault();
    const token = session.accessToken;
    if (placing || !token || !tenantId || !chosenSpace || !targetId) return;
    const fingerprint = `${chosenSpace}\n${targetId}`;
    placeIntent = sameIntent(placeIntent, fingerprint);
    const key = placeIntent.key;
    placing = true;
    placeMessage = '';
    const result = await placeSpace(token, tenantId, targetId, chosenSpace, key);
    placing = false;
    if (!result.ok) {
      placeMessage = placeRejection(result.failure);
      return;
    }
    placeIntent = null;
    spaces = withPlacement(spaces, result.body);
  }

  void load();
</script>

{#snippet nodes(items: CollectionNode[], labelled: boolean)}
  <ul class="flex flex-col gap-2" aria-label={labelled ? '分组' : undefined}>
    {#each items as node (node.id)}
      <li>
        <article aria-label={node.name} class="rounded-nav border border-line bg-surface px-3 py-2">
          <h3 class="text-sm font-medium text-ink">{node.name}</h3>
          {#if spacesIn(spaces, node.id).length > 0}
            <ul aria-label={`${node.name}中的空间`} class="mt-2 flex flex-col gap-1">
              {#each spacesIn(spaces, node.id) as space (space.id)}
                <li class="text-sm text-ink">{space.name}</li>
              {/each}
            </ul>
          {/if}
          {#if node.children.length > 0}
            <div class="mt-2 pl-4">
              {@render nodes(node.children, false)}
            </div>
          {/if}
        </article>
      </li>
    {/each}
  </ul>
{/snippet}

<PageHeader title="分组" description="分组最多 3 级，只做归类，不承载权限、地址或生命周期。" />

{#if queryMessage}
  <div role="alert" class="mb-4 flex flex-wrap items-center gap-3 text-sm text-ink">
    <p>{queryMessage}</p>
    <Button variant="quiet" onclick={() => void load()}>重试</Button>
  </div>
{/if}

{#if collections !== null && collections.length === 0 && queryMessage === ''}
  <EmptyState title="没有数据" description="登录后可以把空间放进分组。" />
{/if}

{#if collections !== null && collections.length > 0}
  <div class="mb-6">
    {@render nodes(collections, true)}
  </div>
{/if}

{#if canCreate}
  <form aria-label="创建分组" class="mt-6 flex max-w-md flex-col gap-4" onsubmit={submit}>
    <SelectField label="上级" bind:value={parentId} options={[{ value: '', label: '根' }, ...parents]} />
    <TextField label="名称" name="name" required bind:value={name} />
    {#if rejection}
      <p role="alert" class="text-sm text-ink">{rejection}</p>
    {/if}
    <div>
      <Button type="submit" disabled={pending}>创建</Button>
    </div>
  </form>
{/if}

{#if canPlace && spaces.length > 0 && parents.length > 0}
  <form aria-label="放入分组" class="mt-6 flex max-w-md flex-col gap-4" onsubmit={submitPlace}>
    <SelectField label="空间" bind:value={chosenSpace} options={spaces.map((space) => ({ value: space.id, label: space.name }))} />
    <SelectField label="分组" bind:value={targetId} options={parents} />
    {#if placeMessage}
      <p role="alert" class="text-sm text-ink">{placeMessage}</p>
    {/if}
    <div>
      <Button type="submit" disabled={placing}>放入</Button>
    </div>
  </form>
{/if}

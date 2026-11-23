<script lang="ts">
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import Button from '#lib/shared/ui/Button.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import SelectField from '#lib/shared/ui/SelectField.svelte';
  import TextField from '#lib/shared/ui/TextField.svelte';
  import { listPages, pagesByTag, resolveTenant, tagPage } from '../data/http-tags';
  import { sameIntent, withTag, type TaggedHit, type TagPageItem, type WriteIntent } from '../domain/tag';
  import { findRejection, queryFailureMessage, tagRejection } from './messages';

  let { spaceId }: { spaceId: string } = $props();

  const session = getSession();
  let tenantId = $state<string | null>(null);
  let pages = $state<TagPageItem[] | null>(null);
  let pageId = $state('');
  let label = $state('');
  let query = $state('');
  let found = $state<TaggedHit[] | null>(null);
  let foundLabel = $state('');
  let queryMessage = $state('');
  let tagMessage = $state('');
  let findMessage = $state('');
  let pending = $state(false);
  let searching = $state(false);
  let intent: WriteIntent | null = null;

  async function load(id: string) {
    const token = session.accessToken;
    if (!token) {
      pages = null;
      queryMessage = '页面没有载入。';
      return;
    }
    const tenant = await resolveTenant(token);
    if (!tenant.ok) {
      queryMessage = queryFailureMessage(tenant.failure);
      return;
    }
    tenantId = tenant.body;
    const listed = await listPages(token, tenant.body, id);
    if (!listed.ok) {
      queryMessage = queryFailureMessage(listed.failure);
      return;
    }
    pages = listed.body;
    if (!listed.body.some((item) => item.id === pageId)) pageId = listed.body[0]?.id ?? '';
    queryMessage = '';
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    const token = session.accessToken;
    const nextLabel = label.trim();
    if (pending || !token || !tenantId || !pageId || !nextLabel) return;
    intent = sameIntent(intent, `${pageId}\n${nextLabel}`);
    const key = intent.key;
    pending = true;
    tagMessage = '';
    const result = await tagPage(token, tenantId, spaceId, pageId, nextLabel, key);
    pending = false;
    if (!result.ok) {
      tagMessage = tagRejection(result.failure);
      return;
    }
    intent = null;
    label = '';
    pages = withTag(pages ?? [], result.body);
  }

  async function search(event: SubmitEvent) {
    event.preventDefault();
    const token = session.accessToken;
    const nextLabel = query.trim();
    if (searching || !token || !tenantId || !nextLabel) return;
    searching = true;
    findMessage = '';
    const result = await pagesByTag(token, tenantId, nextLabel);
    searching = false;
    if (!result.ok) {
      findMessage = findRejection(result.failure);
      return;
    }
    foundLabel = nextLabel;
    found = result.body;
  }

  $effect(() => {
    void load(spaceId);
  });
</script>

<PageHeader level={2} title="标签" description="标签把页面跨位置聚在一起。" />

{#if queryMessage}
  <div role="alert" class="mb-4 flex flex-wrap items-center gap-3 text-sm text-ink">
    <p>{queryMessage}</p>
    <Button variant="quiet" onclick={() => void load(spaceId)}>重试</Button>
  </div>
{:else if pages !== null && pages.length === 0}
  <EmptyState title="没有数据" description="登录后可以给页面打标签。" />
{:else if pages !== null}
  <ul aria-label="页面" class="mb-6 flex flex-col gap-2">
    {#each pages as item (item.id)}
      <li class="rounded-nav border border-line bg-surface px-3 py-2 text-sm text-ink">
        <span>{item.title}</span>
        {#each item.tags as tag (tag)}
          <span class="ml-2 rounded-nav bg-chip px-2 py-0.5 text-xs font-normal text-ink">{tag}</span>
        {/each}
      </li>
    {/each}
  </ul>

  <form aria-label="标记页面" class="flex max-w-md flex-col gap-4" onsubmit={submit}>
    <SelectField label="页面" bind:value={pageId} options={pages.map((item) => ({ value: item.id, label: item.title }))} />
    <TextField label="标签" name="label" required bind:value={label} />
    {#if tagMessage}
      <p role="alert" class="text-sm text-ink">{tagMessage}</p>
    {/if}
    <div>
      <Button type="submit" disabled={pending}>标记</Button>
    </div>
  </form>

  <form aria-label="按标签查找" class="mt-6 flex max-w-md flex-col gap-4" onsubmit={search}>
    <TextField label="标签" name="query" required bind:value={query} />
    {#if findMessage}
      <p role="alert" class="text-sm text-ink">{findMessage}</p>
    {/if}
    <div>
      <Button type="submit" disabled={searching}>查找</Button>
    </div>
  </form>

  {#if found !== null}
    <ul aria-label={foundLabel} class="mt-4 flex flex-col gap-2">
      {#each found as hit (hit.id)}
        <li class="text-sm text-ink">{hit.title}</li>
      {/each}
    </ul>
  {/if}
{/if}

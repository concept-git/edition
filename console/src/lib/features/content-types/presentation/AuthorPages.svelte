<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import Button from '#lib/shared/ui/Button.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import SelectField from '#lib/shared/ui/SelectField.svelte';
  import TextField from '#lib/shared/ui/TextField.svelte';
  import { listContentTypes, resolveTenant, viewContentTypeVersion } from '../data/http-content-types';
  import { createPage, listPages, viewPage } from '../data/http-pages';
  import type { AuthorPage } from '../domain/author-page';
  import { contentTypeFailure, readFailure, retrySameIntent, sameIntent, type ContentTypeState, type WriteIntent } from '../domain/content-type';

  let { spaceId }: { spaceId: string } = $props();
  const session = getSession();

  let tenantId = $state<string | null>(null);
  let types = $state<ContentTypeState[] | null>(null);
  let pages = $state<AuthorPage[] | null>(null);
  let opened = $state<AuthorPage | null>(null);
  let loadError = $state('');
  let notice = $state('');
  let pending = $state(false);
  let title = $state('');
  let slug = $state('');
  let contentType = $state('');
  let createIntent: WriteIntent | null = null;
  let generation = 0;

  const enabled = $derived(
    (types ?? []).filter((item) => item.enabled).map((item) => ({ value: item.contentType, label: item.label }))
  );

  async function load(id: string) {
    const request = ++generation;
    const token = session.accessToken;
    if (!token) {
      loadError = '页面没有载入。';
      return;
    }
    const tenant = await resolveTenant(token);
    if (request !== generation) return;
    if (!tenant.ok) {
      loadError = readFailure(tenant.failure, '页面');
      return;
    }
    tenantId = tenant.body;
    const [listedTypes, listedPages] = await Promise.all([
      listContentTypes(token, tenant.body),
      listPages(token, tenant.body, id)
    ]);
    if (request !== generation) return;
    if (!listedTypes.ok) {
      loadError = readFailure(listedTypes.failure, '内容类型');
      return;
    }
    if (!listedPages.ok) {
      loadError = readFailure(listedPages.failure, '页面');
      return;
    }
    types = listedTypes.body.items ?? [];
    pages = listedPages.body.items ?? [];
    loadError = '';
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    const token = session.accessToken;
    if (pending || !token || !tenantId) return;
    const type = (types ?? []).find((item) => item.enabled && item.contentType === contentType);
    if (!type) {
      notice = '请选择已启用的内容类型。';
      return;
    }
    const version = await viewContentTypeVersion(token, tenantId, type.activeVersionRef);
    if (!version.ok) {
      notice = readFailure(version.failure, '版本');
      return;
    }
    const body = {
      format: type.format,
      title: title.trim(),
      slug: slug.trim(),
      contentType: type.contentType,
      versionRef: version.body.versionRef,
      interpretation: version.body.definition.defaultInterpretation ?? {}
    };
    createIntent = sameIntent(createIntent, JSON.stringify(body));
    pending = true;
    notice = '';
    const result = await createPage(token, tenantId, spaceId, body, createIntent.key);
    pending = false;
    if (!result.ok) {
      if (!retrySameIntent(result.failure.status)) createIntent = null;
      notice = contentTypeFailure(result.failure);
      return;
    }
    createIntent = null;
    title = '';
    slug = '';
    pages = [...(pages ?? []).filter((item) => item.id !== result.body.id), result.body];
  }

  async function open(pageId: string) {
    const token = session.accessToken;
    if (!token || !tenantId) return;
    const result = await viewPage(token, tenantId, spaceId, pageId);
    if (!result.ok) {
      notice = readFailure(result.failure, '页面');
      return;
    }
    opened = result.body;
  }

  onDestroy(() => {
    generation += 1;
  });

  void load(untrack(() => spaceId));
</script>

<PageHeader level={2} title="页面" description="启用的内容类型可以在这里选用。停用后，已有页面仍按创建时的解释打开。" />

{#if loadError}
  <p role="alert" class="text-sm text-ink">{loadError}</p>
{:else if pages === null || types === null}
  <p class="text-sm text-muted">正在载入</p>
{:else}
  {#if notice}
    <p role="alert" class="mb-4 text-sm text-ink">{notice}</p>
  {/if}
  {#if pages.length === 0}
    <EmptyState title="没有数据" description="登录后可以创建页面。" />
  {:else}
    <ul aria-label="页面" class="mb-6 flex flex-col gap-2">
      {#each pages as item (item.id)}
        <li class="flex items-center justify-between gap-3 border-b border-line py-2 text-sm text-ink last:border-b-0">
          <span>{item.title}</span>
          <Button type="button" variant="quiet" onclick={() => void open(item.id)}>打开</Button>
        </li>
      {/each}
    </ul>
  {/if}
  {#if opened}
    <section aria-label="页面解释" class="mb-6 rounded-card border border-line bg-surface p-5">
      <h3 class="text-sm font-semibold text-ink">{opened.title}</h3>
      <p class="mt-2 text-sm text-ink">版本 {opened.versionRef}</p>
      <pre class="mt-3 overflow-auto text-xs leading-5 text-ink">{JSON.stringify(opened.interpretation, null, 2)}</pre>
    </section>
  {/if}
  <form aria-label="创建页面" class="flex max-w-xl flex-col gap-3" onsubmit={submit}>
    <TextField label="标题" required bind:value={title} />
    <TextField label="路径" required bind:value={slug} />
    <SelectField label="内容类型" bind:value={contentType} options={enabled} />
    <div>
      <Button type="submit" disabled={pending}>创建页面</Button>
    </div>
  </form>
{/if}

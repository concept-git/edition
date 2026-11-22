<script lang="ts">
  import { onDestroy } from 'svelte';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import Button from '#lib/shared/ui/Button.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import SectionCard from '#lib/shared/ui/SectionCard.svelte';
  import SelectField from '#lib/shared/ui/SelectField.svelte';
  import TextField from '#lib/shared/ui/TextField.svelte';
  import {
    activateContentType,
    contentPluginCatalog,
    deactivateContentType,
    listContentTypes,
    listContentTypeVersions,
    registerContentTypeVersion,
    resolveTenant,
    viewContentTypeVersion
  } from '../data/http-content-types';
  import {
    baselineFor,
    buildDefinition,
    contentTypeFailure,
    definitionText,
    formatOptions,
    readFailure,
    renderHostOptions,
    retrySameIntent,
    sameIntent,
    type ContentTypeState,
    type ContentTypeVersion,
    type PluginDescriptor,
    type VersionSummary,
    type WriteIntent
  } from '../domain/content-type';

  const session = getSession();
  const interpretationId = $props.id();

  let tenantId = $state<string | null>(null);
  let types = $state<ContentTypeState[] | null>(null);
  let canManage = $state(false);
  let catalog = $state<PluginDescriptor[]>([]);
  let selected = $state<string | null>(null);
  let versions = $state<VersionSummary[]>([]);
  let viewed = $state<ContentTypeVersion | null>(null);
  let loadError = $state('');
  let notice = $state('');
  let pending = $state(false);
  let contentType = $state('');
  let version = $state('');
  let label = $state('');
  let format = $state('json');
  let mediaType = $state('');
  let language = $state('');
  let renderHost = $state('browser');
  let interpretation = $state('');
  let registerIntent: WriteIntent | null = null;
  let activateIntent: WriteIntent | null = null;
  let deactivateIntent: WriteIntent | null = null;
  let generation = 0;

  const current = $derived(types?.find((item) => item.contentType === selected) ?? null);

  async function load() {
    const request = ++generation;
    const token = session.accessToken;
    if (!token) {
      loadError = '内容类型没有载入。';
      return;
    }
    const tenant = await resolveTenant(token);
    if (request !== generation) return;
    if (!tenant.ok) {
      loadError = readFailure(tenant.failure, '内容类型');
      return;
    }
    tenantId = tenant.body;
    const [listed, plugins] = await Promise.all([listContentTypes(token, tenant.body), contentPluginCatalog(token, tenant.body)]);
    if (request !== generation) return;
    if (!listed.ok) {
      loadError = readFailure(listed.failure, '内容类型');
      return;
    }
    catalog = plugins.ok ? (plugins.body.items ?? []) : [];
    types = listed.body.items ?? [];
    canManage = listed.body.canManage === true;
    if (!selected || !types.some((item) => item.contentType === selected)) selected = types[0]?.contentType ?? null;
    loadError = '';
    if (selected) await refreshVersions(token, tenant.body, selected, request);
  }

  async function refreshVersions(token: string, tenant: string, contentTypeId: string, request = generation) {
    const listed = await listContentTypeVersions(token, tenant, contentTypeId);
    if (request !== generation || selected !== contentTypeId) return;
    if (!listed.ok) {
      notice = readFailure(listed.failure, '版本');
      return;
    }
    versions = listed.body.items ?? [];
  }

  function replaceType(next: ContentTypeState) {
    types = (types ?? []).map((item) => (item.contentType === next.contentType ? next : item));
  }

  async function submitRegister(event: SubmitEvent) {
    event.preventDefault();
    const token = session.accessToken;
    if (pending || !token || !tenantId || types === null) return;
    const drafted = buildDefinition(catalog, {
      contentType,
      version,
      label,
      format,
      mediaType,
      language,
      renderHost,
      interpretation
    });
    if (!drafted.ok) {
      notice = drafted.message;
      return;
    }
    const contentTypeId = drafted.definition.id;
    const body = { contentType: contentTypeId, baseRevision: baselineFor(types, contentTypeId), definition: drafted.definition };
    const fingerprint = JSON.stringify(body);
    registerIntent = sameIntent(registerIntent, fingerprint);
    pending = true;
    notice = '';
    const result = await registerContentTypeVersion(token, tenantId, body, registerIntent.key);
    pending = false;
    if (!result.ok) {
      if (!retrySameIntent(result.failure.status)) registerIntent = null;
      notice = contentTypeFailure(result.failure);
      return;
    }
    registerIntent = null;
    interpretation = '';
    version = '';
    selected = contentTypeId;
    viewed = null;
    const listed = await listContentTypes(token, tenantId);
    if (!listed.ok) {
      notice = readFailure(listed.failure, '内容类型');
      return;
    }
    types = listed.body.items ?? [];
    canManage = listed.body.canManage === true;
    await refreshVersions(token, tenantId, contentTypeId);
  }

  async function activate(type: ContentTypeState | null, versionRef: string) {
    const token = session.accessToken;
    if (pending || !token || !tenantId || !type) return;
    const body = { contentType: type.contentType, baseRevision: type.revision, versionRef };
    activateIntent = sameIntent(activateIntent, JSON.stringify(body));
    pending = true;
    notice = '';
    const result = await activateContentType(token, tenantId, body, activateIntent.key);
    pending = false;
    if (!result.ok) {
      if (!retrySameIntent(result.failure.status)) activateIntent = null;
      notice = contentTypeFailure(result.failure);
      return;
    }
    activateIntent = null;
    replaceType(result.body);
    selected = result.body.contentType;
  }

  async function deactivate(type: ContentTypeState) {
    const token = session.accessToken;
    if (pending || !token || !tenantId) return;
    const body = { contentType: type.contentType, baseRevision: type.revision };
    deactivateIntent = sameIntent(deactivateIntent, JSON.stringify(body));
    pending = true;
    notice = '';
    const result = await deactivateContentType(token, tenantId, body, deactivateIntent.key);
    pending = false;
    if (!result.ok) {
      if (!retrySameIntent(result.failure.status)) deactivateIntent = null;
      notice = contentTypeFailure(result.failure);
      return;
    }
    deactivateIntent = null;
    replaceType(result.body);
  }

  async function choose(contentTypeId: string) {
    const token = session.accessToken;
    if (!token || !tenantId) return;
    selected = contentTypeId;
    viewed = null;
    await refreshVersions(token, tenantId, contentTypeId);
  }

  async function inspect(versionRef: string) {
    const token = session.accessToken;
    if (!token || !tenantId) return;
    const result = await viewContentTypeVersion(token, tenantId, versionRef);
    if (!result.ok) {
      notice = readFailure(result.failure, '版本');
      return;
    }
    viewed = result.body;
  }

  onDestroy(() => {
    generation += 1;
  });

  void load();
</script>

<PageHeader title="内容类型" description="登记不可变版本，并启用或切换。已有正文不会因此改写。" />

{#if loadError}
  <p role="alert" class="text-sm text-ink">{loadError}</p>
{:else if types === null}
  <p class="text-sm text-muted">正在载入</p>
{:else}
  {#if notice}
    <p role="alert" class="mb-4 text-sm text-ink">{notice}</p>
  {/if}
  {#if types.length === 0}
    <EmptyState title="没有数据" description="登录后可以登记内容类型的一个版本。" />
  {:else}
    <div class="flex flex-col gap-4">
      <SectionCard title="内容类型">
        <ul aria-label="内容类型" class="flex flex-col gap-2">
          {#each types as type (type.contentType)}
            <li class="flex flex-wrap items-center justify-between gap-3 border-b border-line py-2 last:border-b-0">
              <div>
                <button type="button" class="text-sm text-ink" onclick={() => void choose(type.contentType)}>{type.label}</button>
                <p class="text-xs text-muted">{type.enabled ? '已启用' : '已停用'} · 修订 {type.revision}</p>
              </div>
              {#if canManage}
                {#if type.enabled}
                  <Button type="button" variant="quiet" disabled={pending} onclick={() => void deactivate(type)}>停用</Button>
                {:else}
                  <Button type="button" disabled={pending} onclick={() => void activate(type, type.activeVersionRef)}>启用</Button>
                {/if}
              {/if}
            </li>
          {/each}
        </ul>
      </SectionCard>
      {#if current}
        <SectionCard title="版本">
          {#if versions.length === 0}
            <EmptyState title="没有数据" description="登录后可以登记内容类型的一个版本。" />
          {:else}
            <ul aria-label="版本" class="flex flex-col gap-2">
              {#each versions as item (item.versionRef)}
                <li class="flex flex-wrap items-center justify-between gap-3 border-b border-line py-2 text-sm text-ink last:border-b-0">
                  <span>{item.version}</span>
                  <span class="flex flex-wrap items-center gap-2">
                    {#if item.versionRef === current.activeVersionRef}
                      <span>当前默认</span>
                    {/if}
                    <Button type="button" variant="quiet" onclick={() => void inspect(item.versionRef)}>查看</Button>
                    {#if canManage && item.versionRef !== current.activeVersionRef}
                      <Button type="button" variant="quiet" disabled={pending} onclick={() => void activate(current, item.versionRef)}>设为默认</Button>
                    {/if}
                  </span>
                </li>
              {/each}
            </ul>
          {/if}
        </SectionCard>
      {/if}
      {#if viewed}
        <SectionCard title="版本定义">
          <p class="text-sm text-ink">此版本已登记，不能改写。</p>
          <pre class="mt-3 overflow-auto rounded-nav bg-canvas p-3 text-xs leading-5 text-ink">{definitionText(viewed.definition)}</pre>
        </SectionCard>
      {/if}
    </div>
  {/if}
  {#if canManage}
    <form aria-label="登记版本" class="mt-6 flex max-w-xl flex-col gap-3" onsubmit={submitRegister}>
      <TextField label="类型" required bind:value={contentType} />
      <TextField label="版本" required bind:value={version} />
      <TextField label="名称" required bind:value={label} />
      <SelectField label="格式" bind:value={format} options={formatOptions} />
      <TextField label="媒体类型" required bind:value={mediaType} />
      <TextField label="语言" required bind:value={language} />
      <SelectField label="呈现宿主" bind:value={renderHost} options={renderHostOptions} />
      <div class="flex flex-col gap-1">
        <label class="text-sm text-ink" for={interpretationId}>默认解释</label>
        <textarea
          id={interpretationId}
          bind:value={interpretation}
          class="min-h-24 rounded-nav border border-line bg-surface px-3 py-2 text-sm text-ink"
        ></textarea>
      </div>
      <div>
        <Button type="submit" disabled={pending}>登记版本</Button>
      </div>
    </form>
  {/if}
{/if}

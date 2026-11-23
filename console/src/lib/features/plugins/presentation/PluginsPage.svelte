<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { ApiFailure } from '#lib/shared/api/client';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import Button from '#lib/shared/ui/Button.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import SectionCard from '#lib/shared/ui/SectionCard.svelte';
  import SourceEditor from '#lib/shared/ui/SourceEditor.svelte';
  import { compilePluginCandidate, listContentTypes, loadPluginWorkspace, savePluginDevelopment } from '../data/http-plugins';
  import {
    IntentKey,
    fileText,
    pluginEntryPoint,
    pluginEnvironment,
    pluginFailureMessage,
    queryFailureMessage,
    sourceWithFile,
    type ContentTypeState,
    type Development
  } from '../domain/plugin';

  const session = getSession();
  const saveIntent = new IntentKey();
  const candidateIntent = new IntentKey();

  let phase = $state<'loading' | 'ready' | 'empty' | 'error'>('loading');
  let queryFailure = $state<ApiFailure | null>(null);
  let tenantId = $state<string | null>(null);
  let development = $state<Development | null>(null);
  let types = $state<ContentTypeState[]>([]);
  let sourceText = $state('');
  let savedText = $state('');
  let conflict = $state<string | null>(null);
  let savedNotice = $state(false);
  let formedNotice = $state(false);
  let pending = $state(false);
  let alive = true;
  onDestroy(() => {
    alive = false;
  });

  void load(session.accessToken);

  async function load(token: string | null) {
    if (!token) {
      phase = 'error';
      queryFailure = { status: 0, code: null, traceId: null, retryAfter: null };
      return;
    }
    const result = await loadPluginWorkspace(token);
    if (!alive) return;
    if (!result.ok) {
      phase = 'error';
      queryFailure = result.failure;
      return;
    }
    tenantId = result.body.tenantId;
    types = result.body.types;
    const next = result.body.development;
    if (!next) {
      development = null;
      phase = 'empty';
      return;
    }
    const text = fileText(next.source);
    const dirty = development !== null && sourceText !== savedText;
    if (!dirty) {
      development = next;
      sourceText = text;
      savedText = text;
    }
    phase = 'ready';
  }

  async function save() {
    const token = session.accessToken;
    const current = development;
    const tenant = tenantId;
    if (!token || !current || !tenant || pending) return;
    pending = true;
    const body = {
      baseRevision: current.revision,
      name: current.name,
      contentType: current.contentType,
      source: sourceWithFile(current.source, sourceText)
    };
    const key = saveIntent.take(JSON.stringify(body));
    const result = await savePluginDevelopment(token, tenant, current.id, body, key);
    if (!alive) return;
    pending = false;
    if (!result.ok) {
      conflict = pluginFailureMessage(result.failure);
      savedNotice = false;
      return;
    }
    if (!readableDevelopment(result.body)) {
      conflict = '没有完成。本地源码仍保留。';
      return;
    }
    saveIntent.finish();
    development = { ...result.body, source: body.source };
    savedText = sourceText;
    savedNotice = true;
    conflict = null;
  }

  async function formCandidate() {
    const token = session.accessToken;
    const current = development;
    const tenant = tenantId;
    if (!token || !current || !tenant || pending) return;
    if (sourceText !== savedText) {
      conflict = '请先保存源码，再形成候选。';
      return;
    }
    pending = true;
    const body = {
      baseRevision: current.revision,
      sourceDigest: current.sourceDigest,
      entryPoint: pluginEntryPoint,
      bundle: savedText,
      environment: pluginEnvironment
    };
    const key = candidateIntent.take(JSON.stringify(body));
    const result = await compilePluginCandidate(token, tenant, current.id, body, key);
    if (!alive) return;
    pending = false;
    if (!result.ok) {
      conflict = pluginFailureMessage(result.failure);
      return;
    }
    candidateIntent.finish();
    conflict = null;
    const refreshed = await listContentTypes(token, tenant);
    if (!alive) return;
    if (!refreshed.ok) {
      formedNotice = false;
      savedNotice = false;
      conflict = queryFailureMessage(refreshed.failure);
      return;
    }
    formedNotice = true;
    types = refreshed.body;
  }

  function readableDevelopment(value: Development): boolean {
    return typeof value?.revision === 'number' && typeof value.sourceDigest === 'string';
  }
</script>

<PageHeader title="插件开发" description="按基线编辑插件源码，并形成候选。候选碰不到会话和令牌，也不改已经启用的内容类型。" />

{#if phase === 'error' && queryFailure}
  <div role="alert" class="flex flex-wrap items-center gap-3 text-sm text-ink">
    <p>{queryFailureMessage(queryFailure)}</p>
    <Button variant="quiet" onclick={() => void load(session.accessToken)}>重试</Button>
  </div>
{:else if phase === 'empty'}
  <EmptyState title="没有数据" description="还没有可编辑的插件源码。" />
{:else if phase === 'ready' && development}
  <div class="flex max-w-3xl flex-col gap-4">
    <SectionCard title="生产内容类型">
      {#if types.length === 0}
        <p class="text-sm text-muted">没有已登记的内容类型。</p>
      {:else}
        <ul class="flex flex-col gap-2">
          {#each types as type (type.contentType)}
            <li class="text-sm text-ink">
              <span>{type.label}</span>
              {#if type.enabled && type.activeVersionRef}
                <span>启用版本 {type.activeVersionRef}</span>
              {:else}
                <span>未启用</span>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </SectionCard>

    <SectionCard title={development.name}>
      <p class="mb-3 text-sm text-muted">{development.contentType}</p>
      <SourceEditor bind:value={sourceText} label="插件源码" language="javascript" />
      <div class="mt-3 flex flex-col gap-2">
        {#if conflict}
          <p role="alert" class="text-sm text-ink">{conflict}</p>
        {/if}
        {#if savedNotice}
          <p role="status" class="text-sm text-muted">已保存</p>
        {/if}
        {#if formedNotice}
          <p role="status" class="text-sm text-muted">已形成候选</p>
        {/if}
        <div class="flex flex-wrap gap-2">
          <Button variant="ink" disabled={pending} onclick={() => void save()}>保存</Button>
          <Button variant="quiet" disabled={pending} onclick={() => void formCandidate()}>形成候选</Button>
        </div>
      </div>
    </SectionCard>
  </div>
{/if}

<script lang="ts">
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import Button from '#lib/shared/ui/Button.svelte';
  import CheckField from '#lib/shared/ui/CheckField.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import SectionCard from '#lib/shared/ui/SectionCard.svelte';
  import SelectField from '#lib/shared/ui/SelectField.svelte';
  import TextField from '#lib/shared/ui/TextField.svelte';
  import type { ApiFailure } from '#lib/shared/api/client';
  import {
    issueApiToken,
    issueManagementToken,
    listApiTokens,
    listManagementTokens,
    loadIssuer,
    revokeApiToken,
    revokeManagementToken
  } from '../data/http-tokens';
  import {
    apiRoles,
    apiScopes,
    chosenScopes,
    expiryAfterDays,
    managementScopes,
    roleLabel,
    sameIntentKey,
    scopeLabel,
    tokenFailureMessage,
    usability,
    type ApiTokenView,
    type IntentKey,
    type ManagementTokenView,
    type SpaceOption,
    type TokenKind
  } from '../domain/token';

  let { kind }: { kind: TokenKind } = $props();

  const session = getSession();

  let name = $state('');
  let days = $state('30');
  let spaceId = $state('');
  let role = $state('reader');
  let selectedScopes = $state<string[]>([]);
  let spaces = $state<SpaceOption[]>([]);
  let apiTokens = $state<ApiTokenView[] | null>(null);
  let managementTokens = $state<ManagementTokenView[] | null>(null);
  let tenantId = $state<string | null>(null);
  let secret = $state<string | null>(null);
  let detailId = $state<string | null>(null);
  let confirmId = $state<string | null>(null);
  let failure = $state<ApiFailure | null>(null);
  let formError = $state<string | null>(null);
  let pending = $state(false);
  let issueIntent = $state<IntentKey | null>(null);
  let revokeIntents = $state<Record<string, IntentKey>>({});

  const pages = {
    api: {
      title: '机器令牌',
      description: 'API 令牌代表机器调用方，权限同时受自身范围与资源授权约束。'
    },
    management: {
      title: '管理令牌',
      description: '你签发给自己的有限期凭据，仍然代表你。'
    }
  };
  const current = $derived(pages[kind]);
  const catalog = $derived(kind === 'api' ? apiScopes : managementScopes);
  const loaded = $derived(kind === 'api' ? apiTokens !== null : managementTokens !== null);
  const rows = $derived(kind === 'api' ? (apiTokens ?? []) : (managementTokens ?? []));
  const detail = $derived(rows.find((item) => item.id === detailId) ?? null);
  let requestId = 0;

  $effect(() => {
    const token = session.accessToken;
    const currentKind = kind;
    if (!token) return;
    let active = true;
    void reload(token, currentKind, () => active);
    return () => {
      active = false;
    };
  });

  async function reload(token: string, currentKind: TokenKind, alive: () => boolean) {
    const id = ++requestId;
    const current = () => alive() && id === requestId;
    if (currentKind === 'management') {
      const listed = await listManagementTokens(token);
      if (!current()) return;
      if (!listed.ok) {
        failure = listed.failure;
        return;
      }
      failure = null;
      managementTokens = listed.body.items;
      return;
    }
    const issuer = await loadIssuer(token);
    if (!current()) return;
    if (!issuer.ok) {
      failure = issuer.failure;
      return;
    }
    tenantId = issuer.body.tenantId;
    spaces = issuer.body.spaces;
    if (!spaceId) spaceId = issuer.body.spaces[0]?.id ?? '';
    const listed = await listApiTokens(token, issuer.body.tenantId);
    if (!current()) return;
    if (!listed.ok) {
      failure = listed.failure;
      return;
    }
    failure = null;
    apiTokens = listed.body.tokens;
  }

  function toggleScope(value: string, checked: boolean) {
    selectedScopes = checked ? [...selectedScopes, value] : selectedScopes.filter((item) => item !== value);
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    formError = null;
    const token = session.accessToken;
    if (!token || pending) return;
    const trimmed = name.trim();
    const span = Number(days.trim());
    if (!trimmed) {
      formError = '填写名称。';
      return;
    }
    if (!Number.isInteger(span) || span < 1 || span > 365) {
      formError = '有效天数需要在 1 到 365 之间。';
      return;
    }
    const scopes = chosenScopes(catalog, selectedScopes);
    if (scopes.length === 0) {
      formError = '至少选择一个范围。';
      return;
    }
    const expiry = expiryAfterDays(span);
    pending = true;
    if (kind === 'api') {
      if (!tenantId || !spaceId) {
        pending = false;
        formError = '先选择空间。';
        return;
      }
      const body = { name: trimmed, spaceId, role, scopes, expiry };
      const intent = sameIntentKey(issueIntent, JSON.stringify(body));
      issueIntent = intent;
      const result = await issueApiToken(token, tenantId, body, intent.key);
      pending = false;
      if (!result.ok) {
        failure = result.failure;
        return;
      }
      secret = result.body.secret;
      issueIntent = null;
      name = '';
      selectedScopes = [];
      await reload(token, 'api', () => true);
      return;
    }
    const body = { name: trimmed, scopes, expiry };
    const intent = sameIntentKey(issueIntent, JSON.stringify(body));
    issueIntent = intent;
    const result = await issueManagementToken(token, body, intent.key);
    pending = false;
    if (!result.ok) {
      failure = result.failure;
      return;
    }
    secret = result.body.secret;
    issueIntent = null;
    name = '';
    selectedScopes = [];
    await reload(token, 'management', () => true);
  }

  async function revoke(id: string) {
    const token = session.accessToken;
    if (!token || pending) return;
    const intent = sameIntentKey(revokeIntents[id] ?? null, `revoke:${id}`);
    revokeIntents = { ...revokeIntents, [id]: intent };
    pending = true;
    const result =
      kind === 'api' && tenantId
        ? await revokeApiToken(token, tenantId, id, intent.key)
        : await revokeManagementToken(token, id, intent.key);
    pending = false;
    if (!result.ok) {
      failure = result.failure;
      return;
    }
    confirmId = null;
    markRevoked(id);
    await reload(token, kind, () => true);
  }

  function markRevoked(id: string) {
    if (kind === 'api' && apiTokens) {
      apiTokens = apiTokens.map((item) => (item.id === id ? { ...item, status: 'revoked' } : item));
    }
    if (kind === 'management' && managementTokens) {
      managementTokens = managementTokens.map((item) => (item.id === id ? { ...item, status: 'revoked', revokedAt: new Date().toISOString() } : item));
    }
  }

  function spaceLabel(id: string) {
    return spaces.find((item) => item.id === id)?.name ?? id;
  }
</script>

<PageHeader title={current.title} description={current.description} />

{#if failure}
  <div role="alert" class="mb-4 flex flex-wrap items-center gap-3 text-sm text-ink">
    <p>{tokenFailureMessage(failure)}</p>
    {#if failure.status === 0 || failure.status >= 500}
      <Button variant="quiet" onclick={() => session.accessToken && void reload(session.accessToken, kind, () => true)}>重试</Button>
    {/if}
  </div>
{/if}

<div class="flex flex-col gap-4">
  <SectionCard title="签发">
    <form class="flex max-w-md flex-col gap-4" onsubmit={submit}>
      <TextField label="名称" name="name" required bind:value={name} disabled={pending} />
      {#if kind === 'api'}
        <SelectField
          label="空间"
          bind:value={spaceId}
          options={spaces.map((item) => ({ value: item.id, label: item.name }))}
          disabled={pending || spaces.length === 0}
        />
        <SelectField label="角色" bind:value={role} options={[...apiRoles]} disabled={pending} />
      {/if}
      <fieldset class="flex flex-col gap-2" disabled={pending}>
        <legend class="text-sm text-ink">范围</legend>
        {#each catalog as scope (scope.value)}
          <CheckField label={scope.label} checked={selectedScopes.includes(scope.value)} onchange={(checked) => toggleScope(scope.value, checked)} />
        {/each}
      </fieldset>
      <TextField label="有效天数" name="days" required bind:value={days} disabled={pending} />
      {#if formError}
        <p role="alert" class="text-sm text-ink">{formError}</p>
      {/if}
      <div>
        <Button type="submit" disabled={pending}>签发</Button>
      </div>
    </form>
  </SectionCard>

  {#if secret}
    <SectionCard title="签发结果">
      <p class="text-sm text-ink">秘密只显示这一次。离开此页后再打开，不再显示。</p>
      <code class="mt-3 block break-all text-sm text-ink">{secret}</code>
    </SectionCard>
  {/if}

  {#if !loaded}
    {#if !failure}
      <p class="text-sm text-muted">正在读取。</p>
    {/if}
  {:else if rows.length === 0}
    <EmptyState title="没有数据" description="签发成功时秘密只显示一次。离开后再打开不再显示。" />
  {:else}
    <ul class="flex flex-col gap-3">
      {#each rows as token (token.id)}
        <li class="rounded-card border border-line bg-surface px-4 py-3">
          <div class="flex flex-wrap items-center gap-3">
            <span class="text-sm font-normal text-ink">{token.name}</span>
            <span class="text-sm text-muted">{usability(token.status)}</span>
            <Button variant="quiet" disabled={pending} onclick={() => (detailId = token.id)}>详情</Button>
            {#if token.status === 'active' && confirmId !== token.id}
              <Button variant="danger-quiet" disabled={pending} onclick={() => (confirmId = token.id)}>吊销</Button>
            {/if}
            {#if confirmId === token.id}
              <Button variant="danger" disabled={pending} onclick={() => void revoke(token.id)}>确认吊销</Button>
              <Button variant="quiet" disabled={pending} onclick={() => (confirmId = null)}>取消</Button>
            {/if}
          </div>
        </li>
      {/each}
    </ul>
  {/if}

  {#if detail}
    <SectionCard title="详情">
      <dl class="flex flex-col gap-2 text-sm text-ink">
        <div class="flex gap-3"><dt class="w-16 text-muted">名称</dt><dd>{detail.name}</dd></div>
        <div class="flex gap-3"><dt class="w-16 text-muted">状态</dt><dd>{usability(detail.status)}</dd></div>
        {#if kind === 'api' && 'role' in detail}
          <div class="flex gap-3"><dt class="w-16 text-muted">角色</dt><dd>{roleLabel(detail.role)}</dd></div>
          <div class="flex gap-3"><dt class="w-16 text-muted">空间</dt><dd>{spaceLabel(detail.spaceId)}</dd></div>
        {/if}
        <div class="flex gap-3">
          <dt class="w-16 text-muted">范围</dt>
          <dd>{detail.scopes.map((item) => scopeLabel(kind, item)).join('、')}</dd>
        </div>
        <div class="flex gap-3"><dt class="w-16 text-muted">到期</dt><dd>{detail.expiry}</dd></div>
      </dl>
    </SectionCard>
  {/if}
</div>

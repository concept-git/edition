<script lang="ts">
  import { onDestroy } from 'svelte';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import Button from '#lib/shared/ui/Button.svelte';
  import CheckField from '#lib/shared/ui/CheckField.svelte';
  import Dialog from '#lib/shared/ui/Dialog.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import TextField from '#lib/shared/ui/TextField.svelte';
  import { currentTenant, listGrants, putPageRestriction, searchPrincipals, viewPagePermission } from '../data/http-permissions';
  import {
    queryFailure,
    restrictionIntent,
    visibleOperations,
    widenMessage,
    writeFailure,
    type Grant,
    type Principal
  } from '../domain/access';

  let { spaceId, pageId }: { spaceId: string; pageId: string } = $props();
  const session = getSession();

  let tenantId = '';
  let grants = $state.raw<Grant[]>([]);
  let savedKeys = $state<string[]>([]);
  let draftKeys = $state<string[]>([]);
  let revision = $state(0);
  let queryText = $state('');
  let outsiders = $state.raw<Principal[]>([]);
  let open = $state(false);
  let pending = $state(false);
  let ready = $state(false);
  let queryMessage = $state('');
  let notice = $state('');
  let alive = true;

  const parentKeys = $derived(grants.map((grant) => grant.principal.key));
  const visibleGrants = $derived(grants.filter((grant) => savedKeys.includes(grant.principal.key)));
  const operations = $derived(visibleOperations(grants, savedKeys));
  const removedNames = $derived(
    grants
      .filter((grant) => savedKeys.includes(grant.principal.key) && !draftKeys.includes(grant.principal.key))
      .map((grant) => grant.principal.name)
  );
  const description = $derived(
    removedNames.length === 0
      ? '收窄后，页面只保留更小的操作集。'
      : `收窄后，${removedNames.join('、')} 不能再访问这个页面。`
  );

  onDestroy(() => {
    alive = false;
  });

  async function load() {
    const token = session.accessToken;
    if (!token) {
      queryMessage = '查询没有完成。';
      return;
    }
    if (!tenantId) {
      const tenant = await currentTenant(token);
      if (!alive) return;
      if (!tenant.ok) {
        queryMessage = queryFailure(tenant.failure);
        return;
      }
      tenantId = tenant.body;
    }
    const [listed, permission] = await Promise.all([
      listGrants(token, tenantId, 'spaces', spaceId),
      viewPagePermission(token, tenantId, spaceId, pageId)
    ]);
    if (!alive) return;
    if (!listed.ok) {
      queryMessage = queryFailure(listed.failure);
      return;
    }
    if (!permission.ok) {
      queryMessage = queryFailure(permission.failure);
      return;
    }
    grants = listed.body;
    revision = permission.body.revision;
    const keys = permission.body.active ? permission.body.principals.map((principal) => principal.key) : listed.body.map((grant) => grant.principal.key);
    savedKeys = keys;
    draftKeys = [...keys];
    ready = true;
    queryMessage = '';
  }

  function toggle(key: string, checked: boolean) {
    if (checked) {
      draftKeys = draftKeys.includes(key) ? draftKeys : [...draftKeys, key];
      return;
    }
    draftKeys = draftKeys.filter((item) => item !== key);
  }

  function requestNarrow() {
    const intent = restrictionIntent(parentKeys, savedKeys, draftKeys);
    if (intent.outcome === 'widen') {
      notice = widenMessage(intent.reason);
      draftKeys = [...savedKeys];
      open = false;
      return;
    }
    if (intent.outcome !== 'narrow') return;
    notice = '';
    open = true;
  }

  function cancel() {
    open = false;
    draftKeys = [...savedKeys];
    notice = '';
  }

  async function confirm() {
    const token = session.accessToken;
    if (!token || !tenantId || pending) return;
    pending = true;
    notice = '';
    const saved = await putPageRestriction(token, tenantId, spaceId, pageId, draftKeys, revision);
    if (!alive) return;
    pending = false;
    if (!saved.ok) {
      notice = writeFailure(saved.failure);
      return;
    }
    open = false;
    revision = saved.body.revision;
    const keys = saved.body.principals.map((principal) => principal.key);
    savedKeys = keys;
    draftKeys = [...keys];
  }

  async function searchOutsiders(event: SubmitEvent) {
    event.preventDefault();
    const token = session.accessToken;
    if (!token || !tenantId || queryText.trim().length < 2) return;
    const result = await searchPrincipals(token, tenantId, 'spaces', spaceId, queryText.trim());
    if (!alive) return;
    if (!result.ok) {
      notice = writeFailure(result.failure);
      return;
    }
    outsiders = result.body;
  }

  function addOutsider(person: Principal) {
    const next = draftKeys.includes(person.key) ? draftKeys : [...draftKeys, person.key];
    const intent = restrictionIntent(parentKeys, savedKeys, next);
    if (intent.outcome === 'widen') {
      notice = widenMessage(intent.reason);
      return;
    }
    draftKeys = next;
    notice = '';
  }

  void load();
</script>

<PageHeader level={2} title="收窄" description="页面只保留空间授权的子集，只减不增。" />

{#if queryMessage}
  <p role="alert" class="mb-4 text-sm text-ink">{queryMessage}</p>
{:else if !ready}
  <p class="mb-4 text-sm text-muted">正在读取</p>
{:else}
  <h3 class="text-sm font-semibold text-ink">当前可见</h3>
  <ul aria-label="当前可见" class="mt-2 mb-4 flex flex-col gap-1 text-sm text-ink">
    {#each visibleGrants as grant (grant.principal.key)}
      <li>{grant.principal.name}</li>
    {/each}
  </ul>
  <h3 class="text-sm font-semibold text-ink">操作</h3>
  <ul aria-label="操作" class="mt-2 mb-4 flex flex-col gap-1 text-sm text-ink">
    {#each operations as operation (operation)}
      <li>{operation}</li>
    {/each}
  </ul>
  <div role="group" aria-label="收窄名单" class="mb-4 flex flex-col gap-2">
    {#each grants as grant (grant.principal.key)}
      <CheckField
        label={grant.principal.name}
        checked={draftKeys.includes(grant.principal.key)}
        onchange={(checked) => toggle(grant.principal.key, checked)}
      />
    {/each}
  </div>
  <Button type="button" onclick={requestNarrow}>收窄</Button>
  {#if notice}
    <p role="alert" class="mt-3 text-sm text-ink">{notice}</p>
  {/if}
  <form aria-label="添加主体" class="mt-8 flex max-w-md flex-col gap-3" onsubmit={searchOutsiders}>
    <TextField label="查找主体" bind:value={queryText} />
    <div>
      <Button type="submit">查找</Button>
    </div>
    {#if outsiders.length > 0}
      <div class="flex flex-wrap gap-2">
        {#each outsiders as person (person.key)}
          <Button type="button" variant="quiet" onclick={() => addOutsider(person)}>{person.name}</Button>
        {/each}
      </div>
    {/if}
  </form>
{/if}

{#if open}
  <Dialog bind:open title="确认收窄" {description}>
    {#snippet actions()}
      <Button variant="quiet" onclick={cancel}>取消</Button>
      <Button variant="danger" disabled={pending} onclick={() => void confirm()}>确认收窄</Button>
    {/snippet}
  </Dialog>
{/if}

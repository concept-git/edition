<script lang="ts">
  import { onDestroy } from 'svelte';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import Button from '#lib/shared/ui/Button.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import TextField from '#lib/shared/ui/TextField.svelte';
  import { currentTenant, listGrants, listPermissionPages, putGrant, searchPrincipals } from '../data/http-permissions';
  import {
    permissionRoles,
    queryFailure,
    writeFailure,
    type Grant,
    type PermissionPage,
    type PermissionRole,
    type Principal,
    type ResourceKind
  } from '../domain/access';

  let { kind, resourceId }: { kind: ResourceKind; resourceId: string } = $props();
  const session = getSession();
  const description = $derived(
    kind === 'sites' ? '在站点上把角色赋予主体。' : '在空间上把角色赋予主体。页面上只能收窄。'
  );

  let tenantId = '';
  let grants = $state.raw<Grant[] | null>(null);
  let pages = $state.raw<PermissionPage[]>([]);
  let query = $state('');
  let people = $state.raw<Principal[]>([]);
  let selected = $state<Principal | null>(null);
  let role = $state<PermissionRole>('reader');
  let pending = $state(false);
  let queryMessage = $state('');
  let notice = $state('');
  let alive = true;

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
    const listed = await listGrants(token, tenantId, kind, resourceId);
    if (!alive) return;
    if (!listed.ok) {
      grants = null;
      queryMessage = queryFailure(listed.failure);
      return;
    }
    grants = listed.body;
    if (kind === 'spaces') {
      const pageList = await listPermissionPages(token, tenantId, resourceId);
      if (!alive) return;
      if (!pageList.ok) {
        queryMessage = queryFailure(pageList.failure);
        return;
      }
      pages = pageList.body;
    }
    queryMessage = '';
  }

  async function ensureTenant(token: string): Promise<boolean> {
    if (tenantId) return true;
    const tenant = await currentTenant(token);
    if (!alive) return false;
    if (!tenant.ok) {
      notice = writeFailure(tenant.failure);
      return false;
    }
    tenantId = tenant.body;
    return true;
  }

  async function search() {
    const token = session.accessToken;
    notice = '';
    if (!token || query.trim().length < 2) return;
    if (!(await ensureTenant(token))) return;
    const result = await searchPrincipals(token, tenantId, kind, resourceId, query.trim());
    if (!alive) return;
    if (!result.ok) {
      notice = writeFailure(result.failure);
      return;
    }
    people = result.body;
  }

  function choose(person: Principal) {
    selected = person;
  }

  function chooseRole(next: PermissionRole) {
    role = next;
  }

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    const token = session.accessToken;
    const person = selected;
    if (!token || !person || pending) return;
    if (!(await ensureTenant(token))) return;
    pending = true;
    notice = '';
    const saved = await putGrant(token, tenantId, kind, resourceId, person.key, role);
    if (!alive) return;
    pending = false;
    if (!saved.ok) {
      notice = writeFailure(saved.failure);
      return;
    }
    const listed = await listGrants(token, tenantId, kind, resourceId);
    if (!alive) return;
    if (!listed.ok) {
      grants = grants?.some((grant) => grant.principal.key === saved.body.principal.key)
        ? grants
        : [...(grants ?? []), saved.body];
      queryMessage = queryFailure(listed.failure);
      return;
    }
    grants = listed.body;
    queryMessage = '';
  }

  void load();
</script>

<PageHeader level={2} title="授权" {description} />

{#if queryMessage}
  <div role="alert" class="mb-4 flex flex-wrap items-center gap-3 text-sm text-ink">
    <p>{queryMessage}</p>
    <Button variant="quiet" onclick={() => void load()}>重试</Button>
  </div>
{:else if grants === null}
  <p class="mb-4 text-sm text-muted">正在读取</p>
{/if}

{#if grants !== null && grants.length === 0}
  <EmptyState title="没有数据" description="授予一个主体后，再次打开仍会看到这次授权。" />
{:else if grants !== null}
  <ul aria-label="授权" class="mb-6 flex flex-col gap-2">
    {#each grants as grant (grant.principal.key)}
      <li class="rounded-nav border border-line bg-surface px-3 py-2 text-sm text-ink">
        <span>{grant.principal.name}</span>
        <span class="ml-3">{grant.role}</span>
        {#each grant.operations as operation (operation)}
          <span class="ml-3">{operation}</span>
        {/each}
      </li>
    {/each}
  </ul>
{/if}

<form aria-label="授予" class="flex max-w-md flex-col gap-3" onsubmit={submit}>
  <TextField label="查找主体" bind:value={query} />
  <div>
    <Button type="button" onclick={() => void search()}>查找</Button>
  </div>
  {#if people.length > 0}
    <div role="group" aria-label="主体" class="flex flex-wrap gap-2">
      {#each people as person (person.key)}
        <Button type="button" variant={selected?.key === person.key ? 'primary' : 'quiet'} onclick={() => choose(person)}>
          {person.name}
        </Button>
      {/each}
    </div>
  {/if}
  <div role="group" aria-label="角色" class="flex flex-wrap gap-2">
    {#each permissionRoles as item (item)}
      <Button type="button" variant={role === item ? 'primary' : 'quiet'} onclick={() => chooseRole(item)}>{item}</Button>
    {/each}
  </div>
  {#if notice}
    <p role="alert" class="text-sm text-ink">{notice}</p>
  {/if}
  <div>
    <Button type="submit" disabled={pending || selected === null}>授予</Button>
  </div>
</form>

{#if kind === 'spaces' && pages.length > 0}
  <h3 class="mt-8 text-sm font-medium text-ink">页面</h3>
  <ul aria-label="页面" class="mt-3 flex flex-col items-start gap-2">
    {#each pages as item (item.id)}
      <li>
        <Button href={`/content/spaces/${resourceId}/pages/${item.id}`}>{item.title}</Button>
      </li>
    {/each}
  </ul>
{/if}

<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { ApiFailure } from '#lib/shared/api/client';
  import Button from '#lib/shared/ui/Button.svelte';
  import CheckField from '#lib/shared/ui/CheckField.svelte';
  import EmptyState from '#lib/shared/ui/EmptyState.svelte';
  import PageHeader from '#lib/shared/ui/PageHeader.svelte';
  import SectionCard from '#lib/shared/ui/SectionCard.svelte';
  import TextField from '#lib/shared/ui/TextField.svelte';
  import { getSession } from '#lib/features/session/presentation/session.svelte';
  import { createWebhook, currentTenant, listDeliveries, listWebhooks, rotateWebhook, updateWebhook } from '../data/http-webhooks';
  import {
    IntentKey,
    acceptableUrl,
    chosenEvents,
    deliveryResult,
    eventLabel,
    forSite,
    queryFailureMessage,
    revealedSecret,
    subscriptionState,
    writeFailureMessage,
    type Delivery,
    type Subscription,
    type WebhookConfiguration
  } from '../domain/webhook';

  let { siteId }: { siteId: string } = $props();
  const session = getSession();
  const createIntent = new IntentKey();
  const updateIntent = new IntentKey();
  const disableIntent = new IntentKey();
  const rotateIntent = new IntentKey();

  let catalog = $state<string[]>([]);
  let subscriptions = $state<Subscription[] | null>(null);
  let url = $state('');
  let selectedEvents = $state<string[]>([]);
  let editingId = $state<string | null>(null);
  let editUrl = $state('');
  let editEvents = $state<string[]>([]);
  let secret = $state<string | null>(null);
  let deliveries = $state<Delivery[] | null>(null);
  let deliveryFor = $state<string | null>(null);
  let pending = $state(false);
  let formError = $state<string | null>(null);
  let queryFailure = $state<ApiFailure | null>(null);
  let writeFailure = $state<ApiFailure | null>(null);
  let deliveryFailure = $state<ApiFailure | null>(null);
  let tenantId = $state<string | null>(null);
  let alive = true;
  let generation = 0;

  const siteSubscriptions = $derived(forSite(subscriptions ?? [], siteId));
  const editing = $derived(siteSubscriptions.find((item) => item.id === editingId) ?? null);

  onDestroy(() => {
    alive = false;
  });

  async function load() {
    const current = ++generation;
    const token = session.accessToken;
    if (!token) {
      queryFailure = { status: 0, code: null, traceId: null, retryAfter: null };
      return;
    }
    const tenant = await currentTenant(token);
    if (!alive || current !== generation) return;
    if (!tenant.ok) {
      queryFailure = tenant.failure;
      return;
    }
    tenantId = tenant.body;
    const listed = await listWebhooks(token, tenant.body);
    if (!alive || current !== generation) return;
    if (!listed.ok) {
      queryFailure = listed.failure;
      return;
    }
    queryFailure = null;
    catalog = listed.body.eventTypes;
    subscriptions = listed.body.items;
  }

  function toggle(selected: string[], type: string, checked: boolean) {
    return checked ? [...selected, type] : selected.filter((item) => item !== type);
  }

  function configuration(address: string, events: string[], active: boolean): WebhookConfiguration | null {
    const trimmed = address.trim();
    if (!acceptableUrl(trimmed)) {
      formError = '地址需要是没有片段的 HTTPS。';
      return null;
    }
    const chosen = chosenEvents(catalog, events);
    if (chosen.length === 0) {
      formError = '至少选择一个事件。';
      return null;
    }
    return { url: trimmed, scopeType: 'site', scopeId: siteId, events: chosen, active };
  }

  async function register(event: SubmitEvent) {
    event.preventDefault();
    formError = null;
    writeFailure = null;
    const token = session.accessToken;
    if (!token || !tenantId || pending) return;
    const body = configuration(url, selectedEvents, true);
    if (!body) return;
    pending = true;
    const key = createIntent.take(JSON.stringify(body));
    const created = await createWebhook(token, tenantId, body, key);
    if (!alive) return;
    pending = false;
    if (!created.ok) {
      writeFailure = created.failure;
      return;
    }
    createIntent.finish();
    const revealed = revealedSecret(created.body);
    if (revealed) secret = revealed;
    url = '';
    selectedEvents = [];
    await load();
  }

  function beginEdit(item: Subscription) {
    editingId = item.id;
    editUrl = item.url;
    editEvents = [...item.events];
    formError = null;
    writeFailure = null;
  }

  async function save(event: SubmitEvent) {
    event.preventDefault();
    const id = editingId;
    if (!id) return;
    await sendUpdate(id, editUrl, editEvents, true);
  }

  async function disable(item: Subscription) {
    await sendUpdate(item.id, item.url, item.events, false);
  }

  async function sendUpdate(id: string, address: string, events: string[], active: boolean) {
    formError = null;
    writeFailure = null;
    const token = session.accessToken;
    if (!token || !tenantId || pending) return;
    const body = configuration(address, events, active);
    if (!body) return;
    const intent = active ? updateIntent : disableIntent;
    pending = true;
    const key = intent.take(JSON.stringify({ id, ...body }));
    const updated = await updateWebhook(token, tenantId, id, body, key);
    if (!alive) return;
    pending = false;
    if (!updated.ok) {
      writeFailure = updated.failure;
      return;
    }
    intent.finish();
    const revealed = revealedSecret(updated.body);
    if (revealed) secret = revealed;
    if (editingId === id) editingId = null;
    await load();
  }

  async function rotate(id: string) {
    const token = session.accessToken;
    if (!token || !tenantId || pending) return;
    writeFailure = null;
    pending = true;
    const key = rotateIntent.take(`rotate:${id}`);
    const rotated = await rotateWebhook(token, tenantId, id, key);
    if (!alive) return;
    pending = false;
    if (!rotated.ok) {
      writeFailure = rotated.failure;
      return;
    }
    rotateIntent.finish();
    const revealed = revealedSecret(rotated.body);
    if (revealed) secret = revealed;
  }

  async function showDeliveries(id: string) {
    const token = session.accessToken;
    if (!token || !tenantId || pending) return;
    deliveryFor = id;
    deliveries = null;
    deliveryFailure = null;
    const listed = await listDeliveries(token, tenantId, id);
    if (!alive || deliveryFor !== id) return;
    if (!listed.ok) {
      deliveryFailure = listed.failure;
      return;
    }
    deliveries = listed.body.items;
  }

  void load();
</script>

<PageHeader level={2} title="Webhook" description="登记投递，并区分成功和失败。" />

{#if queryFailure}
  <div role="alert" class="mb-4 flex flex-wrap items-center gap-3 text-sm text-ink">
    <p>{queryFailureMessage(queryFailure)}</p>
    <Button variant="quiet" onclick={() => void load()}>重试</Button>
  </div>
{:else if subscriptions === null}
  <p class="text-sm text-muted">正在读取</p>
{:else}
  {#if siteSubscriptions.length === 0}
    <EmptyState title="没有数据" description="登记一个 HTTPS 地址后，新订阅会出现在这个站点下。" />
  {:else}
    <ul aria-label="订阅" class="mb-6 flex flex-col gap-3">
      {#each siteSubscriptions as item (item.id)}
        <li class="rounded-card border border-line bg-surface px-4 py-3">
          <div class="flex flex-wrap items-center gap-3 text-sm">
            <span class="font-medium break-all text-ink">{item.url}</span>
            <span class="text-muted">{subscriptionState(item.active)}</span>
            <Button variant="quiet" disabled={pending} onclick={() => beginEdit(item)}>修改</Button>
            {#if item.active}
              <Button variant="quiet" disabled={pending} onclick={() => void disable(item)}>停用</Button>
            {/if}
            <Button variant="quiet" disabled={pending} onclick={() => void showDeliveries(item.id)}>投递</Button>
            <Button variant="quiet" disabled={pending} onclick={() => void rotate(item.id)}>轮换密钥</Button>
          </div>
          {#if editing?.id === item.id}
            <form aria-label="修改" class="mt-3 flex max-w-md flex-col gap-3" onsubmit={save}>
              <TextField label="地址" bind:value={editUrl} disabled={pending} />
              <fieldset class="flex flex-col gap-2" disabled={pending}>
                <legend class="text-sm text-ink">事件</legend>
                {#each catalog as type (type)}
                  <CheckField
                    label={eventLabel(type)}
                    checked={editEvents.includes(type)}
                    onchange={(checked) => (editEvents = toggle(editEvents, type, checked))}
                  />
                {/each}
              </fieldset>
              <div>
                <Button type="submit" disabled={pending}>保存</Button>
              </div>
            </form>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}

  <form aria-label="登记" class="flex max-w-md flex-col gap-3" onsubmit={register}>
    <TextField label="地址" bind:value={url} disabled={pending} />
    <fieldset class="flex flex-col gap-2" disabled={pending || catalog.length === 0}>
      <legend class="text-sm text-ink">事件</legend>
      {#each catalog as type (type)}
        <CheckField
          label={eventLabel(type)}
          checked={selectedEvents.includes(type)}
          onchange={(checked) => (selectedEvents = toggle(selectedEvents, type, checked))}
        />
      {/each}
    </fieldset>
    {#if formError}
      <p role="alert" class="text-sm text-ink">{formError}</p>
    {/if}
    {#if writeFailure}
      <p role="alert" class="text-sm text-ink">{writeFailureMessage(writeFailure)}</p>
    {/if}
    <div>
      <Button type="submit" disabled={pending}>登记</Button>
    </div>
  </form>

  {#if secret}
    <div class="mt-4">
      <SectionCard title="密钥">
        <p class="text-sm text-ink">只显示这一次。离开此页后再打开，不再显示。</p>
        <code class="mt-3 block break-all text-sm text-ink">{secret}</code>
      </SectionCard>
    </div>
  {/if}

  {#if deliveryFor}
    <div class="mt-6">
      {#if deliveryFailure}
        <div role="alert" class="flex flex-wrap items-center gap-3 text-sm text-ink">
          <p>{queryFailureMessage(deliveryFailure)}</p>
          <Button variant="quiet" onclick={() => deliveryFor && void showDeliveries(deliveryFor)}>重试</Button>
        </div>
      {:else if deliveries === null}
        <p class="text-sm text-muted">正在读取</p>
      {:else if deliveries.length === 0}
        <EmptyState title="没有数据" description="还没有投递结果。" />
      {:else}
        <ul aria-label="投递" class="flex flex-col gap-2 text-sm text-ink">
          {#each deliveries as delivery (delivery.id)}
            <li class="flex gap-3">
              <span>{eventLabel(delivery.eventType)}</span>
              <span>{deliveryResult(delivery.status)}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
{/if}

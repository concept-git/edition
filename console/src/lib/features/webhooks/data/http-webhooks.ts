import { api, type ApiFailure, type ApiResult } from '#lib/shared/api/client';
import type { DeliveryPage, Subscription, SubscriptionPage, WebhookConfiguration } from '../domain/webhook';

function broken(status: number): ApiResult<never> {
  const failure: ApiFailure = { status, code: null, traceId: null, retryAfter: null };
  return { ok: false, failure };
}

function tenantQuery(tenantId: string): string {
  return `tenantId=${encodeURIComponent(tenantId)}`;
}

export { currentTenant as currentTenant } from '#lib/shared/api/tenant';


export async function listWebhooks(token: string, tenantId: string): Promise<ApiResult<SubscriptionPage>> {
  const result = await api<unknown>(token, `/webhooks?${tenantQuery(tenantId)}`);
  if (!result.ok) return result;
  const page = readSubscriptionPage(result.body);
  if (!page) return broken(result.status);
  return { ok: true, status: result.status, body: page, etag: result.etag };
}

export function createWebhook(token: string, tenantId: string, body: WebhookConfiguration, idempotencyKey: string) {
  return api<unknown>(token, `/webhooks?${tenantQuery(tenantId)}`, { method: 'POST', body, idempotencyKey });
}

export function updateWebhook(
  token: string,
  tenantId: string,
  id: string,
  body: WebhookConfiguration,
  idempotencyKey: string
) {
  return api<unknown>(token, `/webhooks/${encodeURIComponent(id)}?${tenantQuery(tenantId)}`, {
    method: 'PUT',
    body,
    idempotencyKey
  });
}

export function rotateWebhook(token: string, tenantId: string, id: string, idempotencyKey: string) {
  return api<unknown>(token, `/webhooks/${encodeURIComponent(id)}:rotate?${tenantQuery(tenantId)}`, {
    method: 'POST',
    idempotencyKey
  });
}

export async function listDeliveries(token: string, tenantId: string, id: string): Promise<ApiResult<DeliveryPage>> {
  const result = await api<unknown>(token, `/webhooks/${encodeURIComponent(id)}/deliveries?${tenantQuery(tenantId)}`);
  if (!result.ok) return result;
  const page = readDeliveryPage(result.body);
  if (!page) return broken(result.status);
  return { ok: true, status: result.status, body: page, etag: result.etag };
}

function readSubscriptionPage(body: unknown): SubscriptionPage | null {
  if (!body || typeof body !== 'object') return null;
  const record = body as { items?: unknown; nextCursor?: unknown; eventTypes?: unknown };
  if (!Array.isArray(record.items) || !Array.isArray(record.eventTypes)) return null;
  const items: Subscription[] = [];
  for (const item of record.items) {
    const subscription = readSubscription(item);
    if (!subscription) return null;
    items.push(subscription);
  }
  const eventTypes = record.eventTypes.filter((type): type is string => typeof type === 'string');
  if (eventTypes.length !== record.eventTypes.length) return null;
  return {
    items,
    nextCursor: typeof record.nextCursor === 'string' ? record.nextCursor : null,
    eventTypes
  };
}

function readSubscription(value: unknown): Subscription | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== 'string' || typeof row.url !== 'string' || typeof row.scopeType !== 'string') return null;
  if (typeof row.active !== 'boolean' || typeof row.createdAt !== 'string' || !Array.isArray(row.events)) return null;
  const events = row.events.filter((event): event is string => typeof event === 'string');
  if (events.length !== row.events.length) return null;
  if (row.scopeId !== null && typeof row.scopeId !== 'string') return null;
  return {
    id: row.id,
    url: row.url,
    scopeType: row.scopeType,
    scopeId: typeof row.scopeId === 'string' ? row.scopeId : null,
    events,
    active: row.active,
    createdAt: row.createdAt
  };
}

function readDeliveryPage(body: unknown): DeliveryPage | null {
  if (!body || typeof body !== 'object') return null;
  const record = body as { items?: unknown; nextCursor?: unknown };
  if (!Array.isArray(record.items)) return null;
  const items = [];
  for (const item of record.items) {
    const delivery = readDelivery(item);
    if (!delivery) return null;
    items.push(delivery);
  }
  return { items, nextCursor: typeof record.nextCursor === 'string' ? record.nextCursor : null };
}

function readDelivery(value: unknown) {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== 'string' || typeof row.eventId !== 'string' || typeof row.eventType !== 'string') return null;
  if (typeof row.status !== 'string' || typeof row.attempts !== 'number' || typeof row.createdAt !== 'string') return null;
  const history = Array.isArray(row.history) ? row.history : [];
  return {
    id: row.id,
    eventId: row.eventId,
    eventType: row.eventType,
    status: row.status,
    attempts: row.attempts,
    nextRunAt: typeof row.nextRunAt === 'string' ? row.nextRunAt : null,
    responseCode: typeof row.responseCode === 'number' ? row.responseCode : null,
    createdAt: row.createdAt,
    history: history.flatMap((attempt) => {
      if (!attempt || typeof attempt !== 'object') return [];
      const rowAttempt = attempt as Record<string, unknown>;
      if (typeof rowAttempt.id !== 'string') return [];
      return [
        {
          id: rowAttempt.id,
          startedAt: typeof rowAttempt.startedAt === 'string' ? rowAttempt.startedAt : '',
          responseCode: typeof rowAttempt.responseCode === 'number' ? rowAttempt.responseCode : null,
          error: typeof rowAttempt.error === 'string' ? rowAttempt.error : null,
          durationMs: typeof rowAttempt.durationMs === 'number' ? rowAttempt.durationMs : null
        }
      ];
    })
  };
}

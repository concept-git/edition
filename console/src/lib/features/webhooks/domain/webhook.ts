import type { ApiFailure } from '#lib/shared/api/client';

export type Subscription = {
  id: string;
  url: string;
  scopeType: string;
  scopeId: string | null;
  events: string[];
  active: boolean;
  createdAt: string;
};

export type SubscriptionPage = {
  items: Subscription[];
  nextCursor: string | null;
  eventTypes: string[];
};

export type WebhookConfiguration = {
  url: string;
  scopeType: 'site';
  scopeId: string;
  events: string[];
  active: boolean;
};

export type Attempt = {
  id: string;
  startedAt: string;
  responseCode: number | null;
  error: string | null;
  durationMs: number | null;
};

export type Delivery = {
  id: string;
  eventId: string;
  eventType: string;
  status: string;
  attempts: number;
  nextRunAt: string | null;
  responseCode: number | null;
  createdAt: string;
  history: Attempt[];
};

export type DeliveryPage = {
  items: Delivery[];
  nextCursor: string | null;
};

const eventLabels: Record<string, string> = {
  'release.promoted': '晋升主版本',
  'release.flagged': '发版待确认',
  'release.held': '发版未通过',
  'page.published': '页面进版',
  'domain.verified': '域名已核验',
  'delivery.completed': '交付完成',
  'delivery.failed': '交付失败'
};

/** One key per attempt. A retry of the same payload reuses it; a new payload gets a new key. */
export class IntentKey {
  private key: string | null = null;
  private fingerprint: string | null = null;

  take(fingerprint: string): string {
    if (this.key === null || this.fingerprint !== fingerprint) {
      this.key = crypto.randomUUID();
      this.fingerprint = fingerprint;
    }
    return this.key;
  }

  finish(): void {
    this.key = null;
    this.fingerprint = null;
  }
}

export function eventLabel(type: string): string {
  return eventLabels[type] ?? type;
}

export function chosenEvents(catalog: readonly string[], selected: readonly string[]): string[] {
  return catalog.filter((type) => selected.includes(type));
}

export function forSite(items: readonly Subscription[], siteId: string): Subscription[] {
  return items.filter((item) => item.scopeType === 'site' && item.scopeId === siteId);
}

export function subscriptionState(active: boolean): string {
  return active ? '启用' : '已停用';
}

/** completed is a successful delivery. failed is a failed one. Other states stay distinct. */
export function deliveryResult(status: string): string {
  switch (status) {
    case 'completed':
      return '成功';
    case 'failed':
      return '失败';
    case 'queued':
      return '排队';
    case 'running':
      return '投递中';
    case 'retrying':
      return '重试中';
    default:
      return status;
  }
}

/** The signing secret is shown only when this response actually carries one. */
export function revealedSecret(body: unknown): string | null {
  if (!body || typeof body !== 'object' || !('secret' in body)) return null;
  const secret = (body as { secret?: unknown }).secret;
  return typeof secret === 'string' && secret.length > 0 ? secret : null;
}

export function acceptableUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.username === '' && url.password === '' && url.hash === '' && url.hostname !== '';
  } catch {
    return false;
  }
}

export function writeFailureMessage(failure: ApiFailure): string {
  switch (failure.code) {
    case 'validation_failed':
      return '请修正后再保存。';
    case 'resource_not_found':
      return '找不到这个 Webhook。';
    case 'idempotency_key_reused':
      return '这次保存和上一次不是同一件事。';
    default:
      break;
  }
  if (failure.status === 429) return retryMessage(failure.retryAfter);
  if (failure.status === 0) return '网络失败。已填写的内容仍保留。';
  if (failure.status >= 500) {
    return failure.traceId ? `服务没有完成。追踪号 ${failure.traceId}。` : '服务没有完成。';
  }
  return failure.traceId ? `没有完成。追踪号 ${failure.traceId}。` : '没有完成。';
}

export function queryFailureMessage(failure: Pick<ApiFailure, 'status' | 'traceId' | 'retryAfter'>): string {
  if (failure.status === 429) return retryMessage(failure.retryAfter);
  if (failure.status === 0) return '网络失败。';
  return failure.traceId ? `查询没有完成。追踪号 ${failure.traceId}。` : '查询没有完成。';
}

function retryMessage(retryAfter: number | null): string {
  return retryAfter === null ? '尝试过于频繁，请稍后再试。' : `尝试过于频繁，请在 ${retryAfter} 秒后再试。`;
}

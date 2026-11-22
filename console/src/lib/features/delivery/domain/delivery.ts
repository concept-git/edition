export type DeliveryState =
  | 'disabled'
  | 'queued'
  | 'running'
  | 'retrying'
  | 'failed'
  | 'completed'
  | 'access_pending';

export type Mount = {
  siteId: string;
  slug: string;
};

/** Latest read of one mounted site. Online is never copied from an older targetEpoch. */
export type SiteRollout = {
  siteId: string;
  name: string;
  slug: string;
  status: DeliveryState;
  successful: boolean;
  terminal: boolean;
  targetEpoch: number;
  nextPollAfterSeconds: number;
};

const states: readonly DeliveryState[] = ['disabled', 'queued', 'running', 'retrying', 'failed', 'completed', 'access_pending'];

/** The exact desired target is being served, and no access fence is pending. */
export function isOnline(rollout: SiteRollout): boolean {
  return rollout.successful;
}

/**
 * A newer target replaces the previous observation. Success from the old epoch
 * does not carry forward.
 */
export function adopt(previous: SiteRollout | null, next: SiteRollout): SiteRollout {
  if (previous === null || previous.targetEpoch === next.targetEpoch) return next;
  return { ...next };
}

export function rolloutLabel(rollout: SiteRollout): string {
  if (isOnline(rollout)) return '已上线';
  if (rollout.status === 'failed') return '交付失败。旧的完整版本仍在服务。';
  if (rollout.status === 'disabled') return '交付未启用';
  if (rollout.status === 'access_pending') return '访问尚未放开';
  if (rollout.terminal) return '尚未上线';
  return '正在上线';
}

export function readMounts(value: unknown): Mount[] | null {
  if (!Array.isArray(value)) return null;
  const mounts: Mount[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') return null;
    const record = item as Record<string, unknown>;
    if (typeof record.siteId !== 'string' || typeof record.slug !== 'string') return null;
    mounts.push({ siteId: record.siteId, slug: record.slug });
  }
  return mounts;
}

export function readSiteName(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  const name = (value as { name?: unknown }).name;
  return typeof name === 'string' && name.length > 0 ? name : null;
}

export function readDelivery(value: unknown): Pick<SiteRollout, 'status' | 'successful' | 'terminal' | 'targetEpoch' | 'nextPollAfterSeconds'> | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (!isState(record.status) || typeof record.successful !== 'boolean' || typeof record.terminal !== 'boolean') return null;
  if (typeof record.targetEpoch !== 'number') return null;
  const nextPollAfterSeconds = typeof record.nextPollAfterSeconds === 'number' ? record.nextPollAfterSeconds : 0;
  return {
    status: record.status,
    successful: record.successful,
    terminal: record.terminal,
    targetEpoch: record.targetEpoch,
    nextPollAfterSeconds
  };
}

function isState(value: unknown): value is DeliveryState {
  return typeof value === 'string' && states.includes(value as DeliveryState);
}

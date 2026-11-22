import type { ApiFailure } from '#lib/shared/api/client';

export type HealthStatus = 'ready' | 'no_data' | 'partial' | 'delayed';

export type Health = {
  status: HealthStatus;
  updatedAt: string | null;
  retainedFrom: string | null;
};

export type Bucket = {
  time: string;
  pv: number | null;
};

export type Ranked = {
  label: string;
  count: number;
};

export type PlottedBucket = {
  time: string;
  label: string;
  pv: number | null;
};

export type SiteOption = {
  id: string;
  name: string;
};

/** no_data, partial, and delayed each have their own words. ready has none. */
export function healthLabel(status: HealthStatus): string | null {
  if (status === 'no_data') return '无采集';
  if (status === 'partial') return '部分采集';
  if (status === 'delayed') return '采集延迟';
  return null;
}

export function healthClass(status: HealthStatus): string {
  if (status === 'partial') return 'border-accent text-accent';
  if (status === 'delayed') return 'border-ink text-ink';
  return 'border-line text-muted';
}

export function failureText(failure: Pick<ApiFailure, 'status' | 'traceId' | 'retryAfter'>): string {
  if (failure.status === 429) {
    return failure.retryAfter === null ? '尝试过于频繁，请稍后再试。' : `尝试过于频繁，请在 ${failure.retryAfter} 秒后再试。`;
  }
  if (failure.status === 0) return '网络失败。';
  return failure.traceId ? `查询没有完成。追踪号 ${failure.traceId}。` : '查询没有完成。';
}

/** UTC day label for a returned bucket, matching the API's UTC truncation. */
export function dayLabel(time: string): string {
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) return time;
  return `${date.getUTCMonth() + 1}月${date.getUTCDate()}日`;
}

/**
 * Points the chart may draw.
 * no_data is never a line. A null count stays in the series as a gap.
 * A bucket before retainedFrom, and a bucket after a delayed update, stay out
 * so they are not drawn as zero. Dropping a null would close the line across the hole.
 */
export function plottedBuckets(series: readonly Bucket[], health: Health): PlottedBucket[] {
  if (health.status === 'no_data') return [];
  const retained = millis(health.retainedFrom);
  const updated = millis(health.updatedAt);
  const points: PlottedBucket[] = [];
  for (const bucket of series) {
    const time = Date.parse(bucket.time);
    if (Number.isNaN(time)) continue;
    if (health.status === 'partial' && retained !== null && time < retained) continue;
    if (health.status === 'delayed' && updated !== null && time > updated) continue;
    const pv = typeof bucket.pv === 'number' && Number.isFinite(bucket.pv) ? bucket.pv : null;
    points.push({ time: bucket.time, label: dayLabel(bucket.time), pv });
  }
  return points;
}

function millis(value: string | null): number | null {
  if (value === null) return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : time;
}

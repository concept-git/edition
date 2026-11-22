import { api, type ApiFailure, type ApiResult } from '#lib/shared/api/client';
import {
  plottedBuckets,
  type Bucket,
  type Health,
  type HealthStatus,
  type PlottedBucket,
  type Ranked,
  type SiteOption
} from '../domain/analytics';

export type VisitsReport =
  | { kind: 'empty'; health: Health }
  | { kind: 'visits'; health: Health; points: PlottedBucket[]; pages: Ranked[] };

export type SearchReport = { kind: 'empty'; health: Health } | { kind: 'search'; health: Health; popular: Ranked[] };

function broken(status: number): ApiResult<never> {
  const failure: ApiFailure = { status, code: null, traceId: null, retryAfter: null };
  return { ok: false, failure };
}

function ok<T>(status: number, etag: string | null, body: T): ApiResult<T> {
  return { ok: true, status, body, etag };
}

export async function loadTenant(token: string): Promise<ApiResult<string>> {
  const result = await api<{ tenants?: { id?: unknown }[] }>(token, '/api/v1/me');
  if (!result.ok) return result;
  const id = result.body.tenants?.[0]?.id;
  if (typeof id !== 'string' || id.length === 0) return broken(result.status);
  return ok(result.status, result.etag, id);
}

export async function loadSiteOptions(token: string, tenant: string): Promise<ApiResult<SiteOption[]>> {
  const result = await api<unknown>(token, `/api/v1/tenants/${encodeURIComponent(tenant)}/sites`);
  if (!result.ok) return result;
  const sites = readSites(result.body);
  if (!sites) return broken(result.status);
  return ok(result.status, result.etag, sites);
}

export async function loadTraffic(token: string, tenant: string, siteId: string): Promise<ApiResult<VisitsReport>> {
  const result = await api<unknown>(token, `/stats/sites/${encodeURIComponent(siteId)}/traffic?${query(tenant, { granularity: 'day' })}`);
  if (!result.ok) return result;
  const traffic = readTraffic(result.body);
  if (!traffic) return broken(result.status);
  const points = plottedBuckets(traffic.series, traffic.health);
  if (traffic.health.status === 'no_data' || points.length === 0) {
    return ok(result.status, result.etag, { kind: 'empty', health: traffic.health });
  }
  return ok(result.status, result.etag, { kind: 'visits', health: traffic.health, points, pages: traffic.pages });
}

export async function loadSearch(token: string, tenant: string, siteId: string): Promise<ApiResult<SearchReport>> {
  const result = await api<unknown>(token, `/stats/sites/${encodeURIComponent(siteId)}/search?${query(tenant)}`);
  if (!result.ok) return result;
  const search = readSearch(result.body);
  if (!search) return broken(result.status);
  if (search.health.status === 'no_data' || search.popular.length === 0) {
    return ok(result.status, result.etag, { kind: 'empty', health: search.health });
  }
  return ok(result.status, result.etag, { kind: 'search', health: search.health, popular: search.popular });
}

function query(tenant: string, extra: Record<string, string> = {}): string {
  const end = new Date();
  const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  return new URLSearchParams({ tenantId: tenant, from: start.toISOString(), to: end.toISOString(), ...extra }).toString();
}

function readSites(body: unknown): SiteOption[] | null {
  if (!isRecord(body) || !Array.isArray(body.items)) return null;
  const sites: SiteOption[] = [];
  for (const item of body.items) {
    if (!isRecord(item) || typeof item.id !== 'string' || typeof item.name !== 'string') return null;
    sites.push({ id: item.id, name: item.name });
  }
  return sites;
}

function readTraffic(body: unknown): { series: Bucket[]; pages: Ranked[]; health: Health } | null {
  if (!isRecord(body) || !Array.isArray(body.series) || !Array.isArray(body.pages)) return null;
  const health = readHealth(body.health);
  if (!health) return null;
  const series: Bucket[] = [];
  for (const item of body.series) {
    const bucket = readBucket(item);
    if (!bucket) return null;
    series.push(bucket);
  }
  const pages = readRankedList(body.pages);
  if (!pages) return null;
  return { series, pages, health };
}

function readSearch(body: unknown): { popular: Ranked[]; health: Health } | null {
  if (!isRecord(body) || !Array.isArray(body.popular)) return null;
  const health = readHealth(body.health);
  if (!health) return null;
  const popular = readRankedList(body.popular);
  if (!popular) return null;
  return { popular, health };
}

function readBucket(value: unknown): Bucket | null {
  if (!isRecord(value) || typeof value.time !== 'string') return null;
  if (value.pv !== null && typeof value.pv !== 'number') return null;
  return { time: value.time, pv: value.pv };
}

function readRankedList(value: unknown[]): Ranked[] | null {
  const items: Ranked[] = [];
  for (const item of value) {
    if (!isRecord(item) || typeof item.label !== 'string' || typeof item.count !== 'number') return null;
    items.push({ label: item.label, count: item.count });
  }
  return items;
}

function readHealth(value: unknown): Health | null {
  if (!isRecord(value) || !isHealthStatus(value.status)) return null;
  return {
    status: value.status,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : null,
    retainedFrom: typeof value.retainedFrom === 'string' ? value.retainedFrom : null
  };
}

function isHealthStatus(value: unknown): value is HealthStatus {
  return value === 'ready' || value === 'no_data' || value === 'partial' || value === 'delayed';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

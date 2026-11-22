import { api, type ApiFailure } from '#lib/shared/api/client';
import type { TenantCounts } from '../domain/counts';

export type CountLoad = { ok: true; counts: TenantCounts } | { ok: false; failure: ApiFailure };

type Profile = {
  tenants?: Array<{ id?: unknown; status?: unknown }>;
};

type ListBody = {
  items?: unknown;
  nextCursor?: unknown;
  total?: unknown;
};

const maxPages = 20;

export async function loadTenantCounts(token: string): Promise<CountLoad> {
  const profile = await api<Profile>(token, '/api/v1/me');
  if (!profile.ok) return { ok: false, failure: profile.failure };
  const tenantId = currentTenantId(profile.body);
  if (tenantId === null) return { ok: true, counts: { members: 0, spaces: 0, sites: 0 } };

  const base = `/api/v1/tenants/${tenantId}`;
  const [members, spaces, sites] = await Promise.all([
    countCollection(token, `${base}/members`),
    countCollection(token, `${base}/spaces`),
    countCollection(token, `${base}/sites`)
  ]);
  if (!members.ok) return { ok: false, failure: members.failure };
  if (!spaces.ok) return { ok: false, failure: spaces.failure };
  if (!sites.ok) return { ok: false, failure: sites.failure };
  return { ok: true, counts: { members: members.count, spaces: spaces.count, sites: sites.count } };
}

function currentTenantId(profile: Profile): string | null {
  const tenants = profile.tenants ?? [];
  const active = tenants.find((tenant) => tenant.status === 'active' && typeof tenant.id === 'string' && tenant.id.length > 0);
  if (active && typeof active.id === 'string') return active.id;
  const any = tenants.find((tenant) => typeof tenant.id === 'string' && tenant.id.length > 0);
  return typeof any?.id === 'string' ? any.id : null;
}

async function countCollection(token: string, path: string): Promise<{ ok: true; count: number } | { ok: false; failure: ApiFailure }> {
  let cursor: string | null = null;
  let seen = 0;
  const visited = new Set<string>();
  for (let page = 0; page < maxPages; page += 1) {
    const query = new URLSearchParams({ limit: '100' });
    if (cursor) query.set('cursor', cursor);
    const result = await api<ListBody>(token, `${path}?${query.toString()}`);
    if (!result.ok) return { ok: false, failure: result.failure };
    if (page === 0 && typeof result.body.total === 'number' && Number.isFinite(result.body.total) && result.body.total >= 0) {
      return { ok: true, count: result.body.total };
    }
    seen += Array.isArray(result.body.items) ? result.body.items.length : 0;
    const next = typeof result.body.nextCursor === 'string' && result.body.nextCursor.length > 0 ? result.body.nextCursor : null;
    if (next === null || visited.has(next)) return { ok: true, count: seen };
    visited.add(next);
    cursor = next;
  }
  return { ok: false, failure: { status: 500, code: null, traceId: null, retryAfter: null } };
}

import { api, type ApiResult } from './client';

const tenants = new Map<string, string>();

/** The caller's current tenant, from the signed-in profile. Cached per access token. */
export async function currentTenant(token: string): Promise<ApiResult<string>> {
  const cached = tenants.get(token);
  if (cached) return { ok: true, status: 200, body: cached, etag: null };
  const me = await api<{ tenants?: Array<{ id?: unknown }> }>(token, '/api/v1/me');
  if (!me.ok) return me;
  const tenantId = me.body.tenants?.find((tenant) => typeof tenant.id === 'string' && tenant.id.length > 0)?.id;
  if (typeof tenantId !== 'string') {
    return { ok: false, failure: { status: me.status, code: null, traceId: null, retryAfter: null } };
  }
  tenants.set(token, tenantId);
  return { ok: true, status: me.status, body: tenantId, etag: me.etag };
}

export type ShellIdentity = { name: string; tenant: string };

/** Name and current tenant label for the shell. Does not block the rest of the page. */
export async function readIdentity(token: string | null): Promise<ShellIdentity | null> {
  if (!token) return null;
  const me = await api<{ name?: unknown; tenants?: Array<{ name?: unknown; status?: unknown }> }>(token, '/api/v1/me');
  if (!me.ok) return null;
  const name = typeof me.body.name === 'string' ? me.body.name : '';
  const memberships = me.body.tenants ?? [];
  const named = memberships.filter((item): item is { name: string; status?: unknown } => typeof item.name === 'string' && item.name.length > 0);
  const active = named.find((item) => item.status === 'active') ?? named[0];
  return { name, tenant: active?.name ?? '' };
}

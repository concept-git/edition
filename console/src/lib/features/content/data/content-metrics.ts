import { api } from '#lib/shared/api/client';
import {
  contentHome,
  type ContentHome,
  type MemberRecord,
  type PageRecord,
  type Source,
  type SpaceRecord
} from '../domain/content-metrics';

type AuthContext = { tenantId?: unknown };

/** Reads the current tenant's member list, space page counts, and published pages. */
export async function loadContentMetrics(token: string, now = new Date()): Promise<ContentHome> {
  const context = await api<AuthContext>(token, '/api/v1/auth/context');
  if (!context.ok) return { status: 'error', traceId: context.failure.traceId };
  if (typeof context.body.tenantId !== 'string' || context.body.tenantId.length === 0) return { status: 'empty' };

  const tenantId = encodeURIComponent(context.body.tenantId);
  const [members, spaces] = await Promise.all([
    readList<MemberRecord>(token, `/api/v1/tenants/${tenantId}/members`),
    readList<SpaceRecord>(token, `/api/v1/tenants/${tenantId}/spaces`)
  ]);
  if (members.kind === 'error') return { status: 'error', traceId: members.traceId };
  if (spaces.kind === 'error') return { status: 'error', traceId: spaces.traceId };
  if (members.kind === 'none' && spaces.kind === 'none') return { status: 'empty' };
  if (spaces.kind !== 'list') return contentHome(members, spaces, { kind: 'none' }, now);

  const pages: PageRecord[] = [];
  for (const space of spaces.items) {
    if (typeof space.id !== 'string' || space.id.length === 0) return contentHome(members, spaces, { kind: 'none' }, now);
    const listed = await readList<PageRecord>(token, `/api/v1/tenants/${tenantId}/spaces/${encodeURIComponent(space.id)}/pages`, {
      status: 'published'
    });
    if (listed.kind === 'error') return { status: 'error', traceId: listed.traceId };
    if (listed.kind === 'none') return contentHome(members, spaces, { kind: 'none' }, now);
    pages.push(...listed.items);
  }
  return contentHome(members, spaces, { kind: 'list', items: pages }, now);
}

async function readList<T>(token: string, path: string, query: Record<string, string> = {}): Promise<Source<T>> {
  const items: T[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < 20; page += 1) {
    const params = new URLSearchParams({ limit: '100', ...query });
    if (cursor) params.set('cursor', cursor);
    const result = await api<{ items?: unknown; nextCursor?: unknown }>(token, `${path}?${params}`);
    if (!result.ok) return { kind: 'error', traceId: result.failure.traceId };
    if (!Array.isArray(result.body?.items)) return { kind: 'none' };
    items.push(...(result.body.items as T[]));
    cursor = typeof result.body.nextCursor === 'string' && result.body.nextCursor.length > 0 ? result.body.nextCursor : null;
    if (!cursor) return { kind: 'list', items };
  }
  return { kind: 'error', traceId: null };
}

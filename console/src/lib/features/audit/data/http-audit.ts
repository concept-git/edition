import { api, type ApiFailure } from '#lib/shared/api/client';
import { type AuditFailure, type AuditRecord } from '../domain/audit';

type Me = {
  tenants?: Array<{ id?: string }>;
};

export async function queryAudit(
  token: string,
  action: string
): Promise<{ ok: true; records: AuditRecord[] } | { ok: false; failure: AuditFailure }> {
  const params = new URLSearchParams();
  const tenantId = await currentTenant(token);
  if (tenantId) params.set('tenantId', tenantId);
  const trimmed = action.trim();
  if (trimmed) params.set('action', trimmed);
  params.set('limit', '20');
  const result = await api<unknown>(token, `/audit?${params.toString()}`);
  if (!result.ok) return { ok: false, failure: toFailure(result.failure) };
  return { ok: true, records: readRecords(result.body) };
}

async function currentTenant(token: string) {
  const me = await api<Me>(token, '/api/v1/me');
  if (!me.ok) return null;
  const id = me.body.tenants?.find((tenant) => typeof tenant.id === 'string')?.id;
  return id ?? null;
}

function toFailure(failure: ApiFailure): AuditFailure {
  if (failure.status === 0) return { kind: 'network' };
  if (failure.status === 403) return { kind: 'forbidden' };
  if (failure.status === 429) return { kind: 'rate_limited', retryAfter: failure.retryAfter };
  return { kind: 'unavailable', traceId: failure.traceId };
}

function readRecords(body: unknown): AuditRecord[] {
  if (!body || typeof body !== 'object') return [];
  const items = (body as { items?: unknown }).items;
  if (!Array.isArray(items)) return [];
  return items.flatMap(readRecord);
}

function readRecord(value: unknown): AuditRecord[] {
  if (!value || typeof value !== 'object') return [];
  const row = value as Record<string, unknown>;
  if (typeof row.action !== 'string' || typeof row.actorName !== 'string') return [];
  return [
    {
      id: typeof row.id === 'number' || typeof row.id === 'string' ? String(row.id) : row.action,
      time: typeof row.time === 'string' ? row.time : '',
      actorName: row.actorName,
      action: row.action,
      outcome: typeof row.outcome === 'string' ? row.outcome : '',
      targetType: typeof row.targetType === 'string' ? row.targetType : null
    }
  ];
}

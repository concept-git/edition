export type SpaceMode = 'authored' | 'synced';

export type SpaceSummary = {
  id: string;
  name: string;
  mode: SpaceMode;
};

export type SpaceDetail = SpaceSummary & {
  tenantId: string;
  autoRelease: boolean | null;
};

export type SpaceList = {
  items: SpaceSummary[];
  canCreate: boolean;
};

export type WriteIntent = {
  key: string;
  fingerprint: string;
};

/** One key per write intent. A retry of the same payload reuses it; a new payload gets a new key. */
export function sameIntent(current: WriteIntent | null, fingerprint: string): WriteIntent {
  if (current !== null && current.fingerprint === fingerprint) return current;
  return { key: crypto.randomUUID(), fingerprint };
}

export function isSpaceMode(value: unknown): value is SpaceMode {
  return value === 'authored' || value === 'synced';
}

export function readSummary(value: unknown): SpaceSummary | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== 'string' || typeof record.name !== 'string' || !isSpaceMode(record.mode)) return null;
  return { id: record.id, name: record.name, mode: record.mode };
}

export function readDetail(value: unknown): SpaceDetail | null {
  const summary = readSummary(value);
  if (!summary || !value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (typeof record.tenantId !== 'string') return null;
  if (record.autoRelease !== null && typeof record.autoRelease !== 'boolean') return null;
  return { ...summary, tenantId: record.tenantId, autoRelease: record.autoRelease };
}

export function mergeSpace(items: SpaceSummary[], created: SpaceSummary): SpaceSummary[] {
  return [...items.filter((item) => item.id !== created.id), created];
}

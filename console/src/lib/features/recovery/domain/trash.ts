export type TrashedPage = {
  id: string;
  title: string;
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

export function readTrashedPage(value: unknown): TrashedPage | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== 'string' || typeof record.title !== 'string') return null;
  return { id: record.id, title: record.title };
}

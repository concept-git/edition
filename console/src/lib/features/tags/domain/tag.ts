export type TagPageItem = {
  id: string;
  title: string;
  tags: string[];
};

export type TaggedHit = {
  id: string;
  title: string;
  spaceId: string | null;
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

export function withTag(pages: readonly TagPageItem[], updated: TagPageItem): TagPageItem[] {
  if (!pages.some((page) => page.id === updated.id)) return [...pages, updated];
  return pages.map((page) => (page.id === updated.id ? updated : page));
}

export function readPage(value: unknown): TagPageItem | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== 'string' || typeof record.title !== 'string' || !Array.isArray(record.tags)) return null;
  if (!record.tags.every((tag) => typeof tag === 'string')) return null;
  return { id: record.id, title: record.title, tags: record.tags.filter((tag): tag is string => typeof tag === 'string') };
}

export function readPageList(value: unknown): TagPageItem[] | null {
  if (!value || typeof value !== 'object') return null;
  const items = (value as { items?: unknown }).items;
  if (!Array.isArray(items)) return null;
  const pages: TagPageItem[] = [];
  for (const item of items) {
    const page = readPage(item);
    if (!page) return null;
    pages.push(page);
  }
  return pages;
}

export function readTaggedList(value: unknown): TaggedHit[] | null {
  if (!value || typeof value !== 'object') return null;
  const items = (value as { items?: unknown }).items;
  if (!Array.isArray(items)) return null;
  const hits: TaggedHit[] = [];
  for (const item of items) {
    const page = readPage(item);
    if (!page || !item || typeof item !== 'object') return null;
    const spaceId = (item as { spaceId?: unknown }).spaceId;
    if (spaceId !== null && spaceId !== undefined && typeof spaceId !== 'string') return null;
    hits.push({ id: page.id, title: page.title, spaceId: typeof spaceId === 'string' ? spaceId : null });
  }
  return hits;
}

export const KINDS = ['target', 'group', 'link'] as const;

export type TocKind = (typeof KINDS)[number];

export type TocEntry = {
  id: string;
  parentId: string | null;
  position: number;
  label: string;
  kind: TocKind;
  targetId: string | null;
  url: string | null;
  depth: number;
  children: TocEntry[];
};

export type TocNode = TocEntry & { isDndShadowItem?: boolean };

export type TocTree = {
  entries: TocEntry[];
  canEdit: boolean;
};

export type PageOption = {
  id: string;
  title: string;
};

export type WriteIntent = {
  key: string;
  fingerprint: string;
};

const kindLabels: Record<TocKind, string> = {
  target: '目标',
  group: '分组',
  link: '外链'
};

/** One key per write intent. A retry of the same payload reuses it; a new payload gets a new key. */
export function sameIntent(current: WriteIntent | null, fingerprint: string): WriteIntent {
  if (current !== null && current.fingerprint === fingerprint) return current;
  return { key: crypto.randomUUID(), fingerprint };
}

export function kindLabel(kind: TocKind): string {
  return kindLabels[kind];
}

export function isKind(value: unknown): value is TocKind {
  return KINDS.some((kind) => kind === value);
}

export function readTree(value: unknown): TocTree | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (!Array.isArray(record.entries)) return null;
  const entries: TocEntry[] = [];
  for (const item of record.entries) {
    const entry = readEntry(item, null);
    if (!entry) return null;
    entries.push(entry);
  }
  const allowed = Array.isArray(record.allowedActions)
    ? record.allowedActions.filter((action): action is string => typeof action === 'string')
    : [];
  return { entries, canEdit: allowed.includes('edit') };
}

export function readPages(value: unknown): PageOption[] | null {
  if (!value || typeof value !== 'object') return null;
  const items = (value as { items?: unknown }).items;
  if (!Array.isArray(items)) return null;
  const pages: PageOption[] = [];
  for (const item of items) {
    if (!item || typeof item !== 'object') return null;
    const record = item as Record<string, unknown>;
    if (typeof record.id !== 'string' || typeof record.title !== 'string') return null;
    pages.push({ id: record.id, title: record.title });
  }
  return pages;
}

export function findEntry(entries: readonly TocNode[], id: string): TocEntry | null {
  for (const entry of entries) {
    if (entry.isDndShadowItem) continue;
    if (entry.id === id) return entry;
    const nested = findEntry(entry.children ?? [], id);
    if (nested) return nested;
  }
  return null;
}

export function flatten(entries: readonly TocNode[]): TocEntry[] {
  const collected: TocEntry[] = [];
  for (const entry of entries) {
    if (entry.isDndShadowItem) continue;
    collected.push(entry);
    collected.push(...flatten(entry.children ?? []));
  }
  return collected;
}

export function copyTree(entries: readonly TocNode[]): TocEntry[] {
  return entries.filter((entry) => !entry.isDndShadowItem).map((entry) => ({
    id: entry.id,
    parentId: entry.parentId ?? null,
    position: entry.position,
    label: entry.label,
    kind: entry.kind,
    targetId: entry.targetId ?? null,
    url: entry.url ?? null,
    depth: entry.depth,
    children: copyTree(entry.children ?? [])
  }));
}

export function replaceChildren(entries: TocNode[], parentId: string | null, children: TocNode[]): TocNode[] {
  if (parentId === null) return children;
  return entries.map((entry) => {
    if (entry.isDndShadowItem) return entry;
    if (entry.id === parentId) return { ...entry, children };
    return { ...entry, children: replaceChildren(entry.children ?? [], parentId, children) };
  });
}

function readEntry(value: unknown, parentId: string | null): TocEntry | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== 'string' || typeof record.label !== 'string' || !isKind(record.kind)) return null;
  if (typeof record.position !== 'number' || typeof record.depth !== 'number') return null;
  const children: TocEntry[] = [];
  const rawChildren = Array.isArray(record.children) ? record.children : [];
  for (const child of rawChildren) {
    const entry = readEntry(child, record.id);
    if (!entry) return null;
    children.push(entry);
  }
  return {
    id: record.id,
    parentId: typeof record.parentId === 'string' ? record.parentId : parentId,
    position: record.position,
    label: record.label,
    kind: record.kind,
    targetId: typeof record.targetId === 'string' ? record.targetId : null,
    url: typeof record.url === 'string' ? record.url : null,
    depth: record.depth,
    children
  };
}

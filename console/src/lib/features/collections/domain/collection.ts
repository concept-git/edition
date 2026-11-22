export type CollectionNode = {
  id: string;
  name: string;
  depth: number;
  children: CollectionNode[];
};

export type CollectionTree = {
  collections: CollectionNode[];
  canCreate: boolean;
  canPlace: boolean;
};

export type PlaceableSpace = {
  id: string;
  name: string;
  collectionId: string | null;
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

export function parentChoices(
  nodes: readonly CollectionNode[],
  prefix: readonly string[] = []
): Array<{ value: string; label: string }> {
  const choices: Array<{ value: string; label: string }> = [];
  for (const node of nodes) {
    const path = [...prefix, node.name];
    choices.push({ value: node.id, label: path.join(' / ') });
    choices.push(...parentChoices(node.children, path));
  }
  return choices;
}

export function spacesIn(spaces: readonly PlaceableSpace[], collectionId: string): PlaceableSpace[] {
  return spaces.filter((space) => space.collectionId === collectionId);
}

export function withPlacement(spaces: readonly PlaceableSpace[], placed: PlaceableSpace): PlaceableSpace[] {
  if (!spaces.some((space) => space.id === placed.id)) return [...spaces, placed];
  return spaces.map((space) => (space.id === placed.id ? placed : space));
}

export function readTree(value: unknown): CollectionTree | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (!Array.isArray(record.collections)) return null;
  const collections: CollectionNode[] = [];
  for (const item of record.collections) {
    const node = readNode(item);
    if (!node) return null;
    collections.push(node);
  }
  const allowed = Array.isArray(record.allowedActions)
    ? record.allowedActions.filter((action): action is string => typeof action === 'string')
    : [];
  return {
    collections,
    canCreate: allowed.includes('create'),
    canPlace: allowed.includes('place')
  };
}

export function readSpaceList(value: unknown): PlaceableSpace[] | null {
  if (!value || typeof value !== 'object') return null;
  const items = (value as { items?: unknown }).items;
  if (!Array.isArray(items)) return null;
  const spaces: PlaceableSpace[] = [];
  for (const item of items) {
    const space = readSpace(item);
    if (!space) return null;
    spaces.push(space);
  }
  return spaces;
}

export function readSpace(value: unknown): PlaceableSpace | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== 'string' || typeof record.name !== 'string') return null;
  if (record.collectionId !== null && record.collectionId !== undefined && typeof record.collectionId !== 'string') return null;
  return {
    id: record.id,
    name: record.name,
    collectionId: typeof record.collectionId === 'string' ? record.collectionId : null
  };
}

function readNode(value: unknown): CollectionNode | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== 'string' || typeof record.name !== 'string' || !Array.isArray(record.children)) return null;
  const depth = typeof record.depth === 'number' ? record.depth : 1;
  const children: CollectionNode[] = [];
  for (const child of record.children) {
    const node = readNode(child);
    if (!node) return null;
    children.push(node);
  }
  return { id: record.id, name: record.name, depth, children };
}

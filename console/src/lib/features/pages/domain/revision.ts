export type RevisionEntry = {
  n: number;
  createdAt: string;
};

export type RevisionDetail = RevisionEntry & {
  content: string;
};

export type DiffLine = {
  type: 'add' | 'delete' | 'context';
  content: string;
};

export function readRevisionList(value: unknown): RevisionEntry[] | null {
  if (!value || typeof value !== 'object') return null;
  const items = (value as { items?: unknown }).items;
  if (!Array.isArray(items)) return null;
  const entries: RevisionEntry[] = [];
  for (const item of items) {
    const entry = readEntry(item);
    if (!entry) return null;
    entries.push(entry);
  }
  return entries;
}

export function readRevisionDetail(value: unknown): RevisionDetail | null {
  const entry = readEntry(value);
  if (!entry || !value || typeof value !== 'object') return null;
  const content = (value as { content?: unknown }).content;
  if (typeof content !== 'string') return null;
  return { ...entry, content };
}

export function readRevisionDiff(value: unknown): DiffLine[] | null {
  if (!value || typeof value !== 'object') return null;
  const hunks = (value as { hunks?: unknown }).hunks;
  if (!Array.isArray(hunks)) return null;
  const lines: DiffLine[] = [];
  for (const hunk of hunks) {
    if (!hunk || typeof hunk !== 'object') return null;
    const hunkLines = (hunk as { lines?: unknown }).lines;
    if (!Array.isArray(hunkLines)) return null;
    for (const line of hunkLines) {
      if (!line || typeof line !== 'object') return null;
      const type = (line as { type?: unknown }).type;
      const content = (line as { content?: unknown }).content;
      if (type !== 'add' && type !== 'delete' && type !== 'context') return null;
      if (typeof content !== 'string') return null;
      lines.push({ type, content });
    }
  }
  return lines;
}

function readEntry(value: unknown): RevisionEntry | null {
  if (!value || typeof value !== 'object') return null;
  const n = (value as { n?: unknown }).n;
  const createdAt = (value as { createdAt?: unknown }).createdAt;
  if (typeof n !== 'number' || !Number.isInteger(n) || n < 1) return null;
  if (typeof createdAt !== 'string' || Number.isNaN(Date.parse(createdAt))) return null;
  return { n, createdAt };
}

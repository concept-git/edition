export const FORMATS = ['markdown', 'html', 'txt', 'json', 'xml'] as const;

export type PageFormat = (typeof FORMATS)[number];

/** Control rejects page bodies larger than 2 MiB. */
export const CONTENT_LIMIT_BYTES = 2 * 1024 * 1024;

export type PageReadiness = 'draft' | 'published';

export type PageSummary = {
  id: string;
  title: string;
  slug: string;
  format: PageFormat;
  status: PageReadiness;
};

export type PageSource = {
  id: string;
  format: PageFormat;
  content: string;
  revision: number;
  etag: string;
};

export type SavedPage = PageSource & {
  drift: boolean;
};

export type PageList = {
  items: PageSummary[];
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

export function isPageFormat(value: unknown): value is PageFormat {
  return FORMATS.some((format) => format === value);
}

export function pageAddress(title: string, format: PageFormat): string {
  const trimmed = title.trim();
  if (/^[A-Za-z0-9][A-Za-z0-9._-]{0,200}$/.test(trimmed) && !trimmed.split('/').includes('..')) return trimmed;
  return `${format}-${crypto.randomUUID()}`;
}

export function exceedsContentLimit(content: string): boolean {
  return new TextEncoder().encode(content).length > CONTENT_LIMIT_BYTES;
}

export function contentEtag(revision: number, header: string | null): string {
  if (header && /^"rev-\d+"$/.test(header)) return header;
  return `"rev-${revision}"`;
}

export function readinessOf(value: unknown): PageReadiness {
  return value === 'published' ? 'published' : 'draft';
}

/** Publish and unpublish responses carry the page. A missing status is not a successful mark. */
export function readReadiness(value: unknown): PageReadiness | null {
  if (!value || typeof value !== 'object') return null;
  const status = (value as { status?: unknown }).status;
  if (status !== 'published' && status !== 'draft') return null;
  return status;
}

export function readSummary(value: unknown): PageSummary | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== 'string' || typeof record.title !== 'string' || typeof record.slug !== 'string') return null;
  if (!isPageFormat(record.format)) return null;
  return { id: record.id, title: record.title, slug: record.slug, format: record.format, status: readinessOf(record.status) };
}

export function applyReadiness(items: PageSummary[], id: string, status: PageReadiness): PageSummary[] {
  return items.map((item) => (item.id === id ? { ...item, status } : item));
}

export function readSource(value: unknown, etag: string | null): PageSource | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== 'string' || !isPageFormat(record.format)) return null;
  if (typeof record.content !== 'string' || typeof record.revision !== 'number' || !Number.isInteger(record.revision)) return null;
  return {
    id: record.id,
    format: record.format,
    content: record.content,
    revision: record.revision,
    etag: contentEtag(record.revision, etag)
  };
}

export function mergePage(items: PageSummary[], created: PageSummary): PageSummary[] {
  return [...items.filter((item) => item.id !== created.id), created];
}

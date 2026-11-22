export type SpacePage = {
  id: string;
  title: string;
};

export function readPages(value: unknown): SpacePage[] | null {
  if (!value || typeof value !== 'object') return null;
  const items = (value as { items?: unknown }).items;
  if (!Array.isArray(items)) return null;
  const pages: SpacePage[] = [];
  for (const item of items) {
    if (!item || typeof item !== 'object') return null;
    const record = item as Record<string, unknown>;
    if (typeof record.id !== 'string' || typeof record.title !== 'string') return null;
    pages.push({ id: record.id, title: record.title });
  }
  return pages;
}

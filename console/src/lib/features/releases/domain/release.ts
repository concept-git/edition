export type ReleaseOutcome = 'promoted' | 'unchanged' | 'skipped' | 'held';

export type ReleaseSummary = {
  id: string;
  label: string;
  status: string;
  allowedActions: string[];
};

export type PreviewPage = {
  pageId: string;
  slug: string;
  title: string;
};

export type PreviewDocument = {
  title: string;
  slug: string;
  content: string;
};

const previewable = new Set(['draft', 'flagged', 'validated', 'archived']);

export type ConfirmedBuild = {
  outcome: ReleaseOutcome;
  summary: string;
  report: string[];
};

export type WriteIntent = {
  key: string;
  fingerprint: string;
};

const outcomes: readonly ReleaseOutcome[] = ['promoted', 'unchanged', 'skipped', 'held'];

/** One key per build intent. A retry of that build reuses it; the next build gets a new key. */
export function sameIntent(current: WriteIntent | null, fingerprint: string): WriteIntent {
  if (current !== null && current.fingerprint === fingerprint) return current;
  return { key: crypto.randomUUID(), fingerprint };
}

export function outcomeSummary(outcome: ReleaseOutcome): string {
  switch (outcome) {
    case 'promoted':
      return '已更新主版本，站点仍需完成上线。';
    case 'unchanged':
      return '内容与主版本一致。';
    case 'skipped':
      return '未生成新发版。已进版内容为空，或与主版本一致。';
    case 'held':
      return '主版本保留。';
  }
}

export function statusLabel(status: string): string {
  switch (status) {
    case 'live':
      return '主版本';
    case 'draft':
      return '草稿';
    case 'archived':
      return '发版归档';
    case 'flagged':
      return '待确认';
    case 'validated':
      return '已校验';
    default:
      return status;
  }
}

/** Preview is only for a release that is not the live one. */
export function canPreview(release: ReleaseSummary): boolean {
  return previewable.has(release.status);
}

/** Archived releases roll back; a validated release is switched to live. */
export function liveControl(release: ReleaseSummary): 'promote' | 'rollback' | null {
  if (release.status === 'archived' && release.allowedActions.includes('rollback')) return 'rollback';
  if (release.status !== 'archived' && release.allowedActions.includes('promote')) return 'promote';
  if (release.allowedActions.includes('rollback')) return 'rollback';
  return null;
}

export function withRollback(actions: string[]): string[] {
  const next = actions.filter((action) => action !== 'promote');
  return next.includes('rollback') ? next : [...next, 'rollback'];
}

export function readBuild(value: unknown): ConfirmedBuild | null {
  if (!value || typeof value !== 'object') return null;
  const outcome = (value as { outcome?: unknown }).outcome;
  if (!isOutcome(outcome)) return null;
  return {
    outcome,
    summary: outcomeSummary(outcome),
    report: outcome === 'held' ? readReport((value as { release?: unknown }).release) : []
  };
}

export function readList(value: unknown): ReleaseSummary[] | null {
  if (!value || typeof value !== 'object') return null;
  const items = (value as { items?: unknown }).items;
  if (!Array.isArray(items)) return null;
  const summaries: ReleaseSummary[] = [];
  for (const item of items) {
    const summary = readSummary(item);
    if (!summary) return null;
    summaries.push(summary);
  }
  return summaries;
}

export function readSummary(value: unknown): ReleaseSummary | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== 'string' || typeof record.label !== 'string' || typeof record.status !== 'string') return null;
  return { id: record.id, label: record.label, status: record.status, allowedActions: readActions(record.allowedActions) };
}

export function readPreviewPages(value: unknown): PreviewPage[] | null {
  if (!value || typeof value !== 'object') return null;
  const items = (value as { items?: unknown }).items;
  if (!Array.isArray(items)) return null;
  const pages: PreviewPage[] = [];
  for (const item of items) {
    if (!item || typeof item !== 'object') return null;
    const record = item as Record<string, unknown>;
    if (typeof record.pageId !== 'string' || typeof record.slug !== 'string' || typeof record.title !== 'string') return null;
    pages.push({ pageId: record.pageId, slug: record.slug, title: record.title });
  }
  return pages;
}

export function readPreviewDocument(value: unknown): PreviewDocument | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (typeof record.title !== 'string' || typeof record.slug !== 'string' || typeof record.content !== 'string') return null;
  return { title: record.title, slug: record.slug, content: record.content };
}

function readReport(release: unknown): string[] {
  if (!release || typeof release !== 'object') return [];
  const report = (release as { report?: unknown }).report;
  if (!report || typeof report !== 'object') return [];
  const record = report as { errors?: unknown; warnings?: unknown; info?: unknown };
  return [...issueLines(record.errors), ...issueLines(record.warnings), ...issueLines(record.info)];
}

function issueLines(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((issue) => {
    if (!issue || typeof issue !== 'object') return [];
    const record = issue as Record<string, unknown>;
    const detail = typeof record.detail === 'string' ? record.detail : '';
    const code = typeof record.code === 'string' ? record.code : '';
    const text = detail || code;
    return text ? [text] : [];
  });
}

function readActions(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function isOutcome(value: unknown): value is ReleaseOutcome {
  return typeof value === 'string' && outcomes.includes(value as ReleaseOutcome);
}

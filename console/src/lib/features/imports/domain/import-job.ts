export type ImportStatus = 'queued' | 'running' | 'retrying' | 'held' | 'failed' | 'completed';

export type ImportIssue = {
  code: string;
  path: string | null;
  detail: string | null;
};

export type ImportJob = {
  id: string;
  status: ImportStatus;
  progress: { done: number | null; total: number | null };
  outcome: string | null;
  report: { errors: ImportIssue[]; info: ImportIssue[] };
  terminal: boolean;
  successful: boolean;
  nextPollAfterSeconds: number | null;
};

export type ImportedPage = {
  id: string;
  title: string;
};

const statuses: readonly ImportStatus[] = ['queued', 'running', 'retrying', 'held', 'failed', 'completed'];

/** One key per write intent. A retry of the same payload reuses it; a new payload gets a new key. */
export class IntentKey {
  private key: string | null = null;
  private fingerprint: string | null = null;

  take(fingerprint: string): string {
    if (this.key === null || this.fingerprint !== fingerprint) {
      this.key = crypto.randomUUID();
      this.fingerprint = fingerprint;
    }
    return this.key;
  }

  finish(): void {
    this.key = null;
    this.fingerprint = null;
  }
}

export function statusLabel(status: ImportStatus): string {
  switch (status) {
    case 'queued':
      return '已受理';
    case 'running':
      return '进行中';
    case 'retrying':
      return '重试中';
    case 'held':
      return '待处理';
    case 'failed':
      return '失败';
    case 'completed':
      return '已完成';
  }
}

/** A failed import can be run again unless the bundle itself is gone. */
export function canRunAgain(job: ImportJob): boolean {
  return job.status === 'failed' && job.outcome !== 'resource_deleted';
}

export function reportLines(job: ImportJob): string[] {
  return [...job.report.errors, ...job.report.info].flatMap((issue) => {
    const text = issue.detail ?? issue.code;
    return text ? [text] : [];
  });
}

export function readJob(value: unknown): ImportJob | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== 'string' || !isStatus(record.status)) return null;
  if (typeof record.terminal !== 'boolean' || typeof record.successful !== 'boolean') return null;
  if (record.nextPollAfterSeconds !== null && typeof record.nextPollAfterSeconds !== 'number') return null;
  const progress = readProgress(record.progress);
  const report = readReport(record.report);
  if (!progress || !report) return null;
  const outcome = record.outcome;
  if (outcome !== null && typeof outcome !== 'string') return null;
  return {
    id: record.id,
    status: record.status,
    progress,
    outcome,
    report,
    terminal: record.terminal,
    successful: record.successful,
    nextPollAfterSeconds: record.nextPollAfterSeconds
  };
}

export function readAccepted(value: unknown): ImportJob | null {
  if (!value || typeof value !== 'object') return null;
  return readJob((value as { job?: unknown }).job);
}

export function readPages(value: unknown): ImportedPage[] | null {
  if (!value || typeof value !== 'object') return null;
  const items = (value as { items?: unknown }).items;
  if (!Array.isArray(items)) return null;
  const pages: ImportedPage[] = [];
  for (const item of items) {
    if (!item || typeof item !== 'object') return null;
    const record = item as Record<string, unknown>;
    if (typeof record.id !== 'string' || typeof record.title !== 'string') return null;
    pages.push({ id: record.id, title: record.title });
  }
  return pages;
}

function isStatus(value: unknown): value is ImportStatus {
  return typeof value === 'string' && statuses.includes(value as ImportStatus);
}

function readProgress(value: unknown): ImportJob['progress'] | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (record.done !== null && typeof record.done !== 'number') return null;
  if (record.total !== null && typeof record.total !== 'number') return null;
  return { done: record.done as number | null, total: record.total as number | null };
}

function readReport(value: unknown): ImportJob['report'] | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const errors = readIssues(record.errors);
  const info = readIssues(record.info);
  if (!errors || !info) return null;
  return { errors, info };
}

function readIssues(value: unknown): ImportIssue[] | null {
  if (!Array.isArray(value)) return null;
  const issues: ImportIssue[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') return null;
    const record = item as Record<string, unknown>;
    if (typeof record.code !== 'string') return null;
    if (record.path !== null && typeof record.path !== 'string') return null;
    if (record.detail !== null && typeof record.detail !== 'string') return null;
    issues.push({
      code: record.code,
      path: record.path as string | null,
      detail: record.detail as string | null
    });
  }
  return issues;
}

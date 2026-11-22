export type SiteSummary = { id: string; name: string };

export type SiteMount = { spaceId: string; slug: string };

export type SiteView = {
  id: string;
  name: string;
  mounts: SiteMount[];
  canMount: boolean;
};

export type SiteList = {
  items: SiteSummary[];
  canCreate: boolean;
};

export type SpaceChoice = { id: string; name: string };

export type SearchField = 'title' | 'headings' | 'body';

export const searchFieldLabel: Record<SearchField, string> = {
  title: '标题',
  headings: '标题层级',
  body: '正文'
};

type FailureLike = {
  status: number;
  code: string | null;
  traceId: string | null;
  retryAfter: number | null;
};

/** One key per attempt. A retry of the same payload reuses it; a new payload gets a new key. */
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

export function moveField(fields: readonly SearchField[], index: number, direction: -1 | 1): SearchField[] {
  const target = index + direction;
  const current = fields[index];
  if (current === undefined || target < 0 || target >= fields.length) return [...fields];
  const next = [...fields];
  next.splice(index, 1);
  next.splice(target, 0, current);
  return next;
}

export function writeFailureMessage(failure: FailureLike): string {
  switch (failure.code) {
    case 'slug_taken':
      return '路径冲突';
    case 'slug_invalid':
      return 'slug 不正确。';
    case 'space_already_mounted':
      return '这个空间已经挂在本站点。';
    case 'space_not_found':
      return '找不到这个空间。';
    case 'site_not_found':
      return '找不到这个站点。';
    case 'site_name_invalid':
      return '站点名称不正确。';
    case 'validation_failed':
      return '请修正后再保存。';
    case 'idempotency_key_reused':
      return '这次保存和上一次不是同一件事。';
    default:
      break;
  }
  if (failure.status === 429) return retryMessage(failure.retryAfter);
  if (failure.status === 0) return '网络失败。已填写的内容仍保留。';
  if (failure.status >= 500) {
    return failure.traceId ? `服务没有完成。追踪号 ${failure.traceId}。` : '服务没有完成。';
  }
  return failure.traceId ? `没有完成。追踪号 ${failure.traceId}。` : '没有完成。';
}

export function queryFailureMessage(failure: Pick<FailureLike, 'status' | 'traceId' | 'retryAfter'>): string {
  if (failure.status === 429) return retryMessage(failure.retryAfter);
  if (failure.status === 0) return '网络失败。';
  return failure.traceId ? `查询没有完成。追踪号 ${failure.traceId}。` : '查询没有完成。';
}

function retryMessage(retryAfter: number | null): string {
  return retryAfter === null ? '尝试过于频繁，请稍后再试。' : `尝试过于频繁，请在 ${retryAfter} 秒后再试。`;
}

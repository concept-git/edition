export type RedirectOrigin = 'auto' | 'manual';
export type RedirectTargetType = 'space' | 'page';

export type RedirectRule = {
  path: string;
  targetId: string;
  targetType: RedirectTargetType;
  origin: RedirectOrigin;
  currentPath: string | null;
  targetLabel: string | null;
};

export type MountAddress = {
  spaceId: string;
  spaceName: string;
  slug: string;
};

export type PageAddress = {
  id: string;
  spaceId: string;
  title: string;
  slug: string;
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

export function writeFailureMessage(failure: FailureLike): string {
  switch (failure.code) {
    case 'slug_taken':
      return '路径冲突';
    case 'slug_invalid':
      return '地址不正确。';
    case 'mount_not_found':
      return '找不到这个挂载。';
    case 'redirect_not_manual':
      return '自动登记的重定向不能删除。';
    case 'site_not_found':
      return '找不到这个站点。';
    case 'page_not_found':
      return '找不到这个页面。';
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

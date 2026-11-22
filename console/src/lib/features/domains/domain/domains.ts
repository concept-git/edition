export type DomainDetail = {
  host: string;
  verified: boolean;
  isPrimary: boolean;
  txtName: string;
  txtValue: string;
};

export type DomainRecord = DomainDetail & { canUpdate: boolean };

export type ListedDomain = {
  host: string;
  verified: boolean;
  isPrimary: boolean;
  canUpdate: boolean;
};

export type DomainList = {
  items: ListedDomain[];
  canBind: boolean;
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

export function canSetPrimary(domain: { verified: boolean; isPrimary: boolean }): boolean {
  return domain.verified && !domain.isPrimary;
}

export function writeFailureMessage(failure: FailureLike): string {
  switch (failure.code) {
    case 'validation_failed':
      return '域名不正确。';
    case 'domain_taken':
      return '这个域名已被占用。';
    case 'domain_not_verified':
      return '未核验的域名不能设为主域名。';
    case 'domain_not_found':
      return '找不到这个域名。';
    case 'domain_is_primary':
      return '先改主域名，再解绑现在的主域名。';
    case 'not_proven':
      return '核验未通过。请核对 TXT 记录。';
    case 'site_not_found':
      return '找不到这个站点。';
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

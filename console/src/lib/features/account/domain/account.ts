import type { ApiFailure } from '#lib/shared/api/client';

export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

/** Same intent retries with one key. A different payload is a new intent. */
export function keyForIntent(current: { key: string; fingerprint: string }, fingerprint: string) {
  if (current.fingerprint === fingerprint && current.key) return current;
  return { key: newIdempotencyKey(), fingerprint };
}

export function passwordFeedback(failure: ApiFailure): { target: 'old' | 'new' | 'form'; message: string } {
  if (failure.code === 'invalid_old_password') return { target: 'old', message: '当前密码不正确。' };
  if (failure.code === 'password_too_weak') return { target: 'new', message: '新密码至少 8 位，并且同时包含字母和数字。' };
  if (failure.code === 'password_locked') {
    const wait = failure.retryAfter === null ? '请稍后再试。' : `请在 ${failure.retryAfter} 秒后再试。`;
    return { target: 'form', message: `密码已锁定，${wait}` };
  }
  return { target: 'form', message: keptDraft('密码没有改成', failure) };
}

export function confirmFeedback(failure: ApiFailure): string {
  if (failure.code === 'invalid_old_password' || failure.code === 'erase_confirmation_invalid') return '邮箱或当前密码不正确。';
  if (failure.code === 'ownership_transfer_required') return '需要先移交所有者身份，账号仍在。';
  return keptDraft('没有完成', failure);
}

export function keptDraft(action: string, failure: ApiFailure): string {
  if (failure.status === 0) return `网络失败，${action}。已填写的内容仍保留。`;
  if (failure.status === 429) {
    return failure.retryAfter === null
      ? '尝试过于频繁，请稍后再试。已填写的内容仍保留。'
      : `尝试过于频繁，请在 ${failure.retryAfter} 秒后再试。已填写的内容仍保留。`;
  }
  if (failure.status >= 500) {
    return failure.traceId ? `${action}。追踪号 ${failure.traceId}。已填写的内容仍保留。` : `${action}。已填写的内容仍保留。`;
  }
  return `${action}。已填写的内容仍保留。`;
}

export function canRetry(failure: ApiFailure): boolean {
  return failure.status === 0 || failure.status >= 500;
}

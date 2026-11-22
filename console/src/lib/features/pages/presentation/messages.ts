import type { ApiFailure } from '#lib/shared/api/client';

export function pagesFailureMessage(failure: ApiFailure): string {
  if (failure.status === 0) return '网络失败，页面没有载入。';
  if (failure.status === 429) {
    return failure.retryAfter === null ? '载入过于频繁，请稍后再试。' : `载入过于频繁，请在 ${failure.retryAfter} 秒后再试。`;
  }
  return failure.traceId ? `页面没有载入。追踪号 ${failure.traceId}。` : '页面没有载入。';
}

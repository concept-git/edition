import type { ApiFailure } from '#lib/shared/api/client';

export function loadFailureMessage(failure: ApiFailure): string {
  if (failure.status === 0) return '网络失败，上线进度没有载入。';
  if (failure.status === 429) return retryText(failure.retryAfter);
  return failure.traceId ? `上线进度没有载入。追踪号 ${failure.traceId}。` : '上线进度没有载入。';
}

export function canRetry(failure: ApiFailure): boolean {
  return failure.status === 0 || failure.status === 429 || failure.status >= 500;
}

function retryText(retryAfter: number | null): string {
  return retryAfter === null ? '读取过于频繁，请稍后再试。' : `读取过于频繁，请在 ${retryAfter} 秒后再试。`;
}

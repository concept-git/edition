import type { ApiFailure } from '#lib/shared/api/client';
import { rateLimitText, traceText } from '#lib/shared/api/copy';

export function loadFailureMessage(failure: ApiFailure): string {
  if (failure.status === 0) return '网络失败，上线进度没有载入。';
  if (failure.status === 429) return rateLimitText('读取', failure.retryAfter);
  return traceText('上线进度没有载入。', failure.traceId);
}

export function canRetry(failure: ApiFailure): boolean {
  return failure.status === 0 || failure.status === 429 || failure.status >= 500;
}

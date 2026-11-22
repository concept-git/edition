import type { ApiFailure } from '#lib/shared/api/client';

export function queryFailureMessage(failure: ApiFailure): string {
  if (failure.status === 0) return '网络失败，回收页没有载入。';
  if (failure.status === 429) return retryText('载入', failure.retryAfter);
  return failure.traceId ? `回收页没有载入。追踪号 ${failure.traceId}。` : '回收页没有载入。';
}

export function restoreRejection(failure: ApiFailure): string {
  if (failure.status === 0) return '网络失败，页面仍在回收里。';
  if (failure.status === 429) return retryText('恢复', failure.retryAfter);
  if (failure.status >= 500) return withTrace('页面没有恢复。', failure.traceId);
  return failure.code ? `页面没有恢复（${failure.code}）。` : '页面没有恢复。';
}

function retryText(action: string, retryAfter: number | null): string {
  return retryAfter === null ? `${action}过于频繁，请稍后再试。` : `${action}过于频繁，请在 ${retryAfter} 秒后再试。`;
}

function withTrace(prefix: string, traceId: string | null): string {
  return traceId ? `${prefix}追踪号 ${traceId}。` : prefix;
}

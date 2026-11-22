import type { ApiFailure } from '#lib/shared/api/client';

export function queryFailureMessage(failure: ApiFailure): string {
  if (failure.status === 0) return '网络失败，目录没有载入。';
  if (failure.status === 429) return retryText('载入', failure.retryAfter);
  return failure.traceId ? `目录没有载入。追踪号 ${failure.traceId}。` : '目录没有载入。';
}

export function directoryRejection(failure: ApiFailure): string {
  if (failure.code === 'depth_exceeded') return '目录最多 7 级。';
  if (failure.code === 'cycle_detected') return '不能把条目移到自己的下级，否则成环。';
  if (failure.code === 'position_invalid') return '这个位置不合法。';
  if (failure.code === 'toc_entry_not_found') return '这个条目已经不在目录里。';
  if (failure.code === 'page_not_found') return '这个页面不在空间里。';
  if (failure.code === 'validation_failed') return '目录项不合法。';
  if (failure.status === 0) return '网络失败。目录保持原样。';
  if (failure.status === 429) return retryText('移动', failure.retryAfter);
  if (failure.status >= 500) return withTrace('目录没有改成。', failure.traceId);
  return failure.code ? `目录没有改成（${failure.code}）。` : '目录没有改成。';
}

function retryText(action: string, retryAfter: number | null): string {
  return retryAfter === null ? `${action}过于频繁，请稍后再试。` : `${action}过于频繁，请在 ${retryAfter} 秒后再试。`;
}

function withTrace(prefix: string, traceId: string | null): string {
  return traceId ? `${prefix}追踪号 ${traceId}。` : prefix;
}

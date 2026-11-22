import type { ApiFailure } from '#lib/shared/api/client';

export function queryFailureMessage(failure: ApiFailure): string {
  if (failure.status === 0) return '网络失败，页面没有载入。';
  if (failure.status === 429) return retryText('载入', failure.retryAfter);
  return failure.traceId ? `页面没有载入。追踪号 ${failure.traceId}。` : '页面没有载入。';
}

export function tagRejection(failure: ApiFailure): string {
  if (failure.code === 'too_many_tags') return '这一页的标签已经到 50 个。';
  if (failure.code === 'validation_failed') return '标签需要是 1 到 64 个字符，且不能含有斜线。';
  if (failure.status === 0) return '网络失败，标签没有保存。';
  if (failure.status === 429) return retryText('标记', failure.retryAfter);
  if (failure.status >= 500) return withTrace('标签没有保存。', failure.traceId);
  return failure.code ? `标签没有保存（${failure.code}）。` : '标签没有保存。';
}

export function findRejection(failure: ApiFailure): string {
  if (failure.status === 0) return '网络失败，按标签查找没有完成。';
  if (failure.status === 429) return retryText('查找', failure.retryAfter);
  if (failure.status >= 500) return withTrace('按标签查找没有完成。', failure.traceId);
  return failure.code ? `按标签查找没有完成（${failure.code}）。` : '按标签查找没有完成。';
}

function retryText(action: string, retryAfter: number | null): string {
  return retryAfter === null ? `${action}过于频繁，请稍后再试。` : `${action}过于频繁，请在 ${retryAfter} 秒后再试。`;
}

function withTrace(prefix: string, traceId: string | null): string {
  return traceId ? `${prefix}追踪号 ${traceId}。` : prefix;
}

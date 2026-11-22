import type { ApiFailure } from '#lib/shared/api/client';

export function queryFailureMessage(failure: ApiFailure): string {
  if (failure.status === 0) return '网络失败，页面没有载入。';
  if (failure.status === 429) return retryText('载入', failure.retryAfter);
  return failure.traceId ? `页面没有载入。追踪号 ${failure.traceId}。` : '页面没有载入。';
}

export function createRejection(failure: ApiFailure): string {
  if (failure.code === 'validation_failed') return '标题长度需要在 1 到 200 个字符之间。';
  if (failure.code === 'slug_taken') return '这个地址已经在用。';
  if (failure.status === 0) return '网络失败，页面没有创建。';
  if (failure.status === 429) return retryText('创建', failure.retryAfter);
  if (failure.status >= 500) return withTrace('页面没有创建。', failure.traceId);
  return failure.code ? `页面没有创建（${failure.code}）。` : '页面没有创建。';
}

export function saveRejection(failure: ApiFailure): string {
  if (failure.code === 'edit_conflict') return '基线冲突。本地草稿还在。';
  if (failure.code === 'validation_failed') return limitRejection();
  if (failure.status === 0) return '网络失败。本地草稿还在。';
  if (failure.status === 429) return retryText('保存', failure.retryAfter);
  if (failure.status >= 500) return withTrace('正文没有保存。本地草稿还在。', failure.traceId);
  return failure.code ? `正文没有保存（${failure.code}）。` : '正文没有保存。';
}

export function limitRejection(): string {
  return '正文超过 2 MiB，没有保存。';
}

export function markRejection(failure: ApiFailure): string {
  if (failure.status === 0) return '网络失败，进版没有完成。';
  if (failure.status === 429) return retryText('进版', failure.retryAfter);
  if (failure.status >= 500) return withTrace('进版没有完成。', failure.traceId);
  return failure.code ? `进版没有完成（${failure.code}）。` : '进版没有完成。';
}

export function clearMarkRejection(failure: ApiFailure): string {
  if (failure.status === 0) return '网络失败，取消进版没有完成。';
  if (failure.status === 429) return retryText('取消进版', failure.retryAfter);
  if (failure.status >= 500) return withTrace('取消进版没有完成。', failure.traceId);
  return failure.code ? `取消进版没有完成（${failure.code}）。` : '取消进版没有完成。';
}

function retryText(action: string, retryAfter: number | null): string {
  return retryAfter === null ? `${action}过于频繁，请稍后再试。` : `${action}过于频繁，请在 ${retryAfter} 秒后再试。`;
}

function withTrace(prefix: string, traceId: string | null): string {
  return traceId ? `${prefix}追踪号 ${traceId}。` : prefix;
}

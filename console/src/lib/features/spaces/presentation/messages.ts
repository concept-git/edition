import type { ApiFailure } from '#lib/shared/api/client';

export function queryFailureMessage(failure: ApiFailure): string {
  if (failure.status === 0) return '网络失败，空间列表没有载入。';
  if (failure.status === 429) return retryText('载入', failure.retryAfter);
  return failure.traceId ? `空间列表没有载入。追踪号 ${failure.traceId}。` : '空间列表没有载入。';
}

export function createRejection(failure: ApiFailure): string {
  if (failure.code === 'space_name_invalid') return '名称长度需要在 1 到 120 个字符之间。';
  if (failure.status === 0) return '网络失败，空间没有创建。';
  if (failure.status === 429) return retryText('创建', failure.retryAfter);
  if (failure.status >= 500) return withTrace('空间没有创建。', failure.traceId);
  return failure.code ? `空间没有创建（${failure.code}）。` : '空间没有创建。';
}

export function saveRejection(failure: ApiFailure): string {
  if (failure.status === 0) return '网络失败，自动发版没有保存。';
  if (failure.status === 429) return retryText('保存', failure.retryAfter);
  if (failure.status >= 500) return withTrace('自动发版没有保存。', failure.traceId);
  return failure.code ? `自动发版没有保存（${failure.code}）。` : '自动发版没有保存。';
}

export function canRetry(failure: ApiFailure): boolean {
  return failure.status === 0 || failure.status === 429 || failure.status >= 500;
}

function retryText(action: string, retryAfter: number | null): string {
  return retryAfter === null ? `${action}过于频繁，请稍后再试。` : `${action}过于频繁，请在 ${retryAfter} 秒后再试。`;
}

function withTrace(prefix: string, traceId: string | null): string {
  return traceId ? `${prefix}追踪号 ${traceId}。` : prefix;
}

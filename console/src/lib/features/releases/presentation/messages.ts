import type { ApiFailure } from '#lib/shared/api/client';

export function listFailureMessage(failure: ApiFailure): string {
  if (failure.status === 0) return '网络失败，发版列表没有载入。';
  if (failure.status === 429) return retryText('载入', failure.retryAfter);
  return failure.traceId ? `发版列表没有载入。追踪号 ${failure.traceId}。` : '发版列表没有载入。';
}

export function buildFailureMessage(failure: ApiFailure): string {
  if (failure.status === 0) return '网络失败，构建没有完成。';
  if (failure.status === 429) return retryText('构建', failure.retryAfter);
  if (failure.status >= 500) return withTrace('构建没有完成。', failure.traceId);
  return failure.code ? `构建没有完成（${failure.code}）。` : '构建没有完成。';
}

export function previewFailureMessage(failure: ApiFailure): string {
  if (failure.status === 0) return '网络失败，预览没有打开。';
  if (failure.status === 429) return retryText('预览', failure.retryAfter);
  if (failure.status === 409 || failure.status === 404) return '这份发版不能预览。';
  return withTrace('预览没有打开。', failure.traceId);
}

export function switchFailureMessage(failure: ApiFailure): string {
  if (failure.status === 0) return '网络失败，主版本没有切换。';
  if (failure.status === 429) return retryText('切换', failure.retryAfter);
  if (failure.status === 409) return '发版状态已经变化，请重新载入后再切换。';
  if (failure.status >= 500) return withTrace('主版本没有切换。', failure.traceId);
  return failure.code ? `主版本没有切换（${failure.code}）。` : '主版本没有切换。';
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

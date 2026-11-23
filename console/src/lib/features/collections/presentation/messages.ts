import { rateLimitText as retryText, traceText as withTrace } from '#lib/shared/api/copy';
import type { ApiFailure } from '#lib/shared/api/client';

export function queryFailureMessage(failure: ApiFailure): string {
  if (failure.status === 0) return '网络失败，分组没有载入。';
  if (failure.status === 429) return retryText('载入', failure.retryAfter);
  return failure.traceId ? `分组没有载入。追踪号 ${failure.traceId}。` : '分组没有载入。';
}

export function createRejection(failure: ApiFailure): string {
  if (failure.code === 'depth_exceeded') return '分组最多 3 级。';
  if (failure.code === 'collection_name_taken') return '同一上级下已经有这个名称。';
  if (failure.code === 'validation_failed') return '名称长度需要在 1 到 200 个字符之间。';
  if (failure.status === 0) return '网络失败，分组没有创建。';
  if (failure.status === 429) return retryText('创建', failure.retryAfter);
  if (failure.status >= 500) return withTrace('分组没有创建。', failure.traceId);
  return failure.code ? `分组没有创建（${failure.code}）。` : '分组没有创建。';
}

export function placeRejection(failure: ApiFailure): string {
  if (failure.status === 0) return '网络失败，空间没有放入分组。';
  if (failure.status === 429) return retryText('放入', failure.retryAfter);
  if (failure.status >= 500) return withTrace('空间没有放入分组。', failure.traceId);
  return failure.code ? `空间没有放入分组（${failure.code}）。` : '空间没有放入分组。';
}


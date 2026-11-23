import { rateLimitText as retryText, traceText as withTrace } from '#lib/shared/api/copy';
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

export function archiveRejection(failure: ApiFailure): string {
  if (failure.status === 0) return '网络失败，空间没有归档。';
  if (failure.status === 429) return retryText('归档', failure.retryAfter);
  if (failure.status >= 500) return withTrace('空间没有归档。', failure.traceId);
  return failure.code ? `空间没有归档（${failure.code}）。` : '空间没有归档。';
}

export function deleteRejection(failure: ApiFailure): string {
  if (failure.code === 'deletion_confirmation_invalid') return '名称不符，空间还在。';
  if (failure.code === 'space_not_archived') return '空间还没归档，仍然留在列表里。';
  if (failure.status === 0) return '网络失败，空间还在。';
  if (failure.status === 429) return retryText('删除', failure.retryAfter);
  if (failure.status >= 500) return withTrace('空间没有删除。', failure.traceId);
  return failure.code ? `空间没有删除（${failure.code}）。` : '空间没有删除。';
}

export function canRetry(failure: ApiFailure): boolean {
  return failure.status === 0 || failure.status === 429 || failure.status >= 500;
}


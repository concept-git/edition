import type { ApiFailure } from '#lib/shared/api/client';

export function loadFailureMessage(failure: ApiFailure): string {
  if (failure.status === 0) return '网络失败，导入没有载入。';
  if (failure.status === 429) return retryText('载入', failure.retryAfter);
  return failure.traceId ? `导入没有载入。追踪号 ${failure.traceId}。` : '导入没有载入。';
}

export function importFailureMessage(failure: ApiFailure): string {
  if (failure.code === 'space_mode_restricted') return 'authored 空间拒绝整体导入。界面创作不能被外部发版包覆盖。';
  if (failure.code === 'import_in_progress') return '已有进行中的导入。';
  if (failure.code === 'invalid_bundle' || failure.code === 'file_too_large') return '发版包不能导入。';
  if (failure.code === 'resource_not_found') return '发版包没有上传完成。';
  if (failure.status === 0) return '网络失败，导入没有受理。';
  if (failure.status === 429) return retryText('导入', failure.retryAfter);
  if (failure.status >= 500) return withTrace('导入没有受理。', failure.traceId);
  return failure.code ? `导入没有受理（${failure.code}）。` : '导入没有受理。';
}

export function retryFailureMessage(failure: ApiFailure): string {
  if (failure.status === 0) return '网络失败，导入没有再次执行。';
  if (failure.status === 429) return retryText('再次执行', failure.retryAfter);
  if (failure.status >= 500) return withTrace('导入没有再次执行。', failure.traceId);
  return failure.code ? `导入没有再次执行（${failure.code}）。` : '导入没有再次执行。';
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

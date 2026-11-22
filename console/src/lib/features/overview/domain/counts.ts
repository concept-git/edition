export type TenantCounts = {
  members: number;
  spaces: number;
  sites: number;
};

export type CountFailure = {
  status: number;
  code: string | null;
  traceId: string | null;
  retryAfter: number | null;
};

export function countsAreEmpty(counts: TenantCounts): boolean {
  return counts.members === 0 && counts.spaces === 0 && counts.sites === 0;
}

/** A failed query is told apart from a real zero. Trace id is shown when the response has one. */
export function countFailureText(failure: CountFailure): string {
  if (failure.status === 0) return '网络失败，数量没有取到。';
  const parts = ['数量没有取到。'];
  if (failure.code) parts.push(`错误 ${failure.code}。`);
  if (failure.traceId) parts.push(`追踪号 ${failure.traceId}。`);
  if (failure.retryAfter !== null) parts.push(`请在 ${failure.retryAfter} 秒后再试。`);
  return parts.join('');
}

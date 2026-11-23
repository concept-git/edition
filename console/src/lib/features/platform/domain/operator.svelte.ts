import { api, type ApiFailure } from '#lib/shared/api/client';
import { rateLimitText, traceText } from '#lib/shared/api/copy';

export type OperatorStatus = {
  allowed: boolean;
  failure: ApiFailure | null;
};

/** Reads whether the signed-in user is a platform operator. No module state. */
export function readOperator(token: string | null): Promise<OperatorStatus> {
  if (!token) return Promise.resolve({ allowed: false, failure: null });
  return api<{ platformOperator?: boolean }>(token, '/api/v1/me').then((result) => {
    if (!result.ok) return { allowed: false, failure: result.failure };
    return { allowed: result.body.platformOperator === true, failure: null };
  });
}

export function operatorFailureText(failure: ApiFailure): string {
  if (failure.status === 429) return rateLimitText('尝试', failure.retryAfter);
  if (failure.status === 0) return '网络失败。';
  return traceText('身份没有读到。', failure.traceId);
}

import { isRecord } from './session';

export type FieldViolation = { field: string; code: string };
export class ApiFailure extends Error {
  readonly status: number;
  readonly code: string;
  readonly traceId?: string;
  readonly violations: FieldViolation[];
  readonly detail?: string;
  readonly retryAfter?: number;
  readonly payload: unknown;
  constructor(response: Response, payload: unknown) {
    const problem = isRecord(payload) ? payload : {};
    const code =
      typeof problem.code === 'string' ? problem.code : 'request_failed';
    super(code);
    this.name = 'ApiFailure';
    this.status = response.status;
    this.code = code;
    this.payload = payload;
    this.traceId =
      typeof problem.traceId === 'string' ? problem.traceId : undefined;
    this.detail =
      typeof problem.detail === 'string' ? problem.detail : undefined;
    this.violations = Array.isArray(problem.violations)
      ? problem.violations.filter(
          (item): item is FieldViolation =>
            isRecord(item) &&
            typeof item.field === 'string' &&
            typeof item.code === 'string',
        )
      : [];
    const after = response.headers.get('Retry-After');
    if (after)
      this.retryAfter = /^\d+$/.test(after)
        ? Number(after) * 1000
        : Math.max(0, Date.parse(after) - Date.now());
  }
}

export function shouldRetryQuery(attempt: number, failure: unknown) {
  return (
    attempt < 2 &&
    failure instanceof ApiFailure &&
    [429, 503, 504].includes(failure.status)
  );
}

export function retryDelay(attempt: number, failure: unknown) {
  return failure instanceof ApiFailure && failure.retryAfter !== undefined
    ? failure.retryAfter
    : Math.min(1000 * 2 ** attempt, 10000) + Math.random() * 250;
}

export function failureMessage(error: unknown): string {
  if (!(error instanceof ApiFailure))
    return error instanceof Error && error.name === 'AbortError'
      ? '操作已取消'
      : '连接失败，输入已保留，请稍后重试。';
  const labels: Record<string, string> = {
    invalid_credentials: '邮箱或密码不可用，请检查后重试。',
    invalid_refresh: '会话已失效，请重新登录。',
    edit_conflict:
      '内容已被其他人修改。你的工作稿已保留，请比较最新内容后再保存。',
    authentication_required: '需要有效会话。请刷新会话后再重试当前操作。',
    rate_limited: '请求过于频繁，请等待提示时间后重试。',
    permission_denied: '当前身份无权执行此操作。',
  };
  return (
    labels[error.code] ??
    (error.status === 403
      ? '当前身份无权执行此操作。'
      : `操作未完成（${error.code}），请检查输入或稍后重试。`)
  );
}

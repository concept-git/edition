import type { Problem, ReadFailure } from "../../../shared/problem.ts";

export interface ErrorCopy {
  status: number;
  heading: string;
  message: string;
  traceId: string | null;
  retryAfter: number | null;
  /** 上游 x-request-id（表单路由失败时显示，便于排障）。 */
  requestId?: string | null;
}

/** 失败意图 → 展示文案。401 与匿名 403 由 app 导向登录页，这里处理其余情形。 */
export function describeFailure(failure: ReadFailure, zh: boolean): ErrorCopy {
  const traceId = failure.problem.traceId;
  switch (failure.kind) {
    case "missing":
      return {
        status: 404,
        heading: zh ? "页面不存在" : "Page not found",
        message: zh
          ? "你访问的页面不存在，或已被移除。"
          : "The page does not exist or was removed.",
        traceId,
        retryAfter: null,
      };
    case "forbidden":
      return {
        status: 403,
        heading: zh ? "无权访问" : "Access denied",
        message: zh
          ? "当前账号没有阅读此页面的权限。"
          : "Your account cannot read this page.",
        traceId,
        retryAfter: null,
      };
    case "unauthorized":
      return {
        status: 401,
        heading: zh ? "请重新登录" : "Sign in again",
        message: zh ? "登录已失效，请重新登录。" : "Your session has expired.",
        traceId,
        retryAfter: null,
      };
    case "unavailable":
      return {
        status: 503,
        heading: zh ? "服务暂时不可用" : "Service unavailable",
        message: zh
          ? "服务暂时不可用，请稍后重试。"
          : "Please try again shortly.",
        traceId,
        retryAfter: failure.retryAfter,
      };
  }
}

/** 会话写操作（续期、退出、跨站拒绝）失败：保持上游状态码，显示 traceId 与 x-request-id。 */
export function describeSessionError(
  status: number,
  problem: Problem,
  zh: boolean,
  extra: { retryAfter?: number | null; requestId?: string | null } = {},
): ErrorCopy {
  const base = {
    status,
    traceId: problem.traceId,
    retryAfter: extra.retryAfter ?? null,
    requestId: extra.requestId ?? null,
  };
  if (status === 401)
    return {
      ...base,
      heading: zh ? "请重新登录" : "Sign in again",
      message: zh ? "登录已失效，请重新登录。" : "Your session has expired.",
    };
  if (status === 403)
    return {
      ...base,
      heading: zh ? "请求被拒绝" : "Request rejected",
      message: zh ? "请求来源不被允许。" : "Request origin not allowed.",
    };
  if (status === 422)
    return {
      ...base,
      heading: zh ? "请求无效" : "Invalid request",
      message: zh ? "提交的内容无效。" : "The submitted data is invalid.",
    };
  if (status === 429)
    return {
      ...base,
      heading: zh ? "操作过于频繁" : "Too many requests",
      message: zh ? "请稍后再试。" : "Try again later.",
    };
  return {
    ...base,
    heading: zh ? "服务暂时不可用" : "Service unavailable",
    message: zh ? "服务暂时不可用，请稍后重试。" : "Please try again shortly.",
  };
}

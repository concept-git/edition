import type { ArticleResult } from "../../features/page-reading/index.ts";
import type { ErrorCopy } from "../../features/error-pages/index.ts";
import type { Site } from "../../features/site/index.ts";
import type { SearchHit } from "../../features/search/index.ts";
import type { ForwardContext } from "../../shared/http/forward.ts";

export interface LoginError {
  reason:
    | "invalid-credentials"
    | "invalid-input"
    | "cross-site"
    | "rate-limited"
    | "unavailable";
  traceId: string | null;
  requestId: string | null;
}

export type View =
  | { kind: "article"; article: Extract<ArticleResult, { kind: "article" }> }
  | {
      kind: "login";
      site: Site | null;
      returnTo: string;
      clearStale: boolean;
      /** 表单提交失败后的服务端渲染错误。 */
      error?: LoginError;
    }
  /** 阅读凭据已过期但会话可续：给出「继续阅读」。 */
  | { kind: "continue"; site: Site | null; returnTo: string }
  | { kind: "error"; site: Site | null; copy: ErrorCopy }
  | {
      kind: "search";
      site: Site | null;
      query: string;
      hits: SearchHit[];
      nextHref: string | null;
      proof: string | null;
      scope: string | null;
    };

export type RouteResult =
  | { response: Response }
  | {
      response?: undefined;
      view: View;
      status: number;
      headers: Record<string, string>;
      /** 多值 Set-Cookie（上游原样转发），不能放进单值 headers。 */
      setCookies?: string[];
    };

export const zhOf = (site: Site | null) =>
  !site || site.locale?.toLowerCase() === "zh-cn";

/** 匿名可共享缓存，带凭据则 private；授权判定每次都回源（no-cache）。 */
export function cacheHeaders(context: ForwardContext): Record<string, string> {
  return {
    "cache-control": context.hasCredentials
      ? "private, no-cache"
      : "public, no-cache",
    vary: "Cookie, Authorization",
  };
}

export const uncached: Record<string, string> = {
  "cache-control": "no-store",
  vary: "Cookie, Authorization",
};

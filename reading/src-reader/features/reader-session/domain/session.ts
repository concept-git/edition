import type { Problem } from "../../../shared/problem.ts";
import { isSiteRelativePath } from "../../../shared/url/paths.ts";

export interface Credentials {
  email: string;
  password: string;
}

export type OpenFailure =
  | "invalid-credentials"
  | "invalid-input"
  | "cross-site"
  | "rate-limited"
  | "unavailable";
export type OpenResult =
  { ok: true } | { ok: false; reason: OpenFailure; retryAfter: number | null };

/** 仓储契约：Control 的 /_auth/session 资源。 */
export interface SessionGateway {
  open(credentials: Credentials): Promise<OpenResult>;
  close(): Promise<void>;
  refresh(): Promise<boolean>;
  /** 续期并带回状态码、Retry-After 与请求号；网络失败时 status 为 0。 */
  renew(): Promise<RenewResult>;
}

export interface RenewResult {
  status: number;
  retryAfter: number | null;
  requestId: string | null;
}

/** 浏览器端发请求的函数；由 app 注入，application 不直接做 I/O。 */
export type Send = (
  input: string | URL,
  init?: RequestInit,
) => Promise<Response>;

/** returnTo 只接受站内相对路径；其余一律回到站点首页。 */
export function safeReturnTo(value: unknown, fallback = "/"): string {
  return isSiteRelativePath(value) ? value : fallback;
}

/** 表单路由使用的严格版本：缺省回首页，给了但不是站内路径则判为无效（调用方返回 422）。 */
export function parseReturnTo(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return "/";
  return isSiteRelativePath(value) ? value : null;
}

/** 服务端代调 Control 会话资源的结果；Set-Cookie 原样保留，不解析。 */
export type UpstreamOutcome =
  | { ok: true; setCookies: string[] }
  | {
      ok: false;
      status: number;
      problem: Problem;
      retryAfter: number | null;
      requestId: string | null;
      /** 失败响应也可能带 Set-Cookie（如续期 401 清 Cookie），同样原样转发。 */
      setCookies: string[];
    };

/** 仓储契约：服务端到 Control 的 /_auth/session 资源（带站点 Origin 与转发头）。 */
export interface UpstreamSessionGateway {
  open(credentials: Credentials): Promise<UpstreamOutcome>;
  close(): Promise<UpstreamOutcome>;
}

/**
 * 同域表单 POST 的跨站校验：有 Origin 必须等于站点 origin；
 * 缺 Origin 时只接受 Sec-Fetch-Site: same-origin。
 */
export function isSameSiteWrite(
  headers: { origin: string | null; secFetchSite: string | null },
  siteOrigin: string,
): boolean {
  if (headers.origin !== null) return headers.origin === siteOrigin;
  return headers.secFetchSite === "same-origin";
}

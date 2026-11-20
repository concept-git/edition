import { readProblem, retryAfterSeconds, unavailableProblem } from "../../../shared/http/problem-response.ts";
import type { ForwardContext } from "../../../shared/http/forward.ts";
import type { FetchLike } from "../../../shared/http/reader-client.ts";
import type {
  UpstreamOutcome,
  UpstreamSessionGateway,
} from "../domain/session.ts";

/**
 * 服务端代调 Control 的 /_auth/session。写请求带站点 Origin、Host、
 * X-Forwarded-Proto/Host、可信转发的客户端地址与用户 Cookie；Set-Cookie 原样返回。
 */
export function createControlSessionGateway(
  send: FetchLike,
  controlOrigin: string,
  context: ForwardContext,
  timeoutMs = 10000,
): UpstreamSessionGateway {
  async function call(
    method: "POST" | "DELETE",
    path: string,
    body?: unknown,
  ): Promise<UpstreamOutcome> {
    const headers: Record<string, string> = {
      accept: "application/json",
      ...context.headers,
      origin: context.origin,
    };
    delete headers.authorization;
    if (body !== undefined) headers["content-type"] = "application/json";
    let response: Response;
    try {
      response = await send(new URL(path, controlOrigin), {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        redirect: "manual",
        cache: "no-store",
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch {
      return {
        ok: false,
        status: 503,
        problem: unavailableProblem(),
        retryAfter: null,
        requestId: null,
        setCookies: [],
      };
    }
    if (response.ok)
      return { ok: true, setCookies: response.headers.getSetCookie() };
    const problem = await readProblem(response);
    return {
      ok: false,
      status: response.status,
      problem,
      retryAfter: retryAfterSeconds(response),
      requestId: response.headers.get("x-request-id"),
      setCookies: response.headers.getSetCookie(),
    };
  }
  return {
    open: (credentials) => call("POST", "/_auth/session", credentials),
    close: () => call("DELETE", "/_auth/session"),
  };
}

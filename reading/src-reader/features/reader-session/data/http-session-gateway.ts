import type { FetchLike } from "../../../shared/http/reader-client.ts";
import type {
  Credentials,
  OpenResult,
  RenewResult,
  SessionGateway,
} from "../domain/session.ts";

/** 在浏览器里调用同站的 /_auth/session（边缘转发给 Control）。 */
export function createHttpSessionGateway(
  send: FetchLike = (input, init) => fetch(input, init),
  base = "/_auth/session",
): SessionGateway {
  async function renew(): Promise<RenewResult> {
    let response: Response;
    try {
      response = await send(`${base}/refresh`, {
        method: "POST",
        credentials: "same-origin",
      });
    } catch {
      return { status: 0, retryAfter: null, requestId: null };
    }
    const retry = Number(response.headers.get("retry-after"));
    return {
      status: response.status,
      retryAfter: Number.isFinite(retry) && retry > 0 ? retry : null,
      requestId: response.headers.get("x-request-id"),
    };
  }
  return {
    renew,
    async open(credentials: Credentials): Promise<OpenResult> {
      let response: Response;
      try {
        response = await send(base, {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "content-type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify(credentials),
        });
      } catch {
        return { ok: false, reason: "unavailable", retryAfter: null };
      }
      if (response.status === 201) return { ok: true };
      const retry = Number(response.headers.get("retry-after"));
      const retryAfter = Number.isFinite(retry) && retry > 0 ? retry : null;
      const reason =
        response.status === 401
          ? "invalid-credentials"
          : response.status === 403
            ? "cross-site"
            : response.status === 422
              ? "invalid-input"
              : response.status === 429
                ? "rate-limited"
                : "unavailable";
      return { ok: false, reason, retryAfter };
    },
    async close() {
      await send(base, { method: "DELETE", credentials: "same-origin" });
    },
    async refresh() {
      return (await renew()).status === 204;
    },
  };
}

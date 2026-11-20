import type { RenewResult, Send } from "../domain/session.ts";

const expiredCode = "reader_access_expired";

/**
 * 给读取请求加自动续期：401 且凭据过期时续期并重试一次。
 * 续期被拒（401）则要求重新登录；其余失败合成 problem+json，带 Retry-After 与请求号。
 */
export function withRenewal(
  send: Send,
  renewer: { renew(): Promise<RenewResult> },
  onLoginRequired: () => void,
): Send {
  return async (input, init) => {
    const response = await send(input, init);
    if (response.status !== 401 || (init?.method && init.method !== "GET"))
      return response;
    const problem = await response
      .clone()
      .json()
      .catch(() => null);
    if (problem?.code !== expiredCode) return response;
    const renewed = await renewer.renew();
    if (renewed.status === 204) return send(input, init);
    if (renewed.status === 401) {
      onLoginRequired();
      return response;
    }
    return new Response(
      JSON.stringify({
        code: "reader_refresh_unavailable",
        traceId: renewed.requestId,
      }),
      {
        status: renewed.status >= 400 ? renewed.status : 503,
        headers: {
          "content-type": "application/problem+json",
          "retry-after": String(renewed.retryAfter ?? 1),
        },
      },
    );
  };
}

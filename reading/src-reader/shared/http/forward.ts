/** 一次浏览器请求中需要原样带给 Reader 的上下文。 */
export interface ForwardContext {
  /** 发给 Reader 的请求头：Cookie、Authorization、Host、X-Forwarded-*。 */
  headers: Record<string, string>;
  /** 站点 Origin（协议 + 主机），用于 events 的 Origin 头与 canonical。 */
  origin: string;
  host: string;
  /** 带有 Bearer 或读者会话 Cookie，响应按 private 缓存。 */
  hasCredentials: boolean;
}

const readerCookie = /(?:^|;\s*)__Host-space_reader=/;
const passthrough = [
  "cookie",
  "authorization",
  "x-forwarded-port",
  "x-forwarded-prefix",
];

function first(value: string | null): string | null {
  const item = value?.split(",")[0]?.trim();
  return item ? item : null;
}

/**
 * 站点 Host 以 X-Forwarded-Host 优先（边缘已改写 Host 时），否则取 Host。
 * 客户端地址只信任上游已带的 X-Forwarded-For；没有时用直连对端地址。
 */
export function buildForwardContext(
  incoming: Headers,
  url: URL,
  peerAddress?: string | null,
): ForwardContext {
  const host =
    first(incoming.get("x-forwarded-host")) ?? incoming.get("host") ?? url.host;
  const protocol =
    first(incoming.get("x-forwarded-proto")) ?? url.protocol.replace(/:$/, "");
  const headers: Record<string, string> = {
    host,
    "x-forwarded-host": host,
    "x-forwarded-proto": protocol,
  };
  for (const name of passthrough) {
    const value = incoming.get(name);
    if (value) headers[name] = value;
  }
  const forwardedFor = incoming.get("x-forwarded-for") ?? peerAddress ?? null;
  if (forwardedFor) headers["x-forwarded-for"] = forwardedFor;
  return {
    headers,
    host,
    origin: `${protocol}://${host}`,
    hasCredentials:
      Boolean(headers.authorization) || readerCookie.test(headers.cookie ?? ""),
  };
}

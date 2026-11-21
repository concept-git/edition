/** Reader 的内部地址；Host 与转发头由 shared/http/forward 单独带上。 */
export function readerOrigin(
  env: Record<string, string | undefined> = process.env,
): string {
  return env.EDITION_CONTENT_ORIGIN?.trim() || "http://127.0.0.1:8080";
}

/** Control 的内部地址：同域表单路由代调 /_auth/session 用。 */
export function controlOrigin(
  env: Record<string, string | undefined> = process.env,
): string {
  return env.EDITION_CONTROL_ORIGIN?.trim() || "http://127.0.0.1:8081";
}

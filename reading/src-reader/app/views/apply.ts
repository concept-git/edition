import type { RouteResult } from "../routes/route-result.ts";

/** 把视图结果的状态与缓存头写到 Astro 的响应上。 */
export function applyView(
  response: { status?: number; headers: Headers },
  route: Extract<RouteResult, { view: unknown }>,
): void {
  response.status = route.status;
  for (const [name, value] of Object.entries(route.headers))
    response.headers.set(name, value);
  for (const cookie of route.setCookies ?? [])
    response.headers.append("set-cookie", cookie);
}

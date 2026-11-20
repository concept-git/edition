import { searchSite } from "../../features/search/index.ts";
import { failureView, type RouteContext } from "./page-route.ts";
import { type RouteResult, uncached } from "./route-result.ts";

/** /_search：Reader 的 /api/content/search 已存在，服务端渲染结果，无需脚本。 */
export async function readSearchRoute(
  route: RouteContext,
): Promise<RouteResult> {
  const { reader } = route.locals;
  const q = route.url.searchParams.get("q") ?? "";
  const cursor = route.url.searchParams.get("cursor");
  const scope = route.url.searchParams.get("spaceSlug")?.trim() || null;
  const [site, outcome] = await Promise.all([
    reader.sites.read(),
    searchSite(reader.search, { q, cursor, spaceSlug: scope }),
  ]);
  const siteValue = site.kind === "site" ? site.site : null;
  if (outcome.kind !== "results")
    return failureView(route, outcome, siteValue, "/_search");
  const next = outcome.nextCursor
    ? `/_search?${new URLSearchParams({ q: outcome.query, cursor: outcome.nextCursor, ...(scope ? { spaceSlug: scope } : {}) })}`
    : null;
  return {
    view: {
      kind: "search",
      site: siteValue,
      query: outcome.query,
      hits: outcome.hits,
      nextHref: next,
      proof: outcome.trackingToken,
      scope,
    },
    status: 200,
    headers: { ...uncached },
  };
}

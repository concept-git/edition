import { describeFailure } from "../../features/error-pages/index.ts";
import { eventFor } from "../../features/analytics/index.ts";
import {
  canonicalPagePath,
  readArticle,
} from "../../features/page-reading/index.ts";
import type { Site } from "../../features/site/index.ts";
import type { ReadFailure } from "../../shared/problem.ts";
import type { ReaderServices } from "../services.ts";
import {
  cacheHeaders,
  type RouteResult,
  uncached,
  zhOf,
} from "./route-result.ts";

export interface RouteContext {
  locals: { reader: ReaderServices; pageEvent?: App.Locals["pageEvent"] };
  url: URL;
  request: Request;
  params: Record<string, string | undefined>;
}

/** 站点首页、/{space}、/{space}/{...page}：把 feature 表达的意图落成 HTTP 响应或视图。 */
export async function readPageRoute(route: RouteContext): Promise<RouteResult> {
  const { reader } = route.locals;
  const path = canonicalPagePath(route.params.space, route.params.page);
  const result = await readArticle({
    sites: reader.sites,
    pages: reader.pages,
    path,
    origin: reader.context.origin,
  });
  const caching = cacheHeaders(reader.context);

  switch (result.kind) {
    case "redirect":
      return {
        response: new Response(null, {
          status: result.status,
          headers: { location: result.location, ...caching },
        }),
      };
    case "attachment":
      // 附件字节由浏览器直接向快照内容资源取，前端不代理。
      return {
        response: new Response(null, {
          status: 303,
          headers: { location: result.location, ...caching },
        }),
      };
    case "article":
      route.locals.pageEvent = eventFor(
        "article",
        path,
        route.request.headers.get("referer"),
        reader.context.host,
      );
      return {
        view: { kind: "article", article: result },
        status: 200,
        headers: caching,
      };
    case "failure":
      return failureView(route, result.failure, result.site, path);
  }
}

export function failureView(
  route: Pick<RouteContext, "locals" | "url" | "request">,
  failure: ReadFailure,
  site: Site | null,
  path: string,
): RouteResult {
  const { context } = route.locals.reader;
  const returnTo = route.url.pathname + route.url.search;
  // 401 凭据过期：会话可续，给出「继续阅读」；其余 401 清掉旧会话后登录；
  // 匿名 403：登录；已登录 403：无权限。
  if (
    failure.kind === "unauthorized" &&
    failure.problem.code === "reader_access_expired"
  )
    return {
      view: { kind: "continue", site, returnTo },
      status: 401,
      headers: uncached,
    };
  if (
    failure.kind === "unauthorized" ||
    (failure.kind === "forbidden" && !context.hasCredentials)
  )
    return {
      view: {
        kind: "login",
        site,
        returnTo,
        clearStale: failure.kind === "unauthorized",
      },
      status: failure.kind === "unauthorized" ? 401 : 403,
      headers: uncached,
    };
  if (failure.kind === "missing")
    route.locals.pageEvent = eventFor(
      "missing",
      path,
      route.request.headers.get("referer"),
      context.host,
    );
  const copy = describeFailure(failure, zhOf(site));
  const headers: Record<string, string> = { ...uncached };
  if (copy.retryAfter) headers["retry-after"] = String(copy.retryAfter);
  return { view: { kind: "error", site, copy }, status: copy.status, headers };
}

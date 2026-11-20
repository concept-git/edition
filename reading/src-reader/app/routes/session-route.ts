import { describeSessionError } from "../../features/error-pages/index.ts";
import {
  isSameSiteWrite,
  safeReturnTo,
  submitLogin,
  submitLogout,
  type FormSessionResult,
} from "../../features/reader-session/index.ts";
import type { Site } from "../../features/site/index.ts";
import type { Problem } from "../../shared/problem.ts";
import type { RouteContext } from "./page-route.ts";
import {
  type LoginError,
  type RouteResult,
  uncached,
  zhOf,
} from "./route-result.ts";

type Route = Pick<RouteContext, "locals" | "url" | "request">;

async function siteOf(route: Route): Promise<Site | null> {
  const result = await route.locals.reader.sites.read();
  return result.kind === "site" ? result.site : null;
}

const noProblem: Problem = {
  status: 0,
  code: null,
  title: null,
  detail: null,
  traceId: null,
};

function errorView(
  site: Site | null,
  status: number,
  problem: Problem,
  extra: {
    retryAfter?: number | null;
    requestId?: string | null;
    setCookies?: string[];
  } = {},
): RouteResult {
  // 上游没有给请求号（如 Control 不可达）时由前端生成，便于按它排障。
  const requestId = extra.requestId ?? crypto.randomUUID();
  const copy = describeSessionError(status, problem, zhOf(site), {
    ...extra,
    requestId,
  });
  const headers: Record<string, string> = {
    ...uncached,
    "x-request-id": requestId,
  };
  if (copy.retryAfter) headers["retry-after"] = String(copy.retryAfter);
  return {
    view: { kind: "error", site, copy },
    status,
    headers,
    setCookies: extra.setCookies,
  };
}

function redirect(location: string, setCookies: string[]): RouteResult {
  const headers = new Headers({ location, ...uncached });
  for (const cookie of setCookies) headers.append("set-cookie", cookie);
  return { response: new Response(null, { status: 303, headers }) };
}

/** 跨站表单 POST 在前端就拒绝，不打扰 Control。 */
function rejectCrossSite(route: Route): boolean {
  return !isSameSiteWrite(
    {
      origin: route.request.headers.get("origin"),
      secFetchSite: route.request.headers.get("sec-fetch-site"),
    },
    route.locals.reader.context.origin,
  );
}

async function formFields(request: Request): Promise<Record<string, unknown>> {
  try {
    return Object.fromEntries(await request.formData());
  } catch {
    return {};
  }
}

function loginReason(status: number): LoginError["reason"] {
  return status === 401
    ? "invalid-credentials"
    : status === 403
      ? "cross-site"
      : status === 422
        ? "invalid-input"
        : status === 429
          ? "rate-limited"
          : "unavailable";
}

function loginFailure(
  site: Site | null,
  returnTo: unknown,
  status: number,
  error: LoginError,
  retryAfter: number | null,
  setCookies: string[] = [],
): RouteResult {
  const headers: Record<string, string> = { ...uncached };
  if (retryAfter) headers["retry-after"] = String(retryAfter);
  return {
    view: {
      kind: "login",
      site,
      returnTo: safeReturnTo(returnTo),
      clearStale: false,
      error,
    },
    status,
    headers,
    setCookies,
  };
}

/** GET /_login?returnTo=：无脚本也能提交的登录页。非法 returnTo 回落首页。 */
export async function loginPageRoute(route: Route): Promise<RouteResult> {
  return {
    view: {
      kind: "login",
      site: await siteOf(route),
      returnTo: safeReturnTo(route.url.searchParams.get("returnTo")),
      clearStale: false,
    },
    status: 200,
    headers: { ...uncached },
  };
}

async function finish(
  route: Route,
  result: FormSessionResult,
  fields: Record<string, unknown> = {},
): Promise<RouteResult> {
  if (result.kind === "done")
    return redirect(result.redirectTo, result.setCookies);
  const site = await siteOf(route);
  if (result.kind === "invalid-return-to")
    return errorView(site, 422, noProblem);
  if (result.kind === "invalid-input")
    return loginFailure(
      site,
      fields.returnTo,
      422,
      loginErrorOf("invalid-input"),
      null,
    );
  return errorView(site, result.status, result.problem, {
    retryAfter: result.retryAfter,
    requestId: result.requestId,
    setCookies: result.setCookies,
  });
}

const loginErrorOf = (
  reason: LoginError["reason"],
  traceId: string | null = null,
  requestId: string | null = null,
): LoginError => ({ reason, traceId, requestId });

/** POST /_login（form-urlencoded: email, password, returnTo）。 */
export async function loginSubmitRoute(route: Route): Promise<RouteResult> {
  if (rejectCrossSite(route))
    return errorView(await siteOf(route), 403, noProblem);
  const fields = await formFields(route.request);
  const result = await submitLogin(route.locals.reader.session, fields);
  if (result.kind !== "failed") return finish(route, result, fields);
  return loginFailure(
    await siteOf(route),
    fields.returnTo,
    result.status,
    loginErrorOf(
      loginReason(result.status),
      result.problem.traceId,
      result.requestId,
    ),
    result.retryAfter,
    result.setCookies,
  );
}

/** POST /_logout：转发退出并带回清 Cookie，回登录页。 */
export async function logoutRoute(route: Route): Promise<RouteResult> {
  if (rejectCrossSite(route))
    return errorView(await siteOf(route), 403, noProblem);
  return finish(route, await submitLogout(route.locals.reader.session));
}

export function methodNotAllowed(allow: string): RouteResult {
  return {
    response: new Response(null, {
      status: 405,
      headers: { allow, ...uncached },
    }),
  };
}

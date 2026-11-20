import { test } from "node:test";
import assert from "node:assert/strict";
import { readPageRoute } from "../src-reader/app/routes/page-route.ts";
import { readSearchRoute } from "../src-reader/app/routes/search-route.ts";
import { createServices } from "../src-reader/app/services.ts";
import { buildForwardContext } from "../src-reader/shared/http/forward.ts";

const site = {
  name: "站",
  titleTemplate: null,
  robotsPolicy: null,
  locale: "zh-CN",
  spaces: [{ slug: "s", name: "S", navigation: [] }],
};
const page = {
  id: "p",
  path: "/s/a",
  title: "A",
  format: "markdown",
  content: "hi",
  seo: {},
  attachments: [],
  space: "s",
  spaceName: "S",
};
const prob = (status) => ({
  status,
  code: null,
  title: null,
  detail: null,
  traceId: "tr-1",
});

function route({
  outcome,
  siteOutcome = { kind: "site", site },
  cookie = "",
  path = "/s/a",
  search,
} = {}) {
  const headers = new Headers({
    host: "docs.example",
    "x-forwarded-proto": "https",
    referer: "https://g.example/q",
  });
  if (cookie) headers.set("cookie", cookie);
  const url = new URL(`https://docs.example${path}`);
  const context = buildForwardContext(headers, url, "1.1.1.1");
  const reader = {
    context,
    sites: { read: async () => siteOutcome },
    pages: { read: async () => outcome },
    search: { search: async () => search },
    events: { send: async () => {} },
  };
  const [space, ...rest] = path.split("?")[0].split("/").filter(Boolean);
  return {
    locals: { reader },
    url,
    request: new Request(url, { headers }),
    params: { space, page: rest.join("/") || undefined },
  };
}

test("200：渲染文章，匿名 public/no-cache，登记 pv", async () => {
  const r = route({ outcome: { kind: "page", page } });
  const result = await readPageRoute(r);
  assert.equal(result.status, 200);
  assert.equal(result.view.kind, "article");
  assert.equal(result.headers["cache-control"], "public, no-cache");
  assert.equal(result.headers.vary, "Cookie, Authorization");
  assert.deepEqual(r.locals.pageEvent, {
    kind: "pv",
    path: "/s/a",
    referrer: "g.example",
  });
});

test("200：带读者会话时 private，no-cache", async () => {
  const result = await readPageRoute(
    route({ outcome: { kind: "page", page }, cookie: "__Host-space_reader=x" }),
  );
  assert.equal(result.headers["cache-control"], "private, no-cache");
});

test("301/302 透传状态与 Location；303 交给浏览器；都不登记事件", async () => {
  for (const [outcome, status, location] of [
    [
      { kind: "redirect", status: 301, location: "https://p.example/s/a" },
      301,
      "https://p.example/s/a",
    ],
    [{ kind: "redirect", status: 302, location: "/s/first" }, 302, "/s/first"],
    [
      {
        kind: "attachment",
        location: "/api/content/spaces/s/content?snapshot=1&path=%2Fa.png",
      },
      303,
      "/api/content/spaces/s/content?snapshot=1&path=%2Fa.png",
    ],
  ]) {
    const r = route({ outcome });
    const { response } = await readPageRoute(r);
    assert.equal(response.status, status);
    assert.equal(response.headers.get("location"), location);
    assert.equal(r.locals.pageEvent, undefined);
  }
});

test("403 匿名 → 登录页（returnTo 为当前站内路径）；已登录 → 无权限页", async () => {
  const anon = await readPageRoute(
    route({
      outcome: { kind: "forbidden", problem: prob(403) },
      path: "/s/a?x=1",
    }),
  );
  assert.equal(anon.status, 403);
  assert.deepEqual(
    [anon.view.kind, anon.view.returnTo, anon.view.clearStale],
    ["login", "/s/a?x=1", false],
  );
  assert.equal(anon.headers["cache-control"], "no-store");
  const signed = await readPageRoute(
    route({
      outcome: { kind: "forbidden", problem: prob(403) },
      cookie: "__Host-space_reader=x",
    }),
  );
  assert.equal(signed.view.kind, "error");
  assert.equal(signed.status, 403);
});

test("401 → 登录页并要求清除旧会话", async () => {
  const result = await readPageRoute(
    route({ outcome: { kind: "unauthorized", problem: prob(401) } }),
  );
  assert.equal(result.status, 401);
  assert.equal(result.view.clearStale, true);
});

test("404 → 错误页含 traceId，登记 notfound；503 带 Retry-After，不登记", async () => {
  const missing = route({ outcome: { kind: "missing", problem: prob(404) } });
  const result = await readPageRoute(missing);
  assert.equal(result.status, 404);
  assert.equal(result.view.copy.traceId, "tr-1");
  assert.equal(missing.locals.pageEvent.kind, "notfound");
  const down = route({
    outcome: { kind: "unavailable", problem: prob(503), retryAfter: 4 },
  });
  const unavailable = await readPageRoute(down);
  assert.equal(unavailable.status, 503);
  assert.equal(unavailable.headers["retry-after"], "4");
  assert.equal(down.locals.pageEvent, undefined);
});

test("搜索路由：结果、下一页链接、失败", async () => {
  const hits = [
    { path: "/s/a", title: "A", spaceSlug: "s", spaceName: "S", snippet: "x" },
  ];
  const ok = await readSearchRoute(
    route({
      path: "/_search?q=hi",
      search: { kind: "results", query: "hi", hits, nextCursor: "c 2" },
    }),
  );
  assert.equal(ok.view.kind, "search");
  assert.equal(ok.view.nextHref, "/_search?q=hi&cursor=c+2");
  const down = await readSearchRoute(
    route({
      path: "/_search?q=hi",
      search: { kind: "unavailable", problem: prob(503), retryAfter: null },
    }),
  );
  assert.equal(down.status, 503);
});

test("createServices：装配出各 feature 仓储", () => {
  const services = createServices(
    buildForwardContext(new Headers(), new URL("http://d/")),
    { origin: "http://r" },
  );
  for (const key of ["sites", "pages", "search", "events"])
    assert.ok(services[key]);
});

test("搜索路由：范围与观测凭据传到视图，下一页保留范围", async () => {
  const seen = [];
  const hits = [
    { path: "/s/a", title: "A", spaceSlug: "s", spaceName: "S", snippet: "x" },
  ];
  const ctx = route({
    path: "/_search?q=hi&spaceSlug=s",
    search: {
      kind: "results",
      query: "hi",
      hits,
      nextCursor: "c2",
      trackingToken: "proof-1",
    },
  });
  const original = ctx.locals.reader.search.search;
  ctx.locals.reader.search.search = async (query) => (
    seen.push(query),
    original()
  );
  const result = await readSearchRoute(ctx);
  assert.equal(seen[0].spaceSlug, "s");
  assert.equal(result.view.scope, "s");
  assert.equal(result.view.proof, "proof-1");
  assert.equal(result.view.nextHref, "/_search?q=hi&cursor=c2&spaceSlug=s");
});

test("401 凭据过期 → 继续阅读视图；其余 401 仍是登录并清会话", async () => {
  const expired = await readPageRoute(
    route({
      outcome: {
        kind: "unauthorized",
        problem: { ...prob(401), code: "reader_access_expired" },
      },
      cookie: "__Host-space_reader=a",
      path: "/s/a?x=1",
    }),
  );
  assert.equal(expired.status, 401);
  assert.equal(expired.view.kind, "continue");
  assert.equal(expired.view.returnTo, "/s/a?x=1");
  assert.equal(expired.headers["cache-control"], "no-store");
  const invalid = await readPageRoute(
    route({
      outcome: {
        kind: "unauthorized",
        problem: { ...prob(401), code: "reader_session_invalid" },
      },
    }),
  );
  assert.equal(invalid.view.kind, "login");
  assert.equal(invalid.view.clearStale, true);
});

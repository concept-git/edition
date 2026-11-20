import { test } from "node:test";
import assert from "node:assert/strict";
import {
  loginPageRoute,
  loginSubmitRoute,
  logoutRoute,
} from "../src-reader/app/routes/session-route.ts";
import { applyView } from "../src-reader/app/views/apply.ts";
import { createServices } from "../src-reader/app/services.ts";
import { buildForwardContext } from "../src-reader/shared/http/forward.ts";

const site = {
  name: "站",
  titleTemplate: null,
  robotsPolicy: null,
  locale: "zh-CN",
  spaces: [],
};
const problem = (status, extra = {}, headers = {}) =>
  new Response(JSON.stringify({ status, traceId: "tr-9", ...extra }), {
    status,
    headers: { "content-type": "application/problem+json", ...headers },
  });

/** 假 fetch 记录上游请求；answer 决定响应。 */
function setup({ answer, headers = {}, body = {}, method = "POST", path = "/_login" } = {}) {
  const seen = [];
  const send = async (url, init) => {
    seen.push({ url: String(url), init });
    if (answer instanceof Error) throw answer;
    return answer;
  };
  const incoming = new Headers({
    host: "docs.example",
    "x-forwarded-proto": "https",
    origin: "https://docs.example",
    cookie: "__Host-space_reader=abc",
    ...headers,
  });
  const url = new URL(`https://docs.example${path}`);
  const context = buildForwardContext(incoming, url, "9.9.9.9");
  const services = createServices(context, {
    origin: "http://reader.internal",
    controlOrigin: "http://control.internal",
    fetch: async (u, i) =>
      String(u).startsWith("http://reader.internal")
        ? new Response(JSON.stringify(site), { status: 200 })
        : send(u, i),
  });
  const form = new URLSearchParams(body);
  const request = new Request(url, {
    method,
    headers: incoming,
    body: method === "GET" ? undefined : form,
  });
  return { seen, route: { locals: { reader: services }, url, request } };
}

const cookies = [
  "__Host-space_reader=new; Path=/; Secure; HttpOnly; SameSite=Lax",
  "__Host-space_reader_refresh=r; Path=/; Secure; HttpOnly; SameSite=Lax",
];
function created() {
  const headers = new Headers();
  for (const c of cookies) headers.append("set-cookie", c);
  return new Response(null, { status: 201, headers });
}

test("GET /_login：渲染登录页，非法 returnTo 回落首页", async () => {
  const { route } = setup({ method: "GET", path: "/_login?returnTo=//evil.example" });
  const result = await loginPageRoute(route);
  assert.equal(result.status, 200);
  assert.equal(result.view.kind, "login");
  assert.equal(result.view.returnTo, "/");
});

test("POST /_login 成功：原样转发两条 Set-Cookie，303 到站内 returnTo，头转发完整", async () => {
  const { route, seen } = setup({
    answer: created(),
    body: { email: " a@b.c ", password: "pw", returnTo: "/s/a?x=1" },
  });
  const { response } = await loginSubmitRoute(route);
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "/s/a?x=1");
  assert.deepEqual(response.headers.getSetCookie(), cookies);
  assert.equal(seen.length, 1);
  const { url, init } = seen[0];
  assert.equal(url, "http://control.internal/_auth/session");
  assert.equal(init.method, "POST");
  assert.deepEqual(JSON.parse(init.body), { email: "a@b.c", password: "pw" });
  const h = init.headers;
  assert.equal(h.origin, "https://docs.example");
  assert.equal(h.host, "docs.example");
  assert.equal(h["x-forwarded-host"], "docs.example");
  assert.equal(h["x-forwarded-proto"], "https");
  assert.equal(h["x-forwarded-for"], "9.9.9.9");
  assert.equal(h["content-type"], "application/json");
});

test("POST /_login：已有 X-Forwarded-For 时原样转发", async () => {
  const { route, seen } = setup({
    answer: created(),
    headers: { "x-forwarded-for": "5.5.5.5" },
    body: { email: "a@b.c", password: "pw" },
  });
  await loginSubmitRoute(route);
  assert.equal(seen[0].init.headers["x-forwarded-for"], "5.5.5.5");
});

test("POST /_login 失败：401/429/503 渲染登录页并保持状态码与 traceId", async () => {
  const body = { email: "a@b.c", password: "bad", returnTo: "/s" };
  const bad = await loginSubmitRoute(
    setup({ answer: problem(401, { code: "invalid_credentials" }), body }).route,
  );
  assert.equal(bad.status, 401);
  assert.equal(bad.view.kind, "login");
  assert.equal(bad.view.error.reason, "invalid-credentials");
  assert.equal(bad.view.error.traceId, "tr-9");
  assert.equal(bad.view.returnTo, "/s");

  const limited = await loginSubmitRoute(
    setup({ answer: problem(429, {}, { "retry-after": "30" }), body }).route,
  );
  assert.equal(limited.status, 429);
  assert.equal(limited.headers["retry-after"], "30");
  assert.equal(limited.view.error.reason, "rate-limited");

  const down = await loginSubmitRoute(
    setup({ answer: problem(503, {}, { "x-request-id": "rq-1" }), body }).route,
  );
  assert.equal(down.status, 503);
  assert.equal(down.view.error.reason, "unavailable");
  assert.equal(down.view.error.requestId, "rq-1");

  const unreachable = await loginSubmitRoute(
    setup({ answer: new Error("down"), body }).route,
  );
  assert.equal(unreachable.status, 503);

  const teapot = await loginSubmitRoute(
    setup({ answer: problem(502, {}), body }).route,
  );
  assert.equal(teapot.status, 502);
});

test("POST /_login：returnTo 站外 → 422 且不请求上游；空字段 → 422 登录页", async () => {
  for (const returnTo of ["https://evil.example/", "//evil.example", "javascript:1"]) {
    const { route, seen } = setup({
      answer: created(),
      body: { email: "a@b.c", password: "pw", returnTo },
    });
    const result = await loginSubmitRoute(route);
    assert.equal(result.status, 422);
    assert.equal(result.response, undefined);
    assert.equal(seen.length, 0);
  }
  const empty = setup({ answer: created(), body: { email: "", password: "" } });
  const result = await loginSubmitRoute(empty.route);
  assert.equal(result.status, 422);
  assert.equal(result.view.kind, "login");
  assert.equal(empty.seen.length, 0);
});

test("跨站表单 POST 被前端拒绝（Origin 不符、缺 Origin 且非 same-origin），不请求上游", async () => {
  for (const [headers, fn] of [
    [{ origin: "https://evil.example" }, loginSubmitRoute],
    [{ origin: "http://docs.example" }, logoutRoute],
  ]) {
    const { route, seen } = setup({ answer: created(), headers, body: { email: "a", password: "b" } });
    const result = await fn(route);
    assert.equal(result.status, 403);
    assert.equal(seen.length, 0);
  }
  // 缺 Origin：same-origin 放行，其它拒绝
  const missing = (site) => {
    const s = setup({ answer: created(), body: { email: "a@b.c", password: "pw" } });
    const headers = new Headers(s.route.request.headers);
    headers.delete("origin");
    if (site) headers.set("sec-fetch-site", site);
    s.route.request = new Request(s.route.url, { method: "POST", headers, body: new URLSearchParams({ email: "a@b.c", password: "pw" }) });
    return s;
  };
  assert.equal((await loginSubmitRoute(missing("cross-site").route)).status, 403);
  assert.equal((await loginSubmitRoute(missing(null).route)).status, 403);
  assert.equal((await loginSubmitRoute(missing("same-origin").route)).response.status, 303);
});

test("POST /_logout：DELETE 转发，转发清 Cookie，303 到 /_login；失败保持状态", async () => {
  const headers = new Headers();
  headers.append("set-cookie", "__Host-space_reader=; Max-Age=0; Path=/; Secure");
  const { route, seen } = setup({
    answer: new Response(null, { status: 204, headers }),
    path: "/_logout",
  });
  const { response } = await logoutRoute(route);
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "/_login");
  assert.equal(response.headers.getSetCookie().length, 1);
  assert.equal(seen[0].init.method, "DELETE");
  assert.equal(seen[0].url, "http://control.internal/_auth/session");
  assert.equal(seen[0].init.headers.origin, "https://docs.example");
  const down = await logoutRoute(
    setup({ answer: problem(503), path: "/_logout" }).route,
  );
  assert.equal(down.status, 503);
});

const clearCookies = [
  "__Host-space_reader=; Max-Age=0; Path=/; Secure; HttpOnly; SameSite=Lax",
  "__Host-space_reader_refresh=; Max-Age=0; Path=/; Secure; HttpOnly; SameSite=Lax",
];
function withCookies(response) {
  for (const c of clearCookies) response.headers.append("set-cookie", c);
  return response;
}
const applied = (result) => {
  const response = { status: undefined, headers: new Headers() };
  applyView(response, result);
  return response;
};

test("登录失败与退出失败的上游 Set-Cookie 同样转发；无 Cookie 时为空", async () => {
  const login = await loginSubmitRoute(
    setup({
      answer: withCookies(problem(401)),
      body: { email: "a@b.c", password: "bad" },
    }).route,
  );
  assert.equal(login.view.kind, "login");
  assert.deepEqual(applied(login).headers.getSetCookie(), clearCookies);

  const logout = await logoutRoute(
    setup({ answer: withCookies(problem(401)), path: "/_logout" }).route,
  );
  assert.equal(logout.status, 401);
  assert.deepEqual(applied(logout).headers.getSetCookie(), clearCookies);

});

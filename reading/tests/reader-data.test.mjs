import { test } from "node:test";
import assert from "node:assert/strict";
import { buildForwardContext } from "../src-reader/shared/http/forward.ts";
import { createReaderClient } from "../src-reader/shared/http/reader-client.ts";
import { createReaderSiteRepository } from "../src-reader/features/site/data/reader-site-repository.ts";
import { createReaderPageRepository } from "../src-reader/features/page-reading/data/reader-page-repository.ts";
import { createReaderEventsGateway } from "../src-reader/features/analytics/data/reader-events-gateway.ts";
import { createReaderSearchRepository } from "../src-reader/features/search/data/reader-search-repository.ts";
import { createHttpSessionGateway } from "../src-reader/features/reader-session/data/http-session-gateway.ts";

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
const problem = (status, extra = {}) =>
  json({ status, code: "x", traceId: "trace-9", ...extra }, status, {
    "content-type": "application/problem+json",
  });

function harness(respond) {
  const calls = [];
  const fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    if (respond instanceof Error) throw respond;
    return respond(String(url), init);
  };
  const incoming = new Headers({
    host: "reader:3000",
    "x-forwarded-host": "docs.example",
    "x-forwarded-proto": "https",
    "x-forwarded-for": "203.0.113.7",
    cookie: "a=1; __Host-space_reader=tok",
    authorization: "Bearer t",
  });
  const context = buildForwardContext(
    incoming,
    new URL("http://reader:3000/s/a"),
    "10.0.0.1",
  );
  return {
    calls,
    context,
    client: createReaderClient({ origin: "http://reader.internal", fetch }),
  };
}

test("转发上下文：Host、X-Forwarded-*、Cookie、Authorization、站点 Origin", () => {
  const { context } = harness(() => json({}));
  assert.equal(context.headers.host, "docs.example");
  assert.equal(context.headers["x-forwarded-host"], "docs.example");
  assert.equal(context.headers["x-forwarded-proto"], "https");
  assert.equal(context.headers["x-forwarded-for"], "203.0.113.7");
  assert.equal(context.headers.cookie, "a=1; __Host-space_reader=tok");
  assert.equal(context.headers.authorization, "Bearer t");
  assert.equal(context.origin, "https://docs.example");
  assert.equal(context.hasCredentials, true);
});

test("转发上下文：无上游 XFF 时用对端地址；无凭据；不信任无关 Cookie", () => {
  const context = buildForwardContext(
    new Headers({ host: "d.test", cookie: "theme=dark" }),
    new URL("http://d.test/"),
    "198.51.100.2",
  );
  assert.equal(context.headers["x-forwarded-for"], "198.51.100.2");
  assert.equal(context.origin, "http://d.test");
  assert.equal(context.hasCredentials, false);
});

test("site：请求头转发、响应映射、不安全 URL 被丢弃", async () => {
  const { calls, client, context } = harness(() =>
    json({
      name: "站",
      logo: "javascript:x",
      favicon: "/f.ico",
      primaryColor: "#123",
      locale: "zh-CN",
      spaces: [
        {
          slug: "s",
          name: "空间",
          navigation: [
            {
              label: "A",
              kind: "page",
              href: "javascript:y",
              pageId: "1",
              children: [],
            },
          ],
        },
      ],
    }),
  );
  const outcome = await createReaderSiteRepository(client, context).read();
  assert.equal(calls[0].url, "http://reader.internal/api/content/site");
  assert.equal(calls[0].init.headers.host, "docs.example");
  assert.equal(calls[0].init.headers.cookie, context.headers.cookie);
  assert.equal(calls[0].init.redirect, "manual");
  assert.equal(outcome.kind, "site");
  assert.equal(outcome.site.logo, null);
  assert.equal(outcome.site.favicon, "/f.ico");
  assert.equal(outcome.site.spaces[0].navigation[0].href, null);
});

test("site：401/404/503 与不可达映射为失败意图", async () => {
  for (const [status, kind] of [
    [401, "unauthorized"],
    [404, "missing"],
    [503, "unavailable"],
  ]) {
    const { client, context } = harness(() => problem(status));
    const outcome = await createReaderSiteRepository(client, context).read();
    assert.equal(outcome.kind, kind);
    assert.equal(outcome.problem.traceId, "trace-9");
  }
  const { client, context } = harness(new Error("ECONNREFUSED"));
  assert.equal(
    (await createReaderSiteRepository(client, context).read()).kind,
    "unavailable",
  );
});

test("pages：根与子路径地址、200 映射", async () => {
  const body = {
    id: "1",
    path: "/s/a b",
    title: "T",
    format: "markdown",
    content: "x",
    contentHash: "h",
    space: "s",
    spaceName: "S",
    snapshot: "n",
    seo: { title: "t", n: 1 },
    properties: {},
    attachments: [{ path: "a.png", sha256: "z" }],
    promotedAt: "2026-01-01T00:00:00Z",
    contentTypeDefinition: { definition: { renderHost: "browser" } },
    contentProfile: { contentType: "online-card", interpretation: { a: 1 } },
  };
  const { calls, client, context } = harness(() => json(body));
  const repo = createReaderPageRepository(client, context);
  const root = await repo.read("/");
  const page = await repo.read("/s/a b");
  assert.equal(calls[0].url, "http://reader.internal/api/content/pages");
  assert.equal(
    calls[1].url,
    "http://reader.internal/api/content/pages/s/a%20b",
  );
  assert.equal(page.kind, "page");
  assert.deepEqual(page.page.seo, { title: "t" });
  assert.deepEqual(page.page.attachments, [{ path: "a.png" }]);
  assert.equal(page.page.renderHost, "browser");
  assert.equal(page.page.contentType, "online-card");
  assert.deepEqual(page.page.interpretation, { a: 1 });
  assert.deepEqual(page.page.contentDefinition, {
    definition: { renderHost: "browser" },
  });
  assert.equal(root.kind, "page");
});

test("pages：301/302 透传 Location，303 为附件，401/403/404/503 为失败", async () => {
  const cases = [
    [
      () =>
        new Response(null, {
          status: 301,
          headers: { location: "https://p.example/s" },
        }),
      { kind: "redirect", status: 301, location: "https://p.example/s" },
    ],
    [
      () =>
        new Response(null, { status: 302, headers: { location: "/s/first" } }),
      { kind: "redirect", status: 302, location: "/s/first" },
    ],
    [
      () =>
        new Response(null, {
          status: 303,
          headers: {
            location: "/api/content/spaces/s/content?snapshot=1&path=%2Fa.png",
          },
        }),
      {
        kind: "attachment",
        location: "/api/content/spaces/s/content?snapshot=1&path=%2Fa.png",
      },
    ],
  ];
  for (const [respond, expected] of cases) {
    const { client, context } = harness(respond);
    assert.deepEqual(
      await createReaderPageRepository(client, context).read("/s/a"),
      expected,
    );
  }
  for (const [status, kind] of [
    [401, "unauthorized"],
    [403, "forbidden"],
    [404, "missing"],
    [503, "unavailable"],
  ]) {
    const { client, context } = harness(() => problem(status, {}));
    const outcome = await createReaderPageRepository(client, context).read(
      "/s/a",
    );
    assert.equal(outcome.kind, kind);
    assert.equal(outcome.problem.traceId, "trace-9");
  }
});

test("pages：503 带 Retry-After；缺 Location 的重定向与意外状态按不可用", async () => {
  let h = harness(
    () =>
      new Response(JSON.stringify({ traceId: "t" }), {
        status: 503,
        headers: { "retry-after": "5" },
      }),
  );
  const down = await createReaderPageRepository(h.client, h.context).read("/s");
  assert.equal(down.retryAfter, 5);
  for (const respond of [
    () => new Response(null, { status: 301 }),
    () => new Response(null, { status: 304 }),
    () => new Response("x", { status: 500 }),
  ]) {
    h = harness(respond);
    assert.equal(
      (await createReaderPageRepository(h.client, h.context).read("/s")).kind,
      "unavailable",
    );
  }
});

test("events：带站点 Origin、转发头与客户端地址；非 202 抛出", async () => {
  const { calls, client, context } = harness(
    () => new Response(null, { status: 202 }),
  );
  await createReaderEventsGateway(client, context).send({
    kind: "pv",
    path: "/s/a",
    referrer: "g.example",
  });
  const call = calls[0];
  assert.equal(call.url, "http://reader.internal/api/content/events");
  assert.equal(call.init.method, "POST");
  assert.equal(call.init.headers.origin, "https://docs.example");
  assert.equal(call.init.headers["x-forwarded-for"], "203.0.113.7");
  assert.equal(call.init.headers.host, "docs.example");
  assert.deepEqual(JSON.parse(call.init.body), {
    kind: "pv",
    path: "/s/a",
    referrer: "g.example",
  });
  const rejected = harness(() => problem(422));
  await assert.rejects(
    createReaderEventsGateway(rejected.client, rejected.context).send({
      kind: "notfound",
      path: "/x",
      referrer: null,
    }),
  );
  assert.deepEqual(JSON.parse(rejected.calls[0].init.body), {
    kind: "notfound",
    path: "/x",
  });
});

test("search：查询参数与映射", async () => {
  const { calls, client, context } = harness(() =>
    json({
      query: "q",
      nextCursor: "c2",
      hits: [
        {
          path: "/s/a",
          title: "T",
          spaceSlug: "s",
          spaceName: "S",
          snippet: "…",
        },
      ],
    }),
  );
  const outcome = await createReaderSearchRepository(client, context).search({
    q: "q",
    cursor: "c1",
  });
  const url = new URL(calls[0].url);
  assert.equal(url.pathname, "/api/content/search");
  assert.equal(url.searchParams.get("q"), "q");
  assert.equal(url.searchParams.get("cursor"), "c1");
  assert.equal(outcome.nextCursor, "c2");
  assert.equal(outcome.hits[0].spaceName, "S");
  const bad = harness(() => problem(422));
  assert.equal(
    (
      await createReaderSearchRepository(bad.client, bad.context).search({
        q: "q",
      })
    ).kind,
    "missing",
  );
});

test("会话网关：状态码映射与请求形态", async () => {
  const seen = [];
  const gateway = (status, headers) =>
    createHttpSessionGateway(
      async (url, init) => (
        seen.push({ url, init }),
        new Response(null, { status, headers })
      ),
    );
  assert.deepEqual(await gateway(201).open({ email: "a@b.c", password: "p" }), {
    ok: true,
  });
  assert.equal(seen[0].url, "/_auth/session");
  assert.equal(seen[0].init.method, "POST");
  assert.deepEqual(JSON.parse(seen[0].init.body), {
    email: "a@b.c",
    password: "p",
  });
  for (const [status, reason] of [
    [401, "invalid-credentials"],
    [403, "cross-site"],
    [422, "invalid-input"],
    [429, "rate-limited"],
    [500, "unavailable"],
  ])
    assert.equal(
      (
        await gateway(status, { "retry-after": "3" }).open({
          email: "a",
          password: "b",
        })
      ).reason,
      reason,
    );
  assert.equal(
    (
      await gateway(429, { "retry-after": "3" }).open({
        email: "a",
        password: "b",
      })
    ).retryAfter,
    3,
  );
  const offline = createHttpSessionGateway(async () => {
    throw new TypeError("offline");
  });
  assert.equal(
    (await offline.open({ email: "a", password: "b" })).reason,
    "unavailable",
  );
  await gateway(204).close();
  assert.equal(seen.at(-1).init.method, "DELETE");
  assert.equal(await gateway(204).refresh(), true);
  const renewed = await gateway(429, {
    "retry-after": "2",
    "x-request-id": "rid",
  }).renew();
  assert.deepEqual(renewed, { status: 429, retryAfter: 2, requestId: "rid" });
  assert.deepEqual(await gateway(204).renew(), {
    status: 204,
    retryAfter: null,
    requestId: null,
  });
  assert.deepEqual(await offline.renew(), {
    status: 0,
    retryAfter: null,
    requestId: null,
  });
  assert.equal(await offline.refresh(), false);
  assert.equal(seen.at(-1).url, "/_auth/session/refresh");
});

test("node 传输：保留 Host 头、不跟随重定向、204/304 无响应体", async () => {
  const { createServer } = await import("node:http");
  const { nodeFetch } =
    await import("../src-reader/shared/http/node-transport.ts");
  const seen = [];
  const server = createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      seen.push({ host: req.headers.host, method: req.method, body });
      if (req.url === "/moved")
        return res.writeHead(302, { location: "/x" }).end();
      if (req.url === "/same") return res.writeHead(304).end();
      res
        .writeHead(202, { "content-type": "application/json" })
        .end('{"ok":true}');
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const ok = await nodeFetch(`${base}/e`, {
      method: "POST",
      headers: { host: "docs.example" },
      body: '{"a":1}',
      signal: AbortSignal.timeout(2000),
    });
    assert.equal(ok.status, 202);
    assert.deepEqual(await ok.json(), { ok: true });
    assert.deepEqual(seen[0], {
      host: "docs.example",
      method: "POST",
      body: '{"a":1}',
    });
    const moved = await nodeFetch(`${base}/moved`, {});
    assert.equal(moved.status, 302);
    assert.equal(moved.headers.get("location"), "/x");
    assert.equal((await nodeFetch(`${base}/same`, {})).status, 304);
    await assert.rejects(
      nodeFetch("http://127.0.0.1:1/x", { signal: AbortSignal.timeout(2000) }),
    );
  } finally {
    server.close();
  }
});

test("pages：缺失或畸形的 contentProfile 映射为空解释", async () => {
  for (const contentProfile of [
    undefined,
    { interpretation: [1] },
    { contentType: 3 },
  ]) {
    const { client, context } = harness(() =>
      json({ path: "/s/a", contentProfile }),
    );
    const result = await createReaderPageRepository(client, context).read(
      "/s/a",
    );
    assert.equal(result.page.contentType, null);
    assert.deepEqual(result.page.interpretation, {});
    assert.equal(result.page.contentDefinition, null);
  }
});

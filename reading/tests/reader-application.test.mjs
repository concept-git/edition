import { test } from "node:test";
import assert from "node:assert/strict";
import { readArticle } from "../src-reader/features/page-reading/index.ts";
import {
  signIn,
  signOut,
} from "../src-reader/features/reader-session/index.ts";
import { recordEvent } from "../src-reader/features/analytics/index.ts";
import { searchSite } from "../src-reader/features/search/index.ts";

const problem = (status) => ({
  status,
  code: null,
  title: null,
  detail: null,
  traceId: "tr",
});
const nav = [
  { label: "A", kind: "page", pageId: "p1", href: "/s/a", children: [] },
  { label: "B", kind: "page", pageId: "p2", href: "/s/b", children: [] },
];
const site = {
  name: "站",
  titleTemplate: null,
  robotsPolicy: null,
  locale: "zh-CN",
  spaces: [{ slug: "s", name: "空间", navigation: nav }],
};
const page = {
  id: "p1",
  path: "/s/a",
  title: "A",
  format: "markdown",
  content: "# A\n\n正文 **粗**",
  seo: {},
  attachments: [],
  space: "s",
};
const sites = (outcome) => ({ read: async () => outcome });
const pages = (outcome) => ({ read: async () => outcome });
const run = (s, p) =>
  readArticle({
    sites: sites(s),
    pages: pages(p),
    path: "/s/a",
    origin: "https://d.test",
  });

test("readArticle：渲染正文，附带导航、顺序、SEO", async () => {
  const result = await run({ kind: "site", site }, { kind: "page", page });
  assert.equal(result.kind, "article");
  assert.match(result.body.html, /<strong>粗<\/strong>/);
  assert.doesNotMatch(result.body.html, /<h1>/);
  assert.equal(result.sequence.next.href, "/s/b");
  assert.equal(result.seo.canonical, "https://d.test/s/a");
  assert.equal(result.seo.title, "A | 站");
});

test("readArticle：重定向与附件原样交出；失败保留站点品牌", async () => {
  assert.deepEqual(
    await run(
      { kind: "site", site },
      { kind: "redirect", status: 301, location: "https://x/y" },
    ),
    { kind: "redirect", status: 301, location: "https://x/y" },
  );
  assert.equal(
    (
      await run(
        { kind: "site", site },
        { kind: "attachment", location: "/api/content/x" },
      )
    ).kind,
    "attachment",
  );
  const missing = await run(
    { kind: "site", site },
    { kind: "missing", problem: problem(404) },
  );
  assert.equal(missing.kind, "failure");
  assert.equal(missing.site, site);
});

test("readArticle：站点失败时页面成功也不渲染", async () => {
  const result = await run(
    { kind: "unavailable", problem: problem(503), retryAfter: 3 },
    { kind: "page", page },
  );
  assert.equal(result.kind, "failure");
  assert.equal(result.failure.kind, "unavailable");
  assert.equal(result.site, null);
});

test("signIn：校验输入、只接受站内 returnTo、透传失败原因", async () => {
  const calls = [];
  const ok = { open: async (c) => (calls.push(c), { ok: true }) };
  assert.deepEqual(
    await signIn(ok, { email: " a@b.c ", password: "x" }, "/docs/p"),
    { ok: true, redirectTo: "/docs/p" },
  );
  assert.deepEqual(calls[0], { email: "a@b.c", password: "x" });
  assert.equal(
    (await signIn(ok, { email: "a@b.c", password: "x" }, "https://evil.com"))
      .redirectTo,
    "/",
  );
  assert.equal(
    (await signIn(ok, { email: "a@b.c", password: "x" }, "//evil.com"))
      .redirectTo,
    "/",
  );
  assert.equal(
    (await signIn(ok, { email: "", password: "x" }, "/")).reason,
    "invalid-input",
  );
  assert.equal(calls.length, 3);
  const limited = {
    open: async () => ({ ok: false, reason: "rate-limited", retryAfter: 9 }),
  };
  assert.deepEqual(await signIn(limited, { email: "a", password: "b" }, "/"), {
    ok: false,
    reason: "rate-limited",
    retryAfter: 9,
  });
  await signOut({
    close: async () => {
      throw new Error("net");
    },
  });
});

test("recordEvent：失败不抛出", async () => {
  const event = { kind: "pv", path: "/s", referrer: null };
  assert.equal(await recordEvent({ send: async () => {} }, event), true);
  assert.equal(
    await recordEvent(
      {
        send: async () => {
          throw new Error("boom");
        },
      },
      event,
    ),
    false,
  );
  assert.equal(
    await recordEvent({ send: async () => assert.fail() }, null),
    false,
  );
});

test("searchSite：空查询不请求；结果过滤不安全链接；失败透传", async () => {
  let calls = 0;
  const repo = (outcome) => ({ search: async () => (calls++, outcome) });
  assert.deepEqual(await searchSite(repo(null), { q: "  " }), {
    kind: "results",
    query: "",
    hits: [],
    nextCursor: null,
    trackingToken: null,
  });
  assert.equal(calls, 0);
  const result = await searchSite(
    repo({
      kind: "results",
      query: "x",
      nextCursor: null,
      hits: [{ path: "/s/a" }, { path: "https://evil" }],
    }),
    { q: "x", spaceSlug: "  " },
  );
  assert.equal(result.hits.length, 1);
  assert.equal(
    (
      await searchSite(
        repo({ kind: "unavailable", problem: problem(503), retryAfter: null }),
        { q: "x" },
      )
    ).kind,
    "unavailable",
  );
});

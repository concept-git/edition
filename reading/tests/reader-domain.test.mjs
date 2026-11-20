import { test } from "node:test";
import assert from "node:assert/strict";
import {
  analyticsIdOf,
  languageOf,
  pageLinks,
  safeColor,
  sectionTrail,
  titleFor,
} from "../src-reader/features/site/index.ts";
import {
  buildSeo,
  summarize,
} from "../src-reader/features/page-reading/domain/seo.ts";
import { sequenceOf } from "../src-reader/features/page-reading/domain/sequence.ts";
import { canonicalPagePath } from "../src-reader/features/page-reading/index.ts";
import { safeReturnTo } from "../src-reader/features/reader-session/index.ts";
import {
  eventFor,
  referrerDomain,
} from "../src-reader/features/analytics/index.ts";
import {
  linkableHits,
  normalizeQuery,
} from "../src-reader/features/search/domain/search.ts";
import { describeFailure } from "../src-reader/features/error-pages/index.ts";
import { isSiteRelativePath, safeUrl } from "../src-reader/shared/url/paths.ts";

const node = (label, pageId, href, children = [], kind = "page") => ({
  label,
  kind,
  pageId,
  href,
  children,
});
const nav = [
  node(
    "入门",
    null,
    null,
    [node("安装", "a", "/s/install"), node("配置", "b", "/s/config")],
    "group",
  ),
  node("进阶", "c", "/s/adv"),
];
const site = {
  name: "站",
  titleTemplate: null,
  robotsPolicy: null,
  locale: "zh-CN",
  analyticsId: null,
  spaces: [],
};
const page = { path: "/s/install", title: "安装", seo: {} };

test("站内相对路径校验", () => {
  for (const ok of ["/", "/a/b?x=1#h"]) assert.ok(isSiteRelativePath(ok), ok);
  for (const bad of [
    "//evil.com",
    "/\\evil.com",
    "https://evil.com",
    "javascript:alert(1)",
    "a/b",
    "",
    "/a\nb",
    "/\\/x",
    null,
    5,
  ])
    assert.ok(!isSiteRelativePath(bad), String(bad));
  assert.equal(safeReturnTo("//evil.com"), "/");
  assert.equal(safeReturnTo("/docs/x?y=1"), "/docs/x?y=1");
  assert.equal(safeReturnTo(undefined, "/home"), "/home");
});

test("safeUrl 只放行站内相对与 http(s)", () => {
  assert.equal(safeUrl("/logo.svg"), "/logo.svg");
  assert.equal(
    safeUrl("https://cdn.example/a.png"),
    "https://cdn.example/a.png",
  );
  assert.equal(safeUrl("javascript:x"), null);
  assert.equal(safeUrl("data:image/png;base64,AA"), null);
  assert.equal(safeUrl(null), null);
});

test("品牌色、语言、GA4 id 白名单", () => {
  assert.equal(safeColor("#abc"), "#abc");
  assert.equal(safeColor("rgb(1,2,3)"), "rgb(1,2,3)");
  assert.equal(safeColor("red;} body{display:none"), "#2563eb");
  assert.equal(safeColor(null), "#2563eb");
  assert.equal(languageOf({ locale: "zh-CN" }), "zh-CN");
  assert.equal(languageOf({ locale: "fr" }), "en");
  assert.equal(analyticsIdOf({ analyticsId: "G-AB12" }), "G-AB12");
  assert.equal(analyticsIdOf({ analyticsId: "');alert(1);//" }), null);
});

test("标题模板：%s 替换；缺省为「标题 | 站点名」", () => {
  assert.equal(
    titleFor({ ...site, titleTemplate: "%s - 文档" }, "安装"),
    "安装 - 文档",
  );
  assert.equal(titleFor(site, "安装"), "安装 | 站");
});

test("导航：页面节点按文档顺序；上一页/下一页；分组轨迹", () => {
  assert.deepEqual(
    pageLinks(nav).map((n) => n.pageId),
    ["a", "b", "c"],
  );
  assert.deepEqual(sequenceOf(nav, "a"), {
    previous: null,
    next: { label: "配置", href: "/s/config" },
  });
  assert.deepEqual(sequenceOf(nav, "c").previous, {
    label: "配置",
    href: "/s/config",
  });
  assert.equal(sequenceOf(nav, "c").next, null);
  assert.deepEqual(sequenceOf(nav, "zzz"), { previous: null, next: null });
  assert.deepEqual(sectionTrail(nav, "b"), ["入门"]);
  assert.deepEqual(sectionTrail(nav, "c"), []);
  assert.equal(sectionTrail(nav, "zzz"), null);
});

test("SEO：title 模板、canonical、description、noindex", () => {
  const seo = buildSeo(
    site,
    {
      ...page,
      seo: {
        title: "自定义",
        description: "  说明 ",
        noIndex: "true",
        ogImage: "javascript:x",
      },
    },
    "正文",
    "https://docs.example",
  );
  assert.deepEqual(seo, {
    title: "自定义 | 站",
    description: "说明",
    keywords: null,
    canonical: "https://docs.example/s/install",
    noIndex: true,
    ogImage: null,
  });
  assert.equal(
    buildSeo(site, page, "正文", "https://x.test").description,
    "正文",
  );
  assert.equal(
    buildSeo({ ...site, robotsPolicy: "noindex" }, page, "", "https://x.test")
      .noIndex,
    true,
  );
  assert.equal(Array.from(summarize("字".repeat(300))).length, 160);
});

test("浏览路径 → 规范页面路径", () => {
  assert.equal(canonicalPagePath(undefined, undefined), "/");
  assert.equal(canonicalPagePath("docs", undefined), "/docs");
  assert.equal(canonicalPagePath("docs", "a/b/"), "/docs/a/b");
});

test("事件：pv 与 notfound 才上报；referrer 只留外站域名", () => {
  assert.deepEqual(
    eventFor("article", "/s/a", "https://g.example/q?x=1", "docs.example"),
    { kind: "pv", path: "/s/a", referrer: "g.example" },
  );
  assert.equal(
    eventFor("article", "/s/a", "https://docs.example/x", "docs.example")
      .referrer,
    null,
  );
  assert.equal(eventFor("missing", "/s/z", null, "h").kind, "notfound");
  assert.equal(eventFor("failure", "/s", null, "h"), null);
  assert.equal(referrerDomain("not a url", "h"), null);
});

test("搜索：查询规整与结果链接过滤", () => {
  assert.equal(normalizeQuery("  hi  "), "hi");
  assert.equal(Array.from(normalizeQuery("字".repeat(500))).length, 200);
  const hits = [{ path: "/a/b" }, { path: "https://evil" }, { path: "//evil" }];
  assert.deepEqual(linkableHits(hits), [{ path: "/a/b" }]);
});

test("错误文案：状态、traceId、Retry-After", () => {
  const problem = {
    status: 404,
    code: null,
    title: null,
    detail: null,
    traceId: "t-1",
  };
  assert.deepEqual(
    describeFailure({ kind: "missing", problem }, true).traceId,
    "t-1",
  );
  assert.equal(
    describeFailure({ kind: "missing", problem }, false).heading,
    "Page not found",
  );
  const down = describeFailure(
    { kind: "unavailable", problem, retryAfter: 7 },
    true,
  );
  assert.equal(down.status, 503);
  assert.equal(down.retryAfter, 7);
  assert.equal(
    describeFailure({ kind: "forbidden", problem }, true).status,
    403,
  );
});

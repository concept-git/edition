import * as cheerio from "cheerio";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  renderContent,
  renderHostOf,
} from "../src-reader/features/content-rendering/index.ts";

const base = { title: "T", path: "/docs/guide", attachments: [] };
const md = (content, extra = {}) =>
  renderContent({ ...base, format: "markdown", content, ...extra });

// 共享黄金样例：contracts/markdown-profile.md（与预览、Reader 机器表示同一份）。
const golden = readFileSync(
  new URL("../../contracts/markdown-profile.md", import.meta.url),
  "utf8",
);

test("黄金样例：GFM 表格、任务列表、删除线保留，脚本与危险属性被净化", () => {
  const { html } = md(golden, { title: "编辑能力验证" });
  assert.match(html, /<table>/);
  assert.match(html, /<th align="left">名称<\/th>/);
  assert.match(html, /<td align="right">已就绪<\/td>/);
  assert.match(html, /☑ 已完成/);
  assert.match(html, /☐ 待处理/);
  assert.match(html, /<del>旧内容<\/del>/);
  assert.match(html, /<strong>新内容<\/strong>/);
  assert.doesNotMatch(html, /<input/i);
  assert.doesNotMatch(html, /<script|alert\('unsafe'\)/i);
  assert.doesNotMatch(html, /javascript:|onclick/i);
  assert.match(html, /<a>危险链接<\/a>/);
  assert.doesNotMatch(
    html,
    /<h1>编辑能力验证/,
    "与页面标题相同的首个 h1 被去重",
  );
});

test("XSS：事件属性、危险协议、协议相对地址、iframe、style 均不放行", () => {
  const { html } = renderContent({
    ...base,
    format: "html",
    content: [
      '<img src="x" onerror="alert(1)">',
      '<img src="//evil.example/x.png">',
      '<img src="data:image/svg+xml,<svg onload=alert(1)>">',
      '<a href="  JaVaScRiPt:alert(1)">a</a>',
      '<a href="data:text/html;base64,AAAA">b</a>',
      '<a href="vbscript:x">c</a>',
      '<iframe src="https://evil.example"></iframe>',
      "<svg><script>alert(1)</script></svg>",
      '<p style="background:url(javascript:x)">d</p>',
      '<form action="/x"><input name="a"></form>',
      '<a href="https://ok.example/p" target="_blank" onmouseover="x">ok</a>',
    ].join(""),
  });
  assert.doesNotMatch(
    html,
    /onerror|onload|onmouseover|javascript|vbscript|data:|iframe|<svg|<script|style=|<form|<input|evil\.example|target=/i,
  );
  assert.match(html, /href="https:\/\/ok\.example\/p"/);
});

test("Markdown 内嵌 HTML 同样净化；代码块内容按文本转义", () => {
  const { html } = md(
    "```html\n<script>alert(1)</script>\n```\n\n<b onclick=x>粗</b>",
  );
  assert.match(
    html,
    /<code class="language-html">&lt;script&gt;alert\(1\)&lt;\/script&gt;/,
  );
  assert.match(html, /<b>粗<\/b>/);
  assert.doesNotMatch(html, /onclick/);
});

test("表格：单表头，缺列补齐、多列截断", () => {
  const { html } = md("| a | b |\n|---|---|\n| 1 |\n| 1 | 2 | 3 |\n");
  assert.equal((html.match(/<th[ >]/g) ?? []).length, 2);
  assert.equal((html.match(/<td[ >]/g) ?? []).length, 4);
  assert.doesNotMatch(html, /colspan/);
});

test("标题 id：h2/h3 生成目录，重复加序号，空文本为 section", () => {
  const { html, headings } = md("## 小节\n\n### 子 节\n\n## 小节\n\n## !!!\n");
  assert.deepEqual(
    headings.map((h) => [h.level, h.id]),
    [
      [2, "小节"],
      [3, "子-节"],
      [2, "小节-2"],
      [2, "section"],
    ],
  );
  assert.match(html, /<h2 id="小节-2">/);
});

test("附件引用重写为 /{space}/{path}；缺少 src 的 img 被丢弃", () => {
  const { html } = md("![x](a.png) [f](./b.pdf) ![y](javascript:x)", {
    attachments: [{ path: "a.png" }, { path: "b.pdf" }],
  });
  assert.match(html, /src="\/docs\/a\.png"/);
  assert.match(html, /href="\/docs\/b\.pdf"/);
  assert.doesNotMatch(html, /<img>|javascript/);
});

test("txt/json/xml 与浏览器宿主类型退化为转义原文", () => {
  for (const [format, renderHost] of [
    ["json", null],
    ["xml", null],
  ]) {
    const { html, hasPlugin } = renderContent({
      ...base,
      format,
      content: "<a>&",
      renderHost,
    });
    assert.equal(html, "<pre><code>&lt;a&gt;&amp;</code></pre>");
    assert.equal(hasPlugin, false);
  }
});

test("纯文本摘要不含标签", () => {
  assert.equal(md("**粗** 与 `码`").plainText.trim(), "粗 与 码");
});

const plugin = (extra) =>
  renderContent({ ...base, format: "json", content: "{}", ...extra });

test("浏览器类型：内置 json/json-schema/a2ui 输出稳定的插件宿主", () => {
  for (const contentType of ["json", "json-schema", "a2ui"]) {
    const result = plugin({ contentType, interpretation: { a: 1 } });
    assert.equal(result.hasPlugin, true);
    assert.deepEqual(result.headings, []);
    assert.equal(
      result.html,
      `<div data-content-plugin data-content-type="${contentType}" data-content-config="{&quot;a&quot;:1}"><pre data-content-source><code>{}</code></pre></div>`,
    );
  }
  assert.equal(plugin({ contentType: "json" }).plainText, "{}");
});

test("浏览器类型：转义原文与元数据，不允许脚本注入", () => {
  const source = '{"name":"</script><img src=x onerror=alert(1)>"}';
  const { html } = plugin({
    contentType: "json",
    content: source,
    interpretation: { schema: "' onclick='alert(1)\" onfocus=\"x" },
    definition: { versionRef: 'v"<1' },
  });
  assert.doesNotMatch(html, /<script|<img|<\/script/i);
  const host = cheerio.load(html)("div").get(0);
  assert.deepEqual(Object.keys(host.attribs), [
    "data-content-plugin",
    "data-content-type",
    "data-content-config",
    "data-content-definition",
  ]);
  assert.equal(
    JSON.parse(host.attribs["data-content-config"]).schema,
    "' onclick='alert(1)\" onfocus=\"x",
  );
  assert.match(html, /data-content-definition="\{&quot;versionRef&quot;/);
  assert.match(html, /&lt;\/script&gt;&lt;img src=x onerror=alert\(1\)&gt;/);
});

test("宿主：无解释配置为 {}，类型缺省取格式；无定义不带 definition 属性", () => {
  const { html } = renderContent({
    ...base,
    format: "json",
    content: "1",
    renderHost: "browser",
  });
  assert.match(html, /data-content-type="json" data-content-config="\{\}"/);
  assert.doesNotMatch(html, /data-content-definition/);
});

test("renderHostOf：显式值 > 冻结定义 > 内置类型表", () => {
  assert.equal(
    renderHostOf({ renderHost: "server", contentType: "json" }),
    "server",
  );
  assert.equal(renderHostOf({ renderHost: "browser" }), "browser");
  assert.equal(renderHostOf({ renderHost: "other" }), "server");
  const frozen = (renderHost) => ({ definition: { renderHost } });
  assert.equal(
    renderHostOf({ definition: frozen("browser"), contentType: "online-card" }),
    "browser",
  );
  assert.equal(
    renderHostOf({ definition: frozen("server"), contentType: "json" }),
    "server",
  );
  assert.equal(
    renderHostOf({ definition: frozen(1), contentType: "json" }),
    "browser",
  );
  assert.equal(renderHostOf({ contentType: "xml" }), "server");
  assert.equal(renderHostOf({ contentType: "markdown" }), "server");
  assert.equal(renderHostOf({}), "server");
});

test("在线登记类型使用冻结定义的浏览器宿主", () => {
  const definition = {
    versionRef: "ver-1",
    definition: { id: "online-card", renderHost: "browser" },
  };
  const { html } = plugin({
    contentType: "online-card",
    definition,
    interpretation: { display: { compact: true } },
  });
  assert.match(html, /data-content-type="online-card"/);
  const raw = /data-content-definition="([^"]*)"/.exec(html)[1];
  assert.deepEqual(JSON.parse(raw.replaceAll("&quot;", '"')), definition);
});

test("服务端类型（xml、markdown）不输出宿主", () => {
  const xml = renderContent({
    ...base,
    format: "xml",
    content: "<greeting>你好</greeting>",
    contentType: "xml",
  });
  assert.equal(xml.hasPlugin, false);
  assert.equal(
    xml.html,
    "<pre><code>&lt;greeting&gt;你好&lt;/greeting&gt;</code></pre>",
  );
});

test("格式名大小写不敏感（Reader 可能返回枚举名）", () => {
  assert.match(md("# A\n\nx", { format: "MARKDOWN" }).html, /<p>x<\/p>/);
  assert.match(
    renderContent({ ...base, format: "HTML", content: "<p>y</p>" }).html,
    /<p>y<\/p>/,
  );
});

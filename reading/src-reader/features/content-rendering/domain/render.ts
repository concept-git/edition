import * as cheerio from "cheerio";
import { Marked } from "marked";
import sanitizeHtml from "sanitize-html";

// 渲染配置：contracts/markdown-rendering.md；共享黄金样例 contracts/markdown-profile.md。
export interface RenderInput {
  format: string;
  content: string;
  title: string;
  /** 页面规范路径，如 /docs/guide/intro，用于重写附件地址。 */
  path: string;
  attachments: { path: string }[];
  /** 冻结的内容类型声明要求浏览器插件渲染时，退化为可读的原文。 */
  renderHost?: string | null;
  /** 内容类型 ID，如 json、json-schema、a2ui 或在线登记类型。 */
  contentType?: string | null;
  /** 页面解释配置，原样交给浏览器呈现组件。 */
  interpretation?: Record<string, unknown> | null;
  /** 冻结的内容类型定义快照（含 versionRef）；在线类型由它决定呈现组件。 */
  definition?: unknown;
}
export interface Heading {
  level: 2 | 3;
  text: string;
  id: string;
}
export interface RenderedContent {
  html: string;
  headings: Heading[];
  plainText: string;
  /** 正文含需要浏览器渐进增强的内容插件宿主。 */
  hasPlugin: boolean;
}

/** 内置内容类型中由浏览器呈现者；与 contracts/content-plugins.json 的 renderHost 一致。 */
const builtinBrowserTypes = new Set(["json", "json-schema", "a2ui"]);

export function renderHostOf(input: RenderInput): "browser" | "server" {
  if (input.renderHost)
    return input.renderHost === "browser" ? "browser" : "server";
  const frozen = (
    input.definition as { definition?: { renderHost?: unknown } } | null
  )?.definition?.renderHost;
  if (typeof frozen === "string")
    return frozen === "browser" ? "browser" : "server";
  return builtinBrowserTypes.has(input.contentType ?? "")
    ? "browser"
    : "server";
}

const markdown = new Marked({ gfm: true, breaks: false });
// 预览与阅读端输出静态 ☑ / ☐，不产生表单控件。
markdown.use({
  renderer: {
    checkbox: ({ checked }: { checked: boolean }) => (checked ? "☑ " : "☐ "),
  },
});

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    "a",
    "b",
    "blockquote",
    "br",
    "caption",
    "cite",
    "code",
    "col",
    "colgroup",
    "dd",
    "del",
    "div",
    "dl",
    "dt",
    "em",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "i",
    "img",
    "li",
    "ol",
    "p",
    "pre",
    "q",
    "small",
    "span",
    "strike",
    "strong",
    "sub",
    "sup",
    "table",
    "tbody",
    "td",
    "tfoot",
    "th",
    "thead",
    "tr",
    "u",
    "ul",
  ],
  allowedAttributes: {
    a: ["href", "title"],
    img: ["src", "alt", "title", "width", "height", "align"],
    blockquote: ["cite"],
    q: ["cite"],
    col: ["span", "width"],
    colgroup: ["span", "width"],
    ol: ["start", "type"],
    ul: ["type"],
    th: ["colspan", "rowspan", "align"],
    td: ["colspan", "rowspan", "align"],
    code: ["class"],
  },
  allowedClasses: { code: [/^language-[\w+#.-]+$/] },
  allowedSchemes: ["http", "https", "mailto", "ftp"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
  exclusiveFilter: (frame) => frame.tag === "img" && !frame.attribs.src,
};

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * 浏览器内容插件宿主：元数据只作为转义后的属性，原文保留为无脚本可读的回退。
 * DOM 契约见 frontend 的 entries/reader.ts：[data-content-plugin] 内含 [data-content-source]。
 */
function pluginHost(input: RenderInput): string {
  const attrs = [
    "data-content-plugin",
    `data-content-type="${escapeHtml(input.contentType || input.format)}"`,
    `data-content-config="${escapeHtml(JSON.stringify(input.interpretation ?? {}))}"`,
  ];
  if (input.definition)
    attrs.push(
      `data-content-definition="${escapeHtml(JSON.stringify(input.definition))}"`,
    );
  return `<div ${attrs.join(" ")}><pre data-content-source><code>${escapeHtml(input.content)}</code></pre></div>`;
}

function toHtml(input: RenderInput): string {
  switch (input.format.trim().toLowerCase()) {
    case "markdown":
      return markdown.parse(input.content, { async: false });
    case "html":
      return input.content;
    default:
      return sourceBlock(input.content);
  }
}

function sourceBlock(content: string): string {
  return `<pre><code>${escapeHtml(content)}</code></pre>`;
}

export function slugOf(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/(^-|-$)/g, "");
  return slug || "section";
}

/** 先净化，再做结构化后处理；输出只含白名单标签与属性。 */
export function renderContent(input: RenderInput): RenderedContent {
  if (renderHostOf(input) === "browser")
    return {
      html: pluginHost(input),
      headings: [],
      plainText: input.content,
      hasPlugin: true,
    };
  const clean = sanitizeHtml(toHtml(input), sanitizeOptions);
  const $ = cheerio.load(`<body>${clean}</body>`, null, false);
  const body = $.root();

  const first = body.children().first();
  if (first.is("h1") && first.text().trim() === input.title.trim())
    first.remove();

  const space = input.path.split("/")[1];
  if (space) {
    const rewrite = new Map<string, string>();
    for (const { path } of input.attachments) {
      const target = `/${space}/${path}`;
      rewrite.set(path, target);
      rewrite.set(`./${path}`, target);
    }
    for (const [selector, attribute] of [
      ["[src]", "src"],
      ["[href]", "href"],
    ])
      $(selector).each((_, element) => {
        const replacement = rewrite.get($(element).attr(attribute) ?? "");
        if (replacement) $(element).attr(attribute, replacement);
      });
  }

  const used = new Map<string, number>();
  const headings: Heading[] = [];
  $("h2, h3").each((_, element) => {
    const heading = $(element);
    const base = slugOf(heading.text());
    const count = (used.get(base) ?? 0) + 1;
    used.set(base, count);
    const id = count === 1 ? base : `${base}-${count}`;
    heading.attr("id", id);
    headings.push({
      level: element.tagName === "h2" ? 2 : 3,
      text: heading.text(),
      id,
    });
  });

  return {
    html: body.html() ?? "",
    headings,
    plainText: body.text(),
    hasPlugin: false,
  };
}

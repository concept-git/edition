import {
  A2uiSurface,
  basicCatalog,
  type LitComponentApi,
} from "@a2ui/lit/v0_9";
import {
  Catalog,
  MessageProcessor,
  A2uiMessageSchema,
  injectBasicCatalogStyles,
  setMarkdownRenderer,
  type A2uiMessage,
} from "@a2ui/web_core/v0_9";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { defineContentElement } from "../browser.ts";
import { emitContentEvent, type JsonValue } from "../types.ts";
import { ContentRenderElement } from "./base.ts";

export const A2UI_CATALOG_ID =
  "https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json";

// Basic Catalog body Text uses the official async MarkdownRenderer extension point.
setMarkdownRenderer(async (source, options) => {
  const html =
    options?.renderMode === "inline"
      ? marked.parseInline(source, { gfm: true, async: false })
      : marked.parse(source, { gfm: true, async: false });
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["form", "input", "button", "iframe", "style"],
    FORBID_ATTR: ["style"],
  });
});

export function parseA2uiArchive(source: string): A2uiMessage[] {
  const values: unknown = JSON.parse(source);
  if (!Array.isArray(values) || !values.length)
    throw new Error("A2UI 档案必须是非空初始化消息数组。");
  return values.map((value, index) => {
    const parsed = A2uiMessageSchema.safeParse(value);
    if (!parsed.success)
      throw new Error(`消息 ${index + 1}：${parsed.error.message}`);
    if (
      "createSurface" in parsed.data &&
      parsed.data.createSurface.catalogId !== A2UI_CATALOG_ID
    )
      throw new Error(
        `消息 ${index + 1}：只支持平台固定的 A2UI Basic Catalog。`,
      );
    return parsed.data;
  });
}

class A2uiRenderer extends ContentRenderElement {
  #processor?: { dispose: () => void };
  protected clear() {
    this.#processor?.dispose();
    this.#processor = undefined;
  }
  protected render() {
    const current = this.checkpoint();
    this.clear();
    if (
      this.config.protocolVersion &&
      this.config.protocolVersion !== "v0.9.1" &&
      this.config.protocolVersion !== "v0.9"
    )
      throw new Error("只支持 A2UI v0.9.1 协议。");
    if (this.config.catalogId && this.config.catalogId !== A2UI_CATALOG_ID)
      throw new Error("不支持此 A2UI Catalog。");
    const messages = parseA2uiArchive(this.value);
    // Preserve all official schemas/components, but host policy handles external side effects.
    const functions = [...basicCatalog.functions.values()].map((entry) =>
      entry.name === "openUrl"
        ? {
            ...entry,
            execute: () => {
              throw new Error("此内容视图不执行外部导航。");
            },
          }
        : entry,
    );
    const catalog = new Catalog<LitComponentApi>(
      basicCatalog.id,
      basicCatalog.protocolVersion,
      [...basicCatalog.components.values()],
      functions,
    );
    const processor = new MessageProcessor<LitComponentApi>(
      [catalog],
      (action) =>
        emitContentEvent(this, "content-action", {
          name: action.name,
          context: action.context as JsonValue,
        }),
      { version: "v0.9.1" },
    );
    this.#processor = processor;
    processor.processMessages(messages);
    const surfaces = processor.getSurfaces();
    if (!surfaces.size) throw new Error("初始化消息未创建可呈现的 Surface。");
    const body = this.content();
    injectBasicCatalogStyles(this.root);
    for (const surface of surfaces.values()) {
      if (!surface.componentsModel.get("root"))
        throw new Error(`Surface ${surface.id} 缺少 root 组件。`);
      surface.componentsModel.validateTopology({
        maxDepth: 64,
        allowOrphanComponents: true,
      });
      surface.onError.subscribe((error) => {
        if (!current()) return;
        // Component updates can fail after the initial Lit render. Keep escaped source
        // available even when the Reader has already removed its successful SSR fallback.
        this.failure(error.message);
        this.diagnostics([
          { severity: "error", code: error.code, message: error.message },
        ]);
      });
      const element = new A2uiSurface();
      element.surface = surface;
      body.append(element);
    }
    this.diagnostics([]);
  }
}
defineContentElement("space-a2ui-renderer", A2uiRenderer);

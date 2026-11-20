import { resolveView } from "./resolve-view.ts";
import type {
  ContentConfig,
  ContentDiagnostic,
  ContentViewElement,
} from "./types.ts";
import "./renderers/a2ui.ts";
import "./renderers/json.ts";
import "./renderers/markup.ts";
import "./renderers/schema.ts";
import "./renderers/text.ts";

/** 增强不可变的 SSR 快照；任何失败都保留其转义原文。DOM 契约见 ADR-0035 与 render.ts 的 pluginHost。 */
export function enhanceContentPlugins(scope: ParentNode = document): void {
  for (const host of scope.querySelectorAll<HTMLElement>(
    "[data-content-plugin]",
  )) {
    if (host.dataset.contentMounted) continue;
    const source = host.querySelector<HTMLElement>("[data-content-source]");
    if (!source) continue;
    let element: ContentViewElement | undefined;
    let notice: HTMLParagraphElement | undefined;
    let unavailable = false;
    const showSource = (message: string) => {
      source.hidden = false;
      notice ??= document.createElement("p");
      notice.setAttribute("role", "status");
      notice.textContent = message.slice(0, 2000);
      if (!notice.isConnected) host.append(notice);
    };
    try {
      const view = resolveView(
        host.dataset.contentType ?? "",
        host.dataset.contentDefinition,
      );
      if (!customElements.get(view.tagName))
        throw new Error("此内容呈现实现未包含在当前阅读端构建中。");
      const config: ContentConfig = JSON.parse(
        host.dataset.contentConfig ?? "{}",
      );
      element = document.createElement(view.tagName) as ContentViewElement;
      const diagnostics = (event: Event) => {
        if (unavailable) return;
        const items = (
          event as CustomEvent<{ diagnostics?: ContentDiagnostic[] }>
        ).detail?.diagnostics;
        if (!Array.isArray(items)) return;
        const errors = items.filter(
          (diagnostic) => diagnostic.severity === "error",
        );
        if (errors.length)
          showSource(errors.map((error) => error.message).join("\n"));
        else {
          // 保留原 SSR 节点，之后任一渲染器失败都能不依赖其实现地恢复原文。
          source.hidden = true;
          notice?.remove();
        }
      };
      const failure = (event: Event) => {
        unavailable = true;
        const reason = (event as CustomEvent<{ reason?: string }>).detail
          ?.reason;
        showSource(
          typeof reason === "string"
            ? reason
            : "内容呈现暂不可用，已保留原文。",
        );
        element?.removeEventListener("content-diagnostics", diagnostics);
        element?.removeEventListener("content-unavailable", failure);
        element?.remove();
      };
      // 监听器先于属性赋值与 connectedCallback，与 Control 宿主一致。
      element.addEventListener("content-diagnostics", diagnostics);
      element.addEventListener("content-unavailable", failure);
      element.readonly = true;
      element.config = { ...view.config, ...config };
      element.value = source.textContent ?? "";
      if (unavailable) continue;
      host.append(element);
      host.dataset.contentMounted = "true";
    } catch (error) {
      unavailable = true;
      element?.remove();
      showSource(
        error instanceof Error
          ? error.message
          : "内容呈现暂不可用，已保留原文。",
      );
    }
  }
}
enhanceContentPlugins();

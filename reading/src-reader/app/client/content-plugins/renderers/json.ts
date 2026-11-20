import "@alenaksu/json-viewer";
import { defineContentElement } from "../browser.ts";
import { ContentRenderElement } from "./base.ts";
import { validateJsonValue } from "../validation.ts";

class JsonRenderer extends ContentRenderElement {
  protected async render() {
    const current = this.checkpoint();
    const value: unknown = JSON.parse(this.value);
    const diagnostics = await validateJsonValue(
      value,
      this.config.schema === undefined || this.config.schema === null
        ? undefined
        : typeof this.config.schema === "string"
          ? this.config.schema
          : JSON.stringify(this.config.schema),
    );
    if (!current()) return;
    const body = this.content();
    const viewer = document.createElement("json-viewer") as HTMLElement & {
      data: unknown;
      expandAll: () => void;
    };
    viewer.style.cssText =
      "--background-color:transparent;--color:var(--foreground,#17202a);--font-family:var(--font-mono,monospace);--property-color:var(--foreground,#17202a);--string-color:var(--primary,#2458a6)";
    viewer.data = value;
    body.append(viewer);
    this.diagnostics(diagnostics);
  }
}
defineContentElement("space-json-renderer", JsonRenderer);

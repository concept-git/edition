import { defineContentElement } from "../browser.ts";
import { ContentRenderElement } from "./base.ts";

class TextRenderer extends ContentRenderElement {
  protected render() {
    const body = this.content();
    if (this.config.language === "xml") {
      const parsed = new DOMParser().parseFromString(
        this.value,
        "application/xml",
      );
      if (parsed.querySelector("parsererror"))
        this.diagnostics([{ severity: "error", message: "XML 语法无效。" }]);
      else this.diagnostics([]);
    } else this.diagnostics([]);
    const pre = document.createElement("pre");
    pre.textContent = this.value;
    body.append(pre);
  }
}
defineContentElement("space-text-renderer", TextRenderer);

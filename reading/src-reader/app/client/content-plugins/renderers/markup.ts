import { marked } from "marked";
import DOMPurify from "dompurify";
import { defineContentElement } from "../browser.ts";
import { ContentRenderElement } from "./base.ts";

class MarkupRenderer extends ContentRenderElement {
  protected render() {
    const html =
      this.config.codec === "html"
        ? this.value
        : marked.parse(this.value, { gfm: true, async: false });
    const body = this.content();
    body.innerHTML = DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: ["form", "input", "button", "iframe", "style"],
      FORBID_ATTR: ["style"],
    });
    for (const anchor of body.querySelectorAll("a"))
      anchor.setAttribute("rel", "noopener noreferrer");
    this.diagnostics([]);
  }
}
defineContentElement("space-markup-renderer", MarkupRenderer);

import { defineContentElement } from "../browser.ts";
import { validateJsonValue, validateSchemaDocument } from "../validation.ts";
import { ContentRenderElement } from "./base.ts";

class SchemaRenderer extends ContentRenderElement {
  protected async render() {
    const current = this.checkpoint();
    const schema: unknown = JSON.parse(this.value);
    const diagnostics = await validateSchemaDocument(schema);
    if (!current()) return;
    if (diagnostics.length) {
      this.diagnostics(diagnostics);
      const body = this.content();
      body.textContent = diagnostics
        .map((item) => `${item.path ?? ""}: ${item.message}`)
        .join("\n");
      body.setAttribute("role", "alert");
      return;
    }
    const body = this.content();
    const record =
      schema && typeof schema === "object"
        ? (schema as Record<string, unknown>)
        : {};
    const heading = document.createElement("h2");
    heading.textContent = String(record.title ?? "JSON Schema");
    body.append(heading);
    if (record.description) {
      const paragraph = document.createElement("p");
      paragraph.textContent = String(record.description);
      body.append(paragraph);
    }
    const properties =
      record.properties && typeof record.properties === "object"
        ? (record.properties as Record<string, Record<string, unknown>>)
        : {};
    const required = Array.isArray(record.required) ? record.required : [];
    const table = document.createElement("table");
    const header = table.createTHead().insertRow();
    for (const label of ["字段", "类型", "必填", "约束 / 说明"]) {
      const cell = document.createElement("th");
      cell.textContent = label;
      header.append(cell);
    }
    for (const [name, property] of Object.entries(properties)) {
      const row = table.insertRow();
      for (const text of [
        name,
        property && typeof property === "object"
          ? String(property.type ?? (property.$ref ? "$ref" : "任意"))
          : String(property),
        required.includes(name) ? "是" : "否",
        JSON.stringify(property),
      ])
        row.insertCell().textContent = text;
    }
    if (Object.keys(properties).length) body.append(table);
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = "完整模式结构";
    const pre = document.createElement("pre");
    pre.textContent = JSON.stringify(schema, null, 2);
    details.append(summary, pre);
    body.append(details);
    const label = document.createElement("label");
    label.textContent = "验证样例 JSON";
    const sample = document.createElement("textarea");
    sample.setAttribute("aria-label", "验证样例 JSON");
    sample.rows = 8;
    sample.style.cssText =
      "display:block;width:100%;box-sizing:border-box;margin:.5rem 0";
    sample.value =
      typeof this.config.sample === "string" ? this.config.sample : "{}";
    label.append(sample);
    body.append(label);
    const button = document.createElement("button");
    button.textContent = "验证样例";
    const result = document.createElement("p");
    result.setAttribute("role", "status");
    button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        const errors = await validateJsonValue(
          JSON.parse(sample.value),
          this.value,
        );
        if (!current()) return;
        result.textContent = errors.length
          ? errors
              .map((error) => `${error.path ?? ""}: ${error.message}`)
              .join("\n")
          : "样例符合此 JSON Schema。";
        this.diagnostics(errors);
      } catch (error) {
        result.textContent =
          error instanceof Error ? error.message : String(error);
        this.diagnostics([{ severity: "error", message: result.textContent }]);
      } finally {
        button.disabled = false;
      }
    });
    body.append(button, result);
    this.diagnostics([]);
  }
}
defineContentElement("space-schema-renderer", SchemaRenderer);

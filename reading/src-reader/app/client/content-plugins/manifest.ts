import type {
  PluginManifest,
  ContentDiagnostic,
  ViewContribution,
} from "./types.ts";

export function validateManifest(value: unknown): ContentDiagnostic[] {
  const diagnostics: ContentDiagnostic[] = [];
  const error = (message: string, path: string) =>
    diagnostics.push({ severity: "error", message, path });
  if (!value || typeof value !== "object")
    return [{ severity: "error", message: "插件声明必须是对象。" }];
  const manifest = value as Partial<PluginManifest>;
  for (const key of ["id", "name", "version"] as const) {
    if (typeof manifest[key] !== "string" || !manifest[key]?.trim())
      error(`缺少 ${key}。`, `/${key}`);
  }
  if (manifest.apiVersion !== 1) error("只支持 apiVersion: 1。", "/apiVersion");
  if (
    !Array.isArray(manifest.contentTypes) ||
    !manifest.contentTypes.length ||
    manifest.contentTypes.some(
      (type) => typeof type !== "string" || !type.trim(),
    )
  )
    error("contentTypes 必须是非空字符串列表。", "/contentTypes");
  for (const kind of ["editors", "renderers"] as const) {
    const views = manifest[kind];
    if (!Array.isArray(views)) {
      error(`${kind} 必须是列表。`, `/${kind}`);
      continue;
    }
    const ids = new Set<string>();
    for (const [index, raw] of views.entries()) {
      const view = raw as Partial<ViewContribution> | null;
      const path = `/${kind}/${index}`;
      if (!view || typeof view !== "object") {
        error("视图声明必须是对象。", path);
        continue;
      }
      if (typeof view.id !== "string" || !view.id.trim() || ids.has(view.id))
        error("视图 id 为空或重复。", `${path}/id`);
      if (view.id) ids.add(view.id);
      if (typeof view.label !== "string" || !view.label.trim())
        error("视图必须有 label。", `${path}/label`);
      if (
        typeof view.tagName !== "string" ||
        !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)+$/.test(view.tagName)
      )
        error("tagName 必须是带连字符的自定义元素名。", `${path}/tagName`);
      if (
        !Array.isArray(view.contentTypes) ||
        !view.contentTypes.length ||
        view.contentTypes.some((type) => !manifest.contentTypes?.includes(type))
      )
        error(
          "视图 contentTypes 必须是插件支持类型的非空子集。",
          `${path}/contentTypes`,
        );
    }
  }
  return diagnostics;
}

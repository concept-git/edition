import descriptor from "./content-plugins.json" with { type: "json" };
import type { ContentTypeDefinition, PluginManifest } from "./types.ts";

// content-plugins.json 是 contracts/content-plugins.json 的随构建副本（Docker 构建上下文只含 reading）；
// tests/reader-content-plugins.test.mjs 断言两者逐字节一致。
export interface ContentPluginDescriptor {
  manifest: PluginManifest;
  editorEntry?: string;
  rendererEntry?: string;
}
export const contentPluginDescriptors =
  descriptor.plugins as unknown as ContentPluginDescriptor[];
export const contentTypes: Record<string, ContentTypeDefinition> =
  Object.fromEntries(
    (descriptor.types as unknown as ContentTypeDefinition[]).map((type) => [
      type.id,
      type,
    ]),
  );

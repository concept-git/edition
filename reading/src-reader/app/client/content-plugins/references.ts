import { contentPluginDescriptors } from "./catalog.ts";
import type {
  ContentTypeContribution,
  ViewContribution,
  ViewKind,
} from "./types.ts";

/** Resolve metadata only. The caller supplies the already built loader or registered element. */
export function trustedContribution(
  reference: ContentTypeContribution,
  kind: ViewKind,
): ViewContribution {
  const plugin = contentPluginDescriptors.find(
    ({ manifest }) =>
      manifest.id === reference.pluginId &&
      manifest.version === reference.pluginVersion,
  );
  const view = plugin?.manifest[
    kind === "editor" ? "editors" : "renderers"
  ].find((view) => view.id === reference.contributionId);
  if (!view)
    throw new Error(
      `未知受信贡献：${reference.pluginId}@${reference.pluginVersion}/${reference.contributionId}`,
    );
  return { ...view, config: { ...view.config, ...reference.config } };
}

import { contentPluginDescriptors, contentTypes } from "./catalog.ts";
import { trustedContribution } from "./references.ts";
import type { ContentTypeSnapshot, ViewContribution } from "./types.ts";

export const unavailableMessage = "内容呈现定义不可用，已保留原文。";

/** 宿主属性解析出的呈现贡献；不可用时抛出可直接展示的中文原因。 */
export function resolveView(
  type: string,
  definitionAttribute: string | undefined,
): ViewContribution {
  const snapshot: ContentTypeSnapshot | undefined = definitionAttribute
    ? JSON.parse(definitionAttribute)
    : undefined;
  const descriptor = snapshot?.definition ?? contentTypes[type];
  const reference = snapshot?.definition.renderers[0];
  const view = reference
    ? trustedContribution(reference, "renderer")
    : !snapshot && descriptor?.renderHost === "browser"
      ? contentPluginDescriptors
          .flatMap((plugin) => plugin.manifest.renderers)
          .find((candidate) => candidate.contentTypes.includes(type))
      : undefined;
  if (descriptor?.renderHost !== "browser" || !view)
    throw new Error(unavailableMessage);
  return view;
}

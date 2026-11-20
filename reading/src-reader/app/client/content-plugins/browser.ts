export * from "./types.ts";
export { validateManifest } from "./manifest.ts";

/** Register once; a second implementation must use a distinct, versioned tag. */
export function defineContentElement(
  tagName: string,
  constructor: CustomElementConstructor,
): void {
  const existing = customElements.get(tagName);
  if (existing && existing !== constructor)
    throw new Error(`Custom element already registered: ${tagName}`);
  if (!existing) customElements.define(tagName, constructor);
}

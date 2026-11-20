/** Public, framework-independent API for content plugin packages. */
export const CONTENT_PLUGIN_API_VERSION = 1 as const;
/** Extensible semantic type ID; persisted content selects a registered immutable definition version. */
export type ContentTypeId = string;
export const CONTENT_FORMATS = [
  "markdown",
  "html",
  "txt",
  "json",
  "xml",
] as const;
export type ContentFormat = (typeof CONTENT_FORMATS)[number];
export type SourceLanguage =
  "markdown" | "html" | "plain" | "json" | "xml" | "javascript" | "typescript";
export type JsonValue =
  null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
export type ContentConfig = Record<string, JsonValue>;
export type ViewKind = "editor" | "renderer";

/** Persisted references select only contributions from the trusted build registry. */
export interface ContentTypeContribution {
  pluginId: string;
  pluginVersion: string;
  contributionId: string;
  config: ContentConfig;
}
export interface ContentTypeDefinition {
  id: string;
  version: string;
  label: string;
  format: ContentFormat;
  mediaType: string;
  language: SourceLanguage;
  renderHost: "server" | "browser";
  defaultInterpretation: ContentConfig;
  validation?: {
    encoding: "text" | "json";
    schemaRef?: string;
    instanceSchemaPointer?: string;
  };
  schemaResources: Record<string, string>;
  editors: ContentTypeContribution[];
  renderers: ContentTypeContribution[];
}
export interface ContentTypeSnapshot {
  versionRef: string;
  digest: string;
  definition: ContentTypeDefinition;
}

export interface ContentDiagnostic {
  severity: "error" | "warning" | "info";
  message: string;
  path?: string;
  code?: string;
}
export interface ViewContribution {
  id: string;
  label: string;
  tagName: string;
  contentTypes: string[];
  config?: ContentConfig;
}
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  apiVersion: typeof CONTENT_PLUGIN_API_VERSION;
  contentTypes: string[];
  editors: ViewContribution[];
  renderers: ViewContribution[];
  description?: string;
}
export interface ContentFixture {
  /** Optional readiness assertion used by the browser fixture runner. */
  expectedText?: string;
  id: string;
  label: string;
  contentType: string;
  value: string;
  config?: ContentConfig;
}
export interface ContentArtifact {
  id: string;
  manifest: PluginManifest;
  /** Standalone browser ESM, produced by the workbench or the package build. */
  code: string;
  files?: Record<string, string>;
  fixtures: ContentFixture[];
  diagnostics: ContentDiagnostic[];
  createdAt: string;
  sourceHash: string;
}
export interface ContentServices {
  uploadImage?: (file: File) => Promise<string>;
  resolveImage?: (path: string) => Promise<string> | string;
}
export interface ContentViewInput {
  value: string;
  readonly: boolean;
  config?: ContentConfig;
  /** Trusted local host capabilities; never included in sandbox messages. */
  services?: ContentServices;
}
export interface ContentViewElement extends HTMLElement {
  value: string;
  readonly: boolean;
  config: ContentConfig;
  services?: ContentServices;
}
export interface ContentViewEvents {
  "content-change": { value: string };
  "content-diagnostics": { diagnostics: ContentDiagnostic[] };
  "content-unavailable": { reason: string; retryable?: boolean };
  "content-action": { name: string; context?: JsonValue };
}
export interface ContentViewHandlers {
  onchange?: (value: string) => void;
  ondiagnostics?: (diagnostics: ContentDiagnostic[]) => void;
  onunavailable?: (reason: string, retryable?: boolean) => void;
  onaction?: (name: string, context?: JsonValue) => void;
}
export interface PluginDefinition {
  manifest: PluginManifest;
  loadEditor?: () => Promise<unknown>;
  loadRenderer?: () => Promise<unknown>;
  fixtures?: ContentFixture[];
}
export interface RegisteredView {
  pluginId: string;
  kind: ViewKind;
  contribution: ViewContribution;
}
export interface MountedContentView {
  element: ContentViewElement;
  update: (input: ContentViewInput) => void;
  dispose: () => void;
}

export function emitContentEvent<K extends keyof ContentViewEvents>(
  target: HTMLElement,
  type: K,
  detail: ContentViewEvents[K],
): void {
  target.dispatchEvent(
    new CustomEvent(type, { detail, bubbles: true, composed: true }),
  );
}

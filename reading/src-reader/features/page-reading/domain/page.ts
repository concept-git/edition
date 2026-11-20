import type { ReadFailure } from "../../../shared/problem.ts";

export interface PageData {
  id: string;
  path: string;
  title: string;
  format: string;
  content: string;
  contentHash: string;
  space: string;
  spaceName: string;
  snapshot: string;
  seo: Record<string, string>;
  properties: Record<string, string>;
  attachments: { path: string }[];
  promotedAt: string | null;
  /** 冻结内容类型声明的渲染宿主；"browser" 需要浏览器插件。 */
  renderHost: string | null;
  contentType: string | null;
  interpretation: Record<string, unknown>;
  /** 冻结的内容类型快照（versionRef + definition），原样传给呈现层。 */
  contentDefinition: unknown;
}

export type PageOutcome =
  | { kind: "page"; page: PageData }
  | { kind: "redirect"; status: 301 | 302; location: string }
  | { kind: "attachment"; location: string }
  | ReadFailure;

/** 仓储契约：由 data 层实现，app 注入。 */
export interface PageRepository {
  read(path: string): Promise<PageOutcome>;
}

/** 浏览器路径 → Reader 规范页面路径；根为 "/"。 */
export function canonicalPagePath(
  space: string | undefined,
  rest: string | undefined,
): string {
  if (!space) return "/";
  const tail = (rest ?? "").replace(/^\/+|\/+$/g, "");
  return tail ? `/${space}/${tail}` : `/${space}`;
}

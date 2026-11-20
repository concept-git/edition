import type { ReadFailure } from "../../../shared/problem.ts";

export interface NavNode {
  label: string;
  kind: string;
  href: string | null;
  pageId: string | null;
  children: NavNode[];
}
export interface SpaceInfo {
  slug: string;
  name: string;
  navigation: NavNode[];
}
export interface Site {
  name: string;
  logo: string | null;
  favicon: string | null;
  primaryColor: string | null;
  locale: string | null;
  titleTemplate: string | null;
  analyticsId: string | null;
  robotsPolicy: string | null;
  primaryHost: string | null;
  home: string | null;
  spaces: SpaceInfo[];
}

export type SiteOutcome = { kind: "site"; site: Site } | ReadFailure;

/** 仓储契约：由 data 层实现，app 注入。 */
export interface SiteRepository {
  read(): Promise<SiteOutcome>;
}

const colorPattern =
  /^(?:#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})|(?:rgb|hsl)a?\([^;{}]+\))$/;
const ga4Pattern = /^G-[A-Z0-9-]+$/;
export const defaultPrimaryColor = "#2563eb";

/** 品牌色只接受十六进制与 rgb/hsl，防止注入任意 CSS。 */
export function safeColor(value: string | null | undefined): string {
  const color = value?.trim();
  return color && colorPattern.test(color) ? color : defaultPrimaryColor;
}

export function analyticsIdOf(site: Site): string | null {
  const id = site.analyticsId?.trim();
  return id && ga4Pattern.test(id) ? id : null;
}

export function languageOf(site: Pick<Site, "locale">): "zh-CN" | "en" {
  return site.locale?.toLowerCase() === "zh-cn" ? "zh-CN" : "en";
}

export function findSpace(site: Site, slug: string): SpaceInfo | undefined {
  return site.spaces.find((space) => space.slug === slug);
}

/** 站点是否对当前主体声明禁止索引。 */
export function siteNoIndex(site: Site): boolean {
  return site.robotsPolicy === "noindex";
}

export function titleFor(site: Site, pageTitle: string): string {
  const template = site.titleTemplate?.trim();
  return template
    ? template.replaceAll("%s", pageTitle)
    : `${pageTitle} | ${site.name}`;
}

/** 导航树中带页面的节点，按文档顺序展开。 */
export function pageLinks(nodes: NavNode[]): NavNode[] {
  return nodes.flatMap((node) => [
    ...(node.pageId ? [node] : []),
    ...pageLinks(node.children),
  ]);
}

/** 当前页面所在的分组标题链。 */
export function sectionTrail(
  nodes: NavNode[],
  pageId: string,
): string[] | null {
  for (const node of nodes) {
    if (node.pageId === pageId) return [];
    const inner = sectionTrail(node.children, pageId);
    if (inner) return node.kind === "group" ? [node.label, ...inner] : inner;
  }
  return null;
}

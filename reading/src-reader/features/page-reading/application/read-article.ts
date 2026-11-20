import type { RenderedContent } from "../../content-rendering/index.ts";
import { renderContent } from "../../content-rendering/index.ts";
import type {
  NavNode,
  Site,
  SiteRepository,
  SpaceInfo,
} from "../../site/index.ts";
import { findSpace, sectionTrail } from "../../site/index.ts";
import type { ReadFailure } from "../../../shared/problem.ts";
import type { PageData, PageRepository } from "../domain/page.ts";
import { buildSeo, type Seo } from "../domain/seo.ts";
import { sequenceOf, type Sequence } from "../domain/sequence.ts";

export type ArticleResult =
  | {
      kind: "article";
      site: Site;
      space: SpaceInfo | null;
      page: PageData;
      body: RenderedContent;
      sequence: Sequence;
      trail: string[];
      seo: Seo;
      navigation: NavNode[];
    }
  | { kind: "redirect"; status: 301 | 302; location: string }
  | { kind: "attachment"; location: string }
  /** site 可能为 null：站点本身读取失败时没有品牌可用。 */
  | { kind: "failure"; failure: ReadFailure; site: Site | null };

/** 一次阅读：并行取站点与页面，成功时渲染正文并算出导航、顺序与 SEO。 */
export async function readArticle(input: {
  sites: SiteRepository;
  pages: PageRepository;
  path: string;
  origin: string;
}): Promise<ArticleResult> {
  const [siteOutcome, pageOutcome] = await Promise.all([
    input.sites.read(),
    input.pages.read(input.path),
  ]);
  const site = siteOutcome.kind === "site" ? siteOutcome.site : null;
  if (pageOutcome.kind === "redirect" || pageOutcome.kind === "attachment")
    return pageOutcome;
  if (pageOutcome.kind !== "page")
    return { kind: "failure", failure: pageOutcome, site };
  if (siteOutcome.kind !== "site")
    return { kind: "failure", failure: siteOutcome, site: null };

  const { page } = pageOutcome;
  const body = renderContent({
    format: page.format,
    content: page.content,
    title: page.title,
    path: page.path,
    attachments: page.attachments,
    renderHost: page.renderHost,
    contentType: page.contentType,
    interpretation: page.interpretation,
    definition: page.contentDefinition,
  });
  const space = findSpace(siteOutcome.site, page.space) ?? null;
  const navigation = space?.navigation ?? [];
  return {
    kind: "article",
    site: siteOutcome.site,
    space,
    page,
    body,
    sequence: sequenceOf(navigation, page.id),
    trail: sectionTrail(navigation, page.id) ?? [],
    seo: buildSeo(siteOutcome.site, page, body.plainText, input.origin),
    navigation,
  };
}

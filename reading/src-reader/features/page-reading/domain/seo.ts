import type { Site } from "../../site/index.ts";
import { siteNoIndex, titleFor } from "../../site/index.ts";
import { safeUrl } from "../../../shared/url/paths.ts";
import type { PageData } from "./page.ts";

export interface Seo {
  title: string;
  description: string;
  keywords: string | null;
  canonical: string;
  noIndex: boolean;
  ogImage: string | null;
}

const text = (value: string | undefined | null) => value?.trim() || null;

export function summarize(plain: string, limit = 160): string {
  const flat = plain.replace(/\s+/g, " ").trim();
  const points = Array.from(flat);
  return points.length <= limit ? flat : points.slice(0, limit).join("");
}

export function buildSeo(
  site: Site,
  page: PageData,
  plainText: string,
  origin: string,
): Seo {
  const pageTitle = text(page.seo.title) ?? page.title;
  return {
    title: titleFor(site, pageTitle),
    description: text(page.seo.description) ?? summarize(plainText),
    keywords: text(page.seo.keywords),
    canonical: new URL(page.path, origin).href,
    noIndex: page.seo.noIndex === "true" || siteNoIndex(site),
    ogImage: safeUrl(text(page.seo.ogImage)),
  };
}

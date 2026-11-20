// page-reading 的公开契约。
export type { PageData, PageOutcome, PageRepository } from "./domain/page.ts";
export { canonicalPagePath } from "./domain/page.ts";
export type { ArticleResult } from "./application/read-article.ts";
export { readArticle } from "./application/read-article.ts";

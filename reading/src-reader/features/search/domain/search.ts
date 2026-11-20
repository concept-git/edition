import type { ReadFailure } from "../../../shared/problem.ts";
import { isSiteRelativePath } from "../../../shared/url/paths.ts";

export interface SearchHit {
  path: string;
  title: string;
  spaceSlug: string;
  spaceName: string;
  snippet: string;
}
export type SearchOutcome =
  | {
      kind: "results";
      query: string;
      hits: SearchHit[];
      nextCursor: string | null;
      /** 搜索观测凭据（search-events 的 proof）；续页没有。 */
      trackingToken: string | null;
    }
  | ReadFailure;

export interface SearchQuery {
  q: string;
  cursor?: string | null;
  spaceSlug?: string | null;
}

/** 仓储契约：Reader 的 GET /api/content/search。 */
export interface SearchRepository {
  search(query: SearchQuery): Promise<SearchOutcome>;
}

export const maxQueryLength = 200;

/** 范围为空白时视为全站。 */
export function normalizeScope(
  value: string | null | undefined,
): string | null {
  const slug = value?.trim();
  return slug ? slug : null;
}
export function normalizeQuery(value: string | null | undefined): string {
  return Array.from((value ?? "").trim())
    .slice(0, maxQueryLength)
    .join("");
}

/** 结果链接必须是站内相对路径，其余丢弃。 */
export function linkableHits(hits: SearchHit[]): SearchHit[] {
  return hits.filter((hit) => isSiteRelativePath(hit.path));
}

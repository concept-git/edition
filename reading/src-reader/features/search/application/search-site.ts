import type {
  SearchOutcome,
  SearchQuery,
  SearchRepository,
} from "../domain/search.ts";
import {
  linkableHits,
  normalizeQuery,
  normalizeScope,
} from "../domain/search.ts";

/** 空查询不打扰 Reader；结果只保留可安全链接的命中。 */
export async function searchSite(
  repository: SearchRepository,
  query: SearchQuery,
): Promise<SearchOutcome> {
  const q = normalizeQuery(query.q);
  if (!q)
    return {
      kind: "results",
      query: "",
      hits: [],
      nextCursor: null,
      trackingToken: null,
    };
  const outcome = await repository.search({
    ...query,
    q,
    spaceSlug: normalizeScope(query.spaceSlug),
  });
  return outcome.kind === "results"
    ? { ...outcome, hits: linkableHits(outcome.hits) }
    : outcome;
}

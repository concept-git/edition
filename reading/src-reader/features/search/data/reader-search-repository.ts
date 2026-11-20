import { failureFrom, unreachable } from "../../../shared/http/failure.ts";
import type { ForwardContext } from "../../../shared/http/forward.ts";
import type { ReaderClient } from "../../../shared/http/reader-client.ts";
import type {
  SearchOutcome,
  SearchQuery,
  SearchRepository,
} from "../domain/search.ts";

const str = (value: unknown) => (typeof value === "string" ? value : "");

export function createReaderSearchRepository(
  client: ReaderClient,
  context: ForwardContext,
): SearchRepository {
  return {
    async search(query: SearchQuery): Promise<SearchOutcome> {
      try {
        // Reader 要求 spaceSlug 与 snapshot 成对出现：范围搜索先取该空间当前快照。
        let snapshot: string | undefined;
        if (query.spaceSlug) {
          const mount = await client.get(
            `/api/content/spaces/${encodeURIComponent(query.spaceSlug)}/snapshot`,
            context,
          );
          if (mount.status !== 200) return await failureFrom(mount);
          snapshot = str(((await mount.json()) as any)?.snapshot);
        }
        const response = await client.get("/api/content/search", context, {
          q: query.q,
          limit: "10",
          cursor: query.cursor ?? undefined,
          spaceSlug: query.spaceSlug ?? undefined,
          snapshot,
        });
        if (response.status !== 200) return await failureFrom(response);
        const body: any = await response.json();
        return {
          kind: "results",
          query: str(body?.query) || query.q,
          trackingToken: str(body?.trackingToken) || null,
          nextCursor:
            typeof body?.nextCursor === "string" && body.nextCursor
              ? body.nextCursor
              : null,
          hits: Array.isArray(body?.hits)
            ? body.hits.map((hit: any) => ({
                path: str(hit?.path),
                title: str(hit?.title),
                spaceSlug: str(hit?.spaceSlug),
                spaceName: str(hit?.spaceName),
                snippet: str(hit?.snippet),
              }))
            : [],
        };
      } catch (error) {
        const failure = unreachable(error);
        if (failure) return failure;
        throw error;
      }
    },
  };
}

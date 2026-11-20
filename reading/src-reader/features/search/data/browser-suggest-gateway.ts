import {
  readProblem,
  retryAfterSeconds,
} from "../../../shared/http/problem-response.ts";
import type { FetchLike } from "../../../shared/http/reader-client.ts";
import type {
  SearchTracker,
  SuggestGateway,
  SuggestHit,
  SuggestOutcome,
} from "../domain/suggest.ts";
import { suggestLimit } from "../domain/suggest.ts";

const text = (value: unknown) => (typeof value === "string" ? value : "");

async function failed(response: Response): Promise<SuggestOutcome> {
  const problem = await readProblem(response);
  return {
    kind: "failed",
    status: response.status,
    traceId: problem.traceId,
    retryAfter: retryAfterSeconds(response),
  };
}

/** 浏览器端即时建议：范围搜索先取并缓存该空间快照（Reader 要求两者成对）。 */
export function createBrowserSuggestGateway(send: FetchLike): SuggestGateway {
  const snapshots = new Map<string, string>();
  const init = (signal: AbortSignal): RequestInit => ({
    signal,
    headers: { accept: "application/json" },
    cache: "no-store",
    credentials: "same-origin",
  });
  return {
    async suggest(request, signal) {
      const params = new URLSearchParams({
        q: request.q,
        limit: String(suggestLimit),
      });
      if (request.spaceSlug) {
        let snapshot = snapshots.get(request.spaceSlug);
        if (!snapshot) {
          const mount = await send(
            `/api/content/spaces/${encodeURIComponent(request.spaceSlug)}/snapshot`,
            init(signal),
          );
          if (!mount.ok) return failed(mount);
          snapshot = text(((await mount.json()) as any)?.snapshot);
          snapshots.set(request.spaceSlug, snapshot);
        }
        params.set("spaceSlug", request.spaceSlug);
        params.set("snapshot", snapshot);
      }
      const response = await send(
        `/api/content/search?${params}`,
        init(signal),
      );
      if (!response.ok) {
        // 切版（409）或快照无效（422）：丢弃缓存，下次重新取。
        if (response.status === 409 || response.status === 422)
          snapshots.delete(request.spaceSlug ?? "");
        return failed(response);
      }
      const body: any = await response.json();
      if (!Array.isArray(body?.hits))
        throw new Error("Invalid search response");
      return {
        kind: "results",
        trackingToken: text(body.trackingToken) || null,
        hits: body.hits.map((hit: any): SuggestHit => ({
          path: text(hit?.path),
          title: text(hit?.title),
          spaceName: text(hit?.spaceName),
          snippet: text(hit?.snippet),
        })),
      };
    },
  };
}

export function createBrowserTracker(send: FetchLike): SearchTracker {
  return {
    track(kind, proof, path) {
      if (!proof) return;
      void send("/api/content/search-events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, proof, path }),
        keepalive: true,
        credentials: "same-origin",
      }).catch(() => {});
    },
  };
}

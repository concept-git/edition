import { isSiteRelativePath } from "../../../shared/url/paths.ts";
import { maxQueryLength } from "./search.ts";

export const minSuggestLength = 2;
export const suggestLimit = 8;

export interface SuggestHit {
  path: string;
  title: string;
  spaceName: string;
  snippet: string;
}

export type SuggestOutcome =
  | { kind: "results"; hits: SuggestHit[]; trackingToken: string | null }
  | {
      kind: "failed";
      status: number;
      traceId: string | null;
      retryAfter: number | null;
    };

export interface SuggestRequest {
  q: string;
  /** 空表示全站。 */
  spaceSlug: string | null;
}

/** 仓储契约：浏览器端的即时建议（Reader 的 GET /api/content/search）。 */
export interface SuggestGateway {
  suggest(
    request: SuggestRequest,
    signal: AbortSignal,
  ): Promise<SuggestOutcome>;
}

/** 搜索观测（POST /api/content/search-events）；尽力而为，不抛出。 */
export interface SearchTracker {
  track(kind: "click" | "observable", proof: string, path: string | null): void;
}

export const queryLength = (value: string) => Array.from(value).length;
export const isTooLong = (value: string) => queryLength(value) > maxQueryLength;
export const isSearchable = (value: string) =>
  queryLength(value) >= minSuggestLength;

export const safeHits = (hits: SuggestHit[]) =>
  hits.filter((hit) => isSiteRelativePath(hit.path));

export function allResultsHref(
  query: string,
  spaceSlug: string | null,
): string {
  const params = new URLSearchParams({ q: query });
  if (spaceSlug) params.set("spaceSlug", spaceSlug);
  return `/_search?${params}`;
}

export interface Segment {
  text: string;
  mark: boolean;
}

const entities: Record<string, string> = {
  "&lt;": "<",
  "&gt;": ">",
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
};

/** 摘要只保留 <mark> 高亮，其余标签丢弃、实体还原为文本；调用方只用 textContent 渲染。 */
export function snippetSegments(html: string): Segment[] {
  const segments: Segment[] = [];
  let mark = false;
  for (const part of html.split(/(<[^>]*>)/)) {
    if (!part) continue;
    if (part.startsWith("<")) {
      if (/^<mark(\s[^>]*)?>$/i.test(part)) mark = true;
      else if (/^<\/mark\s*>$/i.test(part)) mark = false;
      continue;
    }
    const text = part.replace(/&(?:lt|gt|amp|quot|#39);/g, (e) => entities[e]);
    if (text) segments.push({ text, mark });
  }
  return segments;
}

export interface SuggestMessages {
  loading: string;
  empty: string;
  error: string;
  retry: string;
  all: string;
  tooLong: string;
  results: (count: number) => string;
}

export function suggestMessages(zh: boolean): SuggestMessages {
  return zh
    ? {
        loading: "正在搜索…",
        empty: "未找到匹配内容。",
        error: "搜索暂时不可用。",
        retry: "重试搜索",
        all: "查看全部结果",
        tooLong: "搜索词最多 200 个字符。",
        results: (count) => `显示 ${count} 条推荐结果`,
      }
    : {
        loading: "Searching…",
        empty: "No results found.",
        error: "Search is temporarily unavailable.",
        retry: "Retry search",
        all: "View all results",
        tooLong: "Use at most 200 characters.",
        results: (count) => `${count} suggested results`,
      };
}

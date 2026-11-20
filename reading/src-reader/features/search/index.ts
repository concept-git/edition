// search 的公开契约。
export type {
  SearchHit,
  SearchOutcome,
  SearchQuery,
  SearchRepository,
} from "./domain/search.ts";
export { searchSite } from "./application/search-site.ts";
export type {
  SearchTracker,
  Segment,
  SuggestGateway,
  SuggestHit,
  SuggestMessages,
  SuggestOutcome,
  SuggestRequest,
} from "./domain/suggest.ts";
export { snippetSegments, suggestMessages } from "./domain/suggest.ts";
export type {
  Scheduler,
  SuggestPhase,
  SuggestState,
} from "./application/suggest.ts";
export { createSuggest } from "./application/suggest.ts";

import { nodeFetch } from "../shared/http/node-transport.ts";
import { createControlSessionGateway } from "../features/reader-session/data/control-session-gateway.ts";
import type { UpstreamSessionGateway } from "../features/reader-session/index.ts";
import { createReaderEventsGateway } from "../features/analytics/data/reader-events-gateway.ts";
import type { EventGateway } from "../features/analytics/index.ts";
import type { PageRepository } from "../features/page-reading/index.ts";
import { createReaderPageRepository } from "../features/page-reading/data/reader-page-repository.ts";
import { createReaderSearchRepository } from "../features/search/data/reader-search-repository.ts";
import type { SearchRepository } from "../features/search/index.ts";
import { createReaderSiteRepository } from "../features/site/data/reader-site-repository.ts";
import type { SiteRepository } from "../features/site/index.ts";
import type { ForwardContext } from "../shared/http/forward.ts";
import {
  createReaderClient,
  type FetchLike,
} from "../shared/http/reader-client.ts";

export interface ReaderServices {
  context: ForwardContext;
  sites: SiteRepository;
  pages: PageRepository;
  search: SearchRepository;
  events: EventGateway;
  session: UpstreamSessionGateway;
}

/** 依赖装配：把 data 层实现注入各 feature 的仓储契约。 */
export function createServices(
  context: ForwardContext,
  options: { origin: string; controlOrigin?: string; fetch?: FetchLike },
): ReaderServices {
  const send = options.fetch ?? nodeFetch;
  const client = createReaderClient({ fetch: send, origin: options.origin });
  return {
    context,
    sites: createReaderSiteRepository(client, context),
    pages: createReaderPageRepository(client, context),
    search: createReaderSearchRepository(client, context),
    events: createReaderEventsGateway(client, context),
    session: createControlSessionGateway(
      send,
      options.controlOrigin ?? "http://127.0.0.1:8081",
      context,
    ),
  };
}

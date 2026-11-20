import type { ForwardContext } from "../../../shared/http/forward.ts";
import type { ReaderClient } from "../../../shared/http/reader-client.ts";
import type { EventGateway, PageEvent } from "../domain/event.ts";

/**
 * POST /api/content/events：Origin 为站点 Origin，其余转发头（含客户端地址）原样带上。
 * Reader 会重新判定路径，前端不能自行断言；非 202 视为未记录并抛出，由用例吞掉。
 */
export function createReaderEventsGateway(
  client: ReaderClient,
  context: ForwardContext,
): EventGateway {
  return {
    async send(event: PageEvent) {
      const response = await client.post(
        "/api/content/events",
        context,
        {
          kind: event.kind,
          path: event.path,
          ...(event.referrer ? { referrer: event.referrer } : {}),
        },
        { origin: context.origin },
      );
      if (response.status !== 202)
        throw new Error(`events rejected: ${response.status}`);
    },
  };
}

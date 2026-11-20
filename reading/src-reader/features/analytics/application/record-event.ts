import type { EventGateway, PageEvent } from "../domain/event.ts";

/** 上报浏览事件；任何失败都不得影响页面，返回是否被接受。 */
export async function recordEvent(
  gateway: EventGateway,
  event: PageEvent | null,
): Promise<boolean> {
  if (!event) return false;
  try {
    await gateway.send(event);
    return true;
  } catch {
    return false;
  }
}

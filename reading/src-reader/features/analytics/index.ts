// analytics 的公开契约。
export type { EventGateway, PageEvent } from "./domain/event.ts";
export { eventFor, referrerDomain } from "./domain/event.ts";
export { recordEvent } from "./application/record-event.ts";

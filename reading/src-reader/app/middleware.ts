import { defineMiddleware } from "astro:middleware";
import { recordEvent } from "../features/analytics/index.ts";
import { buildForwardContext } from "../shared/http/forward.ts";
import { controlOrigin, readerOrigin } from "./config.ts";
import { createServices } from "./services.ts";

export const onRequest = defineMiddleware(async (context, next) => {
  let peer: string | null = null;
  try {
    peer = context.clientAddress;
  } catch {
    // 无对端地址（预渲染等）：不带客户端地址。
  }
  const forward = buildForwardContext(
    context.request.headers,
    context.url,
    peer,
  );
  context.locals.reader = createServices(forward, {
    origin: readerOrigin(),
    controlOrigin: controlOrigin(),
  });
  const response = await next();
  // 响应已生成后再上报；不等待，失败由用例吞掉，不影响页面。
  if (context.locals.pageEvent)
    void recordEvent(context.locals.reader.events, context.locals.pageEvent);
  return response;
});

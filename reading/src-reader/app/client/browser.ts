// 浏览器端装配：把 data 层网关与续期用例接到页面脚本。只在客户端脚本中引用。
import { createHttpSessionGateway } from "../../features/reader-session/data/http-session-gateway.ts";
import {
  createRenewer,
  type Lock,
  withRenewal,
} from "../../features/reader-session/index.ts";
import {
  createBrowserSuggestGateway,
  createBrowserTracker,
} from "../../features/search/data/browser-suggest-gateway.ts";

const send = (input: string | URL, init?: RequestInit) => fetch(input, init);

/** 跨标签串行续期；没有 Web Locks 时退化为页内合并。 */
const webLock: Lock = (run) =>
  typeof navigator !== "undefined" && navigator.locks
    ? navigator.locks.request("edition-content-refresh", run)
    : run();

export const renewer = createRenewer({
  gateway: createHttpSessionGateway(),
  lock: webLock,
});

export const loginHref = () =>
  `/_login?returnTo=${encodeURIComponent(location.pathname + location.search)}`;

/** 读取请求：凭据过期时自动续期并重试。 */
export const readerSend = withRenewal(send, renewer, () =>
  location.assign(loginHref()),
);

export const suggestGateway = createBrowserSuggestGateway(readerSend);
export const tracker = createBrowserTracker(send);

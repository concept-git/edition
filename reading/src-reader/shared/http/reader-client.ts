import type { ForwardContext } from "./forward.ts";

export type FetchLike = (
  input: string | URL,
  init?: RequestInit,
) => Promise<Response>;

/** Reader 无法联系或超时。数据层把它映射为 unavailable。 */
export class UpstreamUnreachable extends Error {}

export interface ReaderClient {
  get(
    path: string,
    context: ForwardContext,
    query?: Record<string, string | undefined>,
  ): Promise<Response>;
  post(
    path: string,
    context: ForwardContext,
    body: unknown,
    extraHeaders?: Record<string, string>,
  ): Promise<Response>;
}

export function createReaderClient(options: {
  origin: string;
  fetch?: FetchLike;
  timeoutMs?: number;
}): ReaderClient {
  const send = options.fetch ?? ((input, init) => fetch(input, init));
  const timeout = options.timeoutMs ?? 10000;
  async function call(url: URL, init: RequestInit) {
    try {
      return await send(url, {
        ...init,
        redirect: "manual",
        cache: "no-store",
        signal: AbortSignal.timeout(timeout),
      });
    } catch (error) {
      throw new UpstreamUnreachable("Reader unreachable", { cause: error });
    }
  }
  return {
    get(path, context, query = {}) {
      const url = new URL(path, options.origin);
      for (const [key, value] of Object.entries(query))
        if (value !== undefined) url.searchParams.set(key, value);
      return call(url, {
        method: "GET",
        headers: { accept: "application/json", ...context.headers },
      });
    },
    post(path, context, body, extraHeaders = {}) {
      return call(new URL(path, options.origin), {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          ...context.headers,
          ...extraHeaders,
        },
        body: JSON.stringify(body),
      });
    },
  };
}

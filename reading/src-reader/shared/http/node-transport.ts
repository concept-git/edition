import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import type { FetchLike } from "./reader-client.ts";

const nullBodyStatuses = new Set([101, 204, 205, 304]);

/**
 * 基于 node:http 的传输：保留调用方设置的 Host 头。
 * 全局 fetch（undici）会丢弃 Host，而 Reader 需要站点 Host 才能选站点。
 * 不跟随重定向，响应体整体读入内存（Reader 的页面与站点 JSON 都很小）。
 */
export const nodeFetch: FetchLike = (input, init = {}) =>
  new Promise((resolve, reject) => {
    const url = new URL(input);
    const send = url.protocol === "https:" ? httpsRequest : httpRequest;
    const headers = new Headers(init.headers);
    const request = send(
      url,
      { method: init.method ?? "GET", headers: Object.fromEntries(headers) },
      (response) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk: Buffer) => chunks.push(chunk));
        response.on("error", reject);
        response.on("end", () => {
          const responseHeaders = new Headers();
          for (const [name, value] of Object.entries(response.headers))
            for (const item of Array.isArray(value) ? value : [value])
              if (item !== undefined) responseHeaders.append(name, item);
          const status = response.statusCode ?? 502;
          resolve(
            new Response(
              nullBodyStatuses.has(status) ? null : Buffer.concat(chunks),
              { status, headers: responseHeaders },
            ),
          );
        });
      },
    );
    request.on("error", reject);
    init.signal?.addEventListener(
      "abort",
      () => request.destroy(init.signal?.reason),
      { once: true },
    );
    if (init.signal?.aborted) request.destroy(init.signal.reason);
    request.end(typeof init.body === "string" ? init.body : undefined);
  });

import node from "@astrojs/node";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";

// 通用阅读前端（ADR-0035）：SSR 部署档位。静态博客仍用 astro.config.ts。
// 路由与源码在 src-reader/（srcDir 不同，两个档位的 pages 互不干扰）。
export default defineConfig({
  srcDir: "./src-reader",
  outDir: "./dist-reader",
  publicDir: "./public-reader",
  output: "server",
  adapter: node({ mode: "standalone" }),
  trailingSlash: "never",
  // 内置 checkOrigin 以 Astro 所见 URL 为准，TLS 终止在边缘时会误拒；
  // 同域表单 POST 的 Origin / Sec-Fetch-Site 校验由 session-route 自己做。
  security: { checkOrigin: false },
  vite: {
    resolve: {
      // 内容插件脚本由 astro build 打包并带 hash；@hyperjump/browser 的浏览器入口须显式指定（仅精确匹配）。
      alias: [
        {
          find: /^@hyperjump\/browser$/,
          replacement: fileURLToPath(
            new URL(
              "./node_modules/@hyperjump/browser/lib/index.browser.js",
              import.meta.url,
            ),
          ),
        },
      ],
    },
  },
  integrations: [
    {
      name: "reader-search-route",
      hooks: {
        "astro:config:setup": ({ injectRoute }) => {
          // 以下划线开头的文件不会被 pages/ 扫描，故显式注入 /_search、/_login、/_logout。
          for (const [pattern, entry] of [
            ["/_search", "search"],
            ["/_login", "login"],
            ["/_logout", "logout"],
          ])
            injectRoute({
              pattern,
              entrypoint: `./src-reader/app/entries/${entry}.astro`,
            });
        },
      },
    },
  ],
});

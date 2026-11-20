import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import { rehypeHeadingIds, unified } from "@astrojs/markdown-remark";
import rehypeCallouts from "rehype-callouts";
import { rehypeTableWrapper } from "./src/utils/rehypeTableWrapper";
import config from "./astro-paper.config";
export default defineConfig({
  site: config.site.url,
  trailingSlash: "never",
  integrations: [sitemap()],
  i18n: {
    locales: ["zh-CN"],
    defaultLocale: "zh-CN",
    routing: { prefixDefaultLocale: false },
  },
  markdown: {
    processor: unified({
      rehypePlugins: [rehypeHeadingIds, rehypeCallouts, rehypeTableWrapper],
    }),
    shikiConfig: {
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
    },
  },
  vite: { plugins: [tailwindcss()] },
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
});

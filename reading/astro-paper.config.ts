import { defineAstroPaperConfig } from "./src/types/config";
export default defineAstroPaperConfig({
  site: {
    url: "https://beautyclaw.cn",
    title: "Shuai.Stuff",
    description:
      "智能时代的研究笔记。概念设计、本体论、软件架构。",
    author: "Shuai.Stuff",
    profile: "https://beautyclaw.cn/about",
    ogImage: "default-og.webp",
    lang: "zh-CN",
    timezone: "Asia/Shanghai",
    dir: "ltr",
  },
  posts: { perPage: 10, perIndex: 8 },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: false,
    showArchives: true,
    showBackButton: true,
    editPost: { enabled: false },
    search: "pagefind",
    toc: true,
  },
  socials: [],
  shareLinks: [],
});

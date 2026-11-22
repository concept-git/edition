# 管理控制台

Svelte 5、SvelteKit、TypeScript、Tailwind CSS 4。Node 24，pnpm 11.10.0。

路由在 `src/routes`，只装配 feature。能力在 `src/lib/features/<feature>/presentation`。两套壳共用的控件在 `src/lib/shared/ui`。feature 不互相引用界面。

`pnpm test` 用 Playwright 检查壳和入口，不启动 Docker 或 Control。会话可用之后再补对真实 Control 的浏览器缝。

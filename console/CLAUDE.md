# 管理控制台

Svelte 5、SvelteKit、TypeScript、Tailwind CSS 4。Node 24，pnpm 11.10.0。

路由在 `src/routes`，只装配 feature。能力在 `src/lib/features/<feature>/presentation`。数据访问在各 feature 的 `data`。当前租户解析和失败文案在 `src/lib/shared/api`。两套壳共用的控件在 `src/lib/shared/ui`。feature 不互相引用界面。示例入口 `example` 只走 `SampleSwitch`，不在每个路由里再写一遍判断。

`pnpm test` 用 Playwright 检查壳和入口，不启动 Docker 或 Control。会话可用之后再补对真实 Control 的浏览器缝。

菜单标题用领域概念的短名。概念名本身是两到四个字时原样使用，不另造说法，也不用「账号」「凭据」这类回避词去凑字数。概念名超过四个字，或是拉丁专名时，用定义里已有的四个字，说明里保留全名。

Svelte 5 的写法以 svelte-core-bestpractices 为准，控制台里已经犯过的不要再犯：

- 会话、运营身份不要放在模块级 `$state`，也不要包一层 `window.fetch`。身份从布局里的 session 读。
- 远程数据用 `$derived` 返回 Promise，模板里 `{#await}`。不要在 `$effect` 或 `onMount` 里把结果写回 `$state`。重试只增加一个计数，让 derived 重新求值。
- 属性不要 `untrack` 后抄进 `$state`。可写的 `$derived(saved)` 在用户改写之前一直跟着属性走。
- `{#key}` 只用于换掉编辑器文档或重启动效。子组件应自己读新的 id。
- `{#each}` 不用序号当 key，也不用可能重复的整行原文当 key。
- 目录拖拽继续用 `use:dndzone`。这个 action 在条目变化时要调用 `update`，拖动过程中列表会变；用 `{@attach}` 包一层会在这时拆掉区域，放置目标跟着消失。递归组件用 `import Self`，不用 `<svelte:self>`。
- 只整表替换的接口结果用 `$state.raw`。

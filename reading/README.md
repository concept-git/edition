# BeautyClaw 博客

基于 [AstroPaper v7.2.0](https://github.com/satnaing/astro-paper/releases/tag/v7.2.0)（MIT，保留 LICENSE），使用 Astro 7 Content Loader、静态路由、原生 Markdown、RSS、Sitemap 和 Pagefind。生产内容只从 Space Reader 匿名接口读取，不在前端或构建机保存管理 PAT。

## 内容维护

生产站点：https://beautyclaw.cn/ 。控制台中的 **BeautyClaw 博客** 空间是内容源，模式 authored，autoRelease=true；Space 挂载名 `blog`。保存是草稿，进版并成功发版后，系统定时构建博客。通常在下一分钟检查后完成构建；正常新增与编辑保留上一次完整产物，构建成功后原子切换；检测到单页撤回时，先原子发布已移除该页面、列表入口、RSS、Sitemap、媒体及搜索索引的过渡产物，其他文章继续可用；再切换完整 Astro 构建。只有全站匿名读取被拒绝，或安全清理失败时，才停止旧产物。网络临时故障保留最后成功产物；匿名身份被拒绝则停止提供旧产物。静态站与权限变更之间最多存在一个检查周期的延迟。

初次迁移保留原 HTML 正文及图示，新文章建议 Markdown。页面 slug 即旧文章 URL（无 `/posts` 前缀）。以下属性是此博客适配器的发布约定：

| 属性                | 用途                                                                    |
| ------------------- | ----------------------------------------------------------------------- |
| `blog_kind`         | `post` 文章、`guide` 专题导读、`page` 固定页（当前固定页为 `about`）    |
| `blog_published_at` | 文章原始 ISO 8601 发布时间；缺省使用平台发布时间                        |
| `blog_updated_at`   | 可选更新时间，不改变 RSS 原始发布时间                                   |
| `blog_category`     | human、systems、software-new-science、practical-philosophy、learning-ai |
| `blog_tags`         | JSON 数组，如 `[{"slug":"agents","name":"Agents"}]`；保留历史标签 URL   |
| `blog_cover`        | 发布包中的附件路径；输出为按摘要命名的媒体 URL                          |
| `blog_author`       | 可选作者，默认 Shuai.Stuff                                              |

描述、分享图、noIndex 使用页面 SEO。noIndex 页面仍可直接访问，排除索引、RSS、列表和搜索。只有已发布且对匿名可见的内容会进入构建；不读取控制台草稿。导读路径使用 `<栏目>/<主题>`，其他保留路径会拒绝构建。原生平台标签与这里的 `blog_tags` 属性分别维护，不自动转换。

## 本地

在仓库根使用 Node 24.19.0 与 pnpm 11.10.0：

```sh
corepack pnpm@11.10.0 --dir reading install --frozen-lockfile
corepack pnpm@11.10.0 --dir reading test
corepack pnpm@11.10.0 --dir reading run build
corepack pnpm@11.10.0 --dir reading exec astro preview --host 127.0.0.1 --port 4380
```

`SPACE_BLOG_SOURCE` 默认为 `https://beautyclaw.cn`，`SPACE_BLOG_SPACE` 默认为 `blog`。仅本地预览可显式使用 `SPACE_BLOG_FIXTURE` 配合 `astro dev`。`pnpm build` 遇到该变量会直接失败，并要求产物 `mode=reader`。维护稿在 `content/`，由 `node scripts/publish-blog.mjs` 经 Control 写入站点主机 `beautyclaw.cn`、挂载名 `blog`、匿名 reader、页面属性并发布。构建对原始 UTF-8/摘要、游标以及构建前后完整匿名清单作校验，拒绝混用不同发布或权限快照。SVG 图示输出为隔离的图片，保留可展开的文字说明。

## 同机部署

源码位于 `/opt/space-blog/app`，专用 Node 工具链位于 `/opt/space-blog/toolchain/node-v24.19.0-linux-x64`（从 nodejs.org 下载并校验 SHASUMS256）。专用用户 `space-blog` 无登录 shell。按锁文件安装依赖，复制 [service](deploy/space-blog.service) 和 [timer](deploy/space-blog.timer) 到 `/etc/systemd/system`，执行 daemon-reload。

[同步脚本](scripts/sync.sh) 由 systemd 以 768 MiB 内存上限、低优先级运行。首次或升级源码后创建 `/var/www/beautyclaw-blog/force-build`（归属 space-blog），然后 `systemctl start space-blog.service`；成功后 `systemctl enable --now space-blog.timer`。检查 `journalctl -u space-blog.service`、timer 状态及线上 `/blog-source.json`。不创建数据库或旧版本备份；构建成功后只保留当前产物。

[Caddy 站点块](deploy/blog.Caddyfile) 替换主机现有 beautyclaw.cn 站点块，保留 www/IP 跳转与 console/docs 的 import；变更先 `caddy validate` 再 reload。`/api/content/*` 交给 Reader；`/v1/*` 保持原 managed-api 和进程环境的 API key。八个业务/法律页面以及其资源仍由 `/var/www/beautyclaw-superweb/html` 提供，该目录是活动兼容资源，不是备份。其余旧博客 HTML 不作兜底。HTML 与 Pagefind 文件使用 `Cache-Control: no-cache` 进行重新验证，按摘要命名的静态资源长期缓存。未知 URL 返回真正的 404。所有 `/media/*.svg` 受 sandbox CSP 限制。

源代码变更需重新部署源码并强制构建；内容进版无需重新部署代码。验证至少覆盖旧 URL 清单、32 篇文章的原始日期、16 个导读、标签、图示、搜索、移动端、深浅主题及 console/docs。全量正文迁移包与 PAT 仅留在忽略的任务运行目录，不提交 Git。

## 通用阅读前端（SSR 档位，ADR-0035）

与静态博客并存的另一个部署档位：Astro node adapter，按站点 Host 服务端渲染任意空间。配置 `astro.reader.config.ts`，源码在 `src-reader/`（与静态博客的 `src/` 分开，`pages` 互不干扰）。

`pnpm check:reader` 使用 SSR 配置和 `tsconfig.reader.json` 检查通用阅读前端，可独立于博客内容源运行。`pnpm check` 依次检查博客和通用阅读前端。

```bash
pnpm build:reader        # astro check + 依赖规则检查 + 构建到 dist-reader/
SPACE_CONTENT_ORIGIN=http://reader:8080 \
SPACE_CONTROL_ORIGIN=http://control:8081 \
HOST=0.0.0.0 PORT=4321 pnpm start:reader   # node dist-reader/server/entry.mjs
```

### 环境变量

| 变量 | 默认值 | 作用 |
|---|---|---|
| `SPACE_CONTENT_ORIGIN` | `http://127.0.0.1:8080` | Reader 的内部地址：站点、页面、搜索与浏览事件（`/api/content/*`）。 |
| `SPACE_CONTROL_ORIGIN` | `http://127.0.0.1:8081` | Control 的内部地址：同域表单路由 `/_login`、`/_logout` 代调 `/_auth/session` 用。 |
| `HOST`、`PORT` | Astro node adapter 默认（`localhost`、`4321`） | 本前端监听地址，由 adapter 读取。 |

以上两个 Origin 只含协议、主机与端口；读取逻辑在 `src-reader/app/config.ts`，不设置时用表中默认值。

可信代理没有单独的开关，规则固定：

- 站点 Host 取 `X-Forwarded-Host`（取首个值），没有则取 `Host`；协议同理取 `X-Forwarded-Proto`，没有则用请求自身协议。站点 origin 由两者组成。
- 客户端地址取上游已带的 `X-Forwarded-For`，没有时用直连对端地址；`X-Forwarded-Port`、`X-Forwarded-Prefix`、`Cookie`、`Authorization` 原样转发。因此本前端必须只接受来自可信边缘的连接，由边缘负责覆盖客户端伪造的 `X-Forwarded-*`。
- 发往 Reader 与 Control 的请求都带上述 Host 与转发头；`/_login`、`/_logout` 还带站点 `Origin`。
- 内置的 Astro `checkOrigin` 已关闭（TLS 在边缘终止时会误拒）；这两个表单 POST 自行校验 `Origin`（缺失时仅接受 `Sec-Fetch-Site: same-origin`）。Control 与 Reader 的写操作要求 https，所以边缘必须带 `X-Forwarded-Proto: https`。

同域表单路由（无脚本读者使用）：`GET /_login?returnTo=`、`POST /_login`、`POST /_logout`（form-urlencoded）。前端服务端代调 Control 的 JSON 会话资源，成功与失败响应里的 `Set-Cookie` 都原样转给浏览器（例如续期 401 时的清 Cookie），`returnTo` 只接受站内相对路径，站外返回 422。

边缘应把 `/api/content/*`（含附件字节 `/api/content/spaces/{slug}/content`）、`/sitemap.xml`、`/robots.txt`、`/llms.txt` 交给 Reader，`/_auth/*` 交给 Control，`/_login`、`/_logout` 与其余路径交给本前端。

### 页眉脚本（渐进增强）

页眉有搜索框（`role=combobox`「搜索内容」与「搜索范围」）和已登录时的「退出」表单（`POST /_logout`）。无脚本时搜索框是 `GET /_search?q=&spaceSlug=` 表单，Enter 即提交。

有脚本时，搜索框在输入 2 个字符后防抖调用 `/api/content/search`（范围搜索先取 `/api/content/spaces/{slug}/snapshot`，Reader 要求 `spaceSlug` 与 `snapshot` 成对），展示建议；点击建议按响应的 `trackingToken` 上报 `POST /api/content/search-events`，搜索结果页同样上报「已展示」与点击。读取请求遇到 401 `reader_access_expired` 时，脚本调用同源 `POST /_auth/session/refresh` 续期并重试一次；遇到 429/503 遵守 `Retry-After`（重试按钮先禁用）；续期被拒（401）跳到 `/_login`。

私有页面 401 且凭据已过期（`reader_access_expired`）时，页面是「继续阅读」表单（直接 `POST /_auth/session/refresh`，带 `returnTo`）。有脚本时自动续期并回原页，失败保留会话并倒计时重试。刷新 Cookie 的 Path 是 `/_auth`，所以表单不经前端而直接提交给 Control：成功 303 回 `returnTo`，令牌失效 303 到登录页，依赖故障显示带请求号的 503 页，凭据保留（ADR-0035）。

### 内容插件渲染脚本（自有构建）

`json`、`json-schema`、`a2ui` 与在线登记的浏览器渲染类型由 reading 自己的脚本呈现，不再依赖 Reader 的 `/_static/content-plugins/reader.js`。源码在 `src-reader/app/client/content-plugins/`（渲染器、校验、宿主增强入口 `reader.ts`），由 `astro build` 打包为带 hash 的独立 chunk（`dist-reader/client/_astro/reader.<hash>.js`）；页眉脚本只在页面含 `[data-content-plugin]` 时才 `import()` 它。DOM 契约不变：宿主 `data-content-plugin` / `data-content-type` / `data-content-config` / `data-content-definition`，原文回退 `data-content-source`。

- `content-plugins.json` 是 `contracts/content-plugins.json` 的随构建副本（Docker 构建上下文只含 reading）；修改契约后必须同步复制，`tests/reader-content-plugins.test.mjs` 断言两者逐字节一致。
- 渲染器是自定义元素，依赖 `lit`、`@a2ui/*`、`@alenaksu/json-viewer`、`@hyperjump/*`、`dompurify`（pnpm 锁定）；`@hyperjump/browser` 在 `astro.reader.config.ts` 里别名到浏览器入口。
- 纯逻辑（按类型与冻结定义解析渲染贡献）在 `resolve-view.ts`，由 node 单测覆盖；渲染器与 DOM 增强依赖浏览器，阅读与交付场景分别由 `node infra/space.ts verify private` 和 `node infra/space.ts verify delivery` 验证。

按 Feature-first 组织：`app/`（装配与路由）、`features/<能力>/{presentation,domain,data,application}`、`shared/`。依赖方向与无环由 `scripts/check-architecture.mjs` 检查，已接入 `pnpm check` 与 `pnpm test`。

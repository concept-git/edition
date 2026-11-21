# Edition 管理控制台

React + Vite 的独立管理消费端，部署在 `/console/`。阅读端继续使用独立 Reader。后台 HTTP 接口是业务事实的唯一来源，控制台不访问数据库，也不持有第二份权限或发版规则。

## 开发

使用 Node 24 与仓库固定的 pnpm 11.10.0。在本目录执行：

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

Vite 默认将 `/api`、`/auth`、`/admin`、`/ops` 代理到本机管理服务 `http://127.0.0.1:8094`，可通过 `EDITION_CONTROL_ORIGIN` 覆盖。后台允许的控制台来源通过 `EDITION_CONSOLE_ORIGINS` 配置；生产环境使用同源 HTTPS 入口。

完整平台启动见[工程工具](../../infra/README.md)。开发模式使用后台会话 Cookie；刷新凭据由后台签发。访问令牌仅在内存中保存。退出和切换身份会清空相应查询缓存。

## 结构与复用

```text
src/app/                    路由、依赖组装和工作区
src/features/<capability>/  特性公开入口及 presentation/domain 等按需分层
src/shared/api/             契约生成客户端、边界校验、会话与错误处理
src/shared/ui/              shadcn/ui、操作表单、表格和资源状态组件
src/shared/editor/          Plate 官方 Kit、CodeMirror、Worker 编译
src/shared/styles/          Modern Minimal 语义主题与明暗模式
```

特性通过 `index.ts` 公开入口协作。纯领域代码不依赖 React 或 I/O。只有确实存在独立规则的能力建立领域层；简单接口操作保留在特性内。检查脚本禁止跨特性内部路径引用、shared 反向依赖特性和领域层引入框架。

基础控件复用 shadcn/ui 与 Radix；列表复用 TanStack Table；服务端状态使用 TanStack Query；表单使用 React Hook Form。主题使用 tweakcn Modern Minimal 的 CSS 语义变量，支持系统、浅色与深色。只持久化主题选择，不持久化令牌、正文或插件秘密。

Plate 复用官方基础块、文字标记、列表、链接、表格、代码块与 Markdown Kit；HTML 序列化使用官方静态 Kit。源码由 CodeMirror 处理。含未支持结构、图片或自定义 HTML 的正文保留源码模式，避免有损转换。附件独立上传和下载。编辑保存使用后台 ETag 与幂等键；冲突后保留本地工作稿，用户明确采用新基线后才能重试。

## 契约与覆盖

唯一接口输入为仓库生成的 [OpenAPI](../../contracts/openapi.json)。禁止手改客户端生成文件或复制维护业务 Schema。

```bash
corepack pnpm generate
corepack pnpm check
```

生成器输出类型、命名 SDK、请求/响应校验器及按操作加载的运行时 Schema。文件传输保留真实 multipart / Blob，编辑返回保留 ETag。可选但非 nullable 字段的后台 `null` 统一映射为缺省；必填值与明确 nullable 字段仍按契约验证。该兼容处理只作用于响应。

[接口覆盖清单](API-COVERAGE.md)由实际调用 AST 与 OpenAPI 比对产生，区分 UI、兼容别名、机器接口和刷新协调器。清单表示接线，不表示每项写操作均已通过真实服务验收。

已提供的特性入口包括会话与账户、空间与分组、页面与修订、目录、附件、标签、Bundle 导入导出、发版、站点、域名、交付、重定向、搜索、授权与成员、审计、Webhook、统计、清理、内容类型、插件工作台及平台运营。异步导入、导出和投递以后台返回的作业状态为准。

插件候选由浏览器 Worker 内的 esbuild-wasm 编译，当前只解析开发稿内的相对依赖。候选运行于无同源权限的 iframe；浏览器证据和服务端校验分别展示。验证不会安装候选到生产。

## 验证

```bash
corepack pnpm test
corepack pnpm lint
corepack pnpm format:check
corepack pnpm check:duplication
corepack pnpm test:mutation
corepack pnpm build
corepack pnpm exec playwright install chromium
corepack pnpm test:browser
```

`EDITION_CONSOLE_PREVIEW=1 corepack pnpm test:browser` 检查已构建生产产物。`EDITION_CHROMIUM_EXECUTABLE` 可指定已安装的 Chromium。单元测试关注会话协调、契约边界、编辑冲突及刷新失败的工作稿保留；变异测试约束会话与编辑领域的行为。浏览器替身测试和真实后端验收分开维护。

仓库根执行 `node infra/edition.ts quality static --scope console` 可运行控制台静态门禁。真实拓扑使用 `node infra/edition.ts verify console`，隔离配置与其它验收共用约定，见[质量说明](../../infra/quality.md)。真实验收覆盖同源登录刷新、创作冲突、主要管理入口、元数据与附件、回收还原、挂载、用户组及插件候选验证。任务执行记录与截图写入 Git 忽略目录，不随源码提交。

复用源码的来源、适配范围与许可见[第三方声明](THIRD-PARTY-NOTICES.md)。

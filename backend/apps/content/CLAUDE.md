# CLAUDE.md

内容读取进程。按已发布版本提供页面、目录、搜索结果和机器可读资源。只依赖 `contract`。

## Project map

- `bootstrap` — 最终装配
- `entry` — 协议与存储
- `compositions` — 应用行为
- 业务运行依赖只允许 `contract`
- 运行包名、HTTP 和产物名保持既有契约

读者会话命令在 Control。本进程不得回查管理库、调用管理概念，或修复数据和索引。不能使用管理库、迁移 owner、对象存储写凭据、索引写 key，也不能使用管理会话密钥。

<important if="you need to run commands to build, test, lint, or generate code">

| Command | What it does |
|---|---|
| `:content:check` | 最小验证。不要只跑 `test`，否则会漏掉 `verifyIsolation` |
| `node infra/edition.ts verify delivery --update-contract` | 改 HTTP 契约后生成 `contracts/delivery-openapi.json`。审阅后去掉该参数再验收 |
</important>

<important if="you are changing auth routes or edge routing">
- `/_auth/*` 由 Control 处理，Content 拒绝该前缀。边缘不把认证路径交给控制台 SPA。
</important>

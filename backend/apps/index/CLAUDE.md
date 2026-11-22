# CLAUDE.md

非 Web 进程。从共享主库读取发布事实，只重建搜索索引，并上报心跳。

## Project map

- `bootstrap` — 最终装配
- `adapters/inbound` — 定时触发与心跳
- `adapters/readviews` — 索引任务读取
- `adapters/outbound` — 搜索引擎
- `usecases` — 应用行为。规则见 `usecases/SYNCS.md`
- 运行包名、HTTP 和产物名保持既有契约

不得引用管理概念或直接修改源业务表。不新增 HTTP 管理端点。不用 content 凭据代替写角色，也不向 index 注入管理会话私钥。不要用内存重试代替持久恢复。生效、重试和回收见 `infra/README.md`。

<important if="you are changing snapshot, permission, or identity projection protocols">
- 同时执行 `:control:check :content:check :index:check`。
</important>

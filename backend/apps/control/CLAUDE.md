# CLAUDE.md

管理应用。概念实现在 `backend/libraries`，遵守 `backend/libraries/CLAUDE.md`。

## Project map

- `bootstrap` — 最终装配。概念装配入口只在这里使用
- `adapters` — 协议与存储。HTTP 只依赖组合入口及被动值
- `compositions` — 组合。组内共置 `SYNCS.md`，并由组合根索引
- `domain/` — 纯 Java。公开接口声明动作与只读查询
- `Tenant` 是身份类型。`platform.tenantregistry` 的概念名是 `TenantRegistry`。`shared` 不反依赖概念

<important if="you need to run commands to build, test, lint, or generate code">

本机 `:control:bootRun` 默认启用 dev 夹具和临时密钥。生产 JAR 必须配置持久密钥。

| Command | What it does |
|---|---|
| `:control:generateOpenApiDocs` | 修改 adapters/http 或公开 ProblemCode 后运行。生成器会启动完整功能应用，须先准备依赖 |
| `:control:test`（真实 PostgreSQL） | 修改 SQL 后运行。静态检查不能验证 RLS 实际生效 |
</important>

<important if="you are adding a platform concept or changing a concept boundary">
- 按 `docs/prd/README.md` 和共置规格检查单一 purpose、状态所有权与 OP。混合目的拆分，重复状态清除。
- 完成时同步 PRD 索引、接口覆盖和 Modulith 零依赖门禁。
</important>

<important if="you are adding or changing syncs or composition rules">
- 具名规则默认一条一个 `UseCase` 或 `On<Event>` 文件。规则身份是 `SYNCS.md` 的 `sync` 名和 `claim` 字符串。
- Facade 可选，且只提供入口。不把协调藏入 Facade、Support 或 Helper。
- flow 的概念依赖逐项声明。flow 间依赖无环。规则不直接调用其他规则。
- 共享协作者要有明确职责与规格归属，并更新实际依赖门禁。
- 组合不复制概念业务事实。必要执行记录须写明相关性与恢复协议。具有独立业务目的的状态重新做概念资格审查。
- 概念签名不含 HTTP 协议类型。系统动作不开放直通端点。
- flow 专属 Access 只放权限投影，不复制资源归属查询。租户动作经 `TenantAccess` 进入作用域。概念不查租户登记处。
</important>

<important if="you are adding or changing an error case">
- 组合规则抛 `FlowException`。HTTP 适配器自身拒绝抛 `GatewayProblemException`。新增 case 同时改 SYNCS、异常类和 catalog。
</important>

<important if="you are changing SQL, tables, foreign keys, or migrations">
- 1.0.1 为正式基线。已发布迁移保持只读，变更只追加。旧开发库校验和不匹配时，用新隔离卷验收，保留已有数据卷。迁移生命周期见 `docs/adr/README.md#adr-0025`。
- 新业务表同时维护 RLS 与 `space_app` DML。跨上下文外键只按 ADR-0009 白名单。
</important>

<important if="you are writing or running control tests that touch the database">
- 被测路径使用受限 RLS 角色。只有夹具与落库真值断言使用 `FIXTURE_JDBC`。
- 直接调用概念时自行 `tenantScope.inTenant(...)`。不得关闭 RLS。
</important>

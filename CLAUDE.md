# CLAUDE.md

Edition 是多租户文档与知识交付平台：Java 25 / Gradle 的 control、worker、reader 三个独立应用，以及 Control CLI 与 Python EditionVFS。

## Project map

- `backend/apps/` — control、worker、reader；三个进程独立运行。Control 不提供阅读页面
- `backend/libraries/<领域名>/` — 独立概念模块；规格在各模块 `CONCEPT.md`
- `backend/libraries/` — contract等具名技术库
- `acceptance/` — 浏览器验收与测试夹具
- `clients/control/` — 管理 CLI
- `clients/edition/` — 只读 EditionVFS
- `contracts/` — 生成的 OpenAPI
- `infra/` — 启动、验收、部署与仓库检查
- `docs/` — PRD、ADR 与工程文档

@AGENTS.md

<important if="you need to run commands to build, test, lint, or generate code">

不要用全局 Gradle、Maven 或 npm/yarn 安装依赖。工具链由 Wrapper、Gradle toolchain 和 pnpm 锁文件固定。直接运行 JAR 需要本机 Java 25；Wrapper 只供给编译 toolchain。

| Command | What it does |
|---|---|
| `node infra/edition.ts repository` | 修改文档、目录或脚本入口后，在仓库根运行 |
| `node infra/edition.ts verify` | 浏览器验收。三个 suite 共用端口和数据，顺序运行。不要直接运行无分组的 `playwright test`。完整命令见 `infra/quality.md` |
</important>

<important if="you are changing product behavior, concepts, or sync rules">
- 先更新共置的 `CONCEPT.md` / `SYNCS.md`。`docs/prd/README.md#syncs` 是索引，不在其中维护第二份 flow 规格。
</important>

<important if="you are changing HTTP APIs or files under contracts/">
- `contracts/openapi.json` 与 `contracts/delivery-openapi.json` 是生成契约，手改无效。按 `contracts/README.md` 从后端源重新生成，并与实现一起提交。
</important>

<important if="you are committing or staging files">
- `.scratch/dw-v1/runtime/` 含运行凭据及日志，禁止提交。
</important>

<important if="you are stopping services, resetting databases, or running acceptance">
- 验收使用隔离拓扑。不要用 `docker compose down -v` 清空现有开发库。
</important>

<important if="you are writing or running database or persistence tests">
- 依赖真实 PostgreSQL 的 schema、RLS 和 advisory lock。不用 H2、SQLite 或 mock 持久层替代。
</important>

<important if="you are changing cross-process delivery or which process serves a request">
- 跨进程交付见 `infra/README.md`。
</important>

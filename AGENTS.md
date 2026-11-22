# Edition

## 导航

工程入口见 [README.md](README.md)；文档权威来源与历史材料的边界见 [docs/README.md](docs/README.md)；脚本用途见 [infra/README.md](infra/README.md)。

## 分区规范

- 构建、验证、生成文件与运行环境：[CLAUDE.md](CLAUDE.md)
- 后端：[backend/CLAUDE.md](backend/CLAUDE.md)
- 概念规格：[docs/prd/README.md](docs/prd/README.md)；共置于 `backend/libraries/<领域名>/CONCEPT.md`
- 消费适配：[clients/edition/CLAUDE.md](clients/edition/CLAUDE.md)
- 管理控制台：[console/CLAUDE.md](console/CLAUDE.md)

## Agent skills

- Issues：`.scratch/<feature-slug>/` — [docs/agents/issue-tracker.md](docs/agents/issue-tracker.md)
- Triage `Status:` — [docs/agents/triage-labels.md](docs/agents/triage-labels.md)
- Domain：[CONTEXT.md](CONTEXT.md) + [docs/adr](docs/adr/README.md) — [docs/agents/domain.md](docs/agents/domain.md)
- Failure：[docs/agents/failure-handling.md](docs/agents/failure-handling.md)

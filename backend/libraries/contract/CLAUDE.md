# CLAUDE.md

跨进程共享的被动快照与记录。协议边界见 `infra/README.md`。

## Project map

- 库模块。使用 `build`，不运行 `bootRun` / `bootJar`
- 不放 Spring 服务、SQL、网络调用或管理概念依赖

<important if="you need to run commands to build, test, lint, or generate code">

| Command | What it does |
|---|---|
| `:contract:check` | 最小验证，并编译 `:control`、`:content`、`:index` |
</important>

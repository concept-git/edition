# 基础设施与工程工具

所有入口使用 Node 24 直接执行 TypeScript，从仓库根运行。首次在 infra 目录执行
`corepack pnpm install --frozen-lockfile`；工具依赖由独立锁文件固定。
部署需要 Linux Docker 引擎与 Compose 2.24.4 以上版本；macOS / Windows 的 `setup` 可安装并启动 Docker Desktop。
在 infra 目录用 `corepack pnpm check` / `corepack pnpm test` 检查类型与回归。环境与凭据按 [DELIVERY](../contracts/delivery-openapi.json) 准备，
分组、故障注入与验证标准按 [TESTING](quality.md) 执行。

平台部署集中在三个文件：[edition.ts](edition.ts) 处理命令、初始化和演示，[compose.yml](deployment/compose.yml) 定义拓扑和健康检查，[Dockerfile](deployment/Dockerfile) 构建应用、前端和对象存储镜像。SQL 登录角色、Caddy 路由和对象存储策略由各自的工具直接读取。

双域名生产入口使用 [production.Caddyfile](deployment/production.Caddyfile)。设置 `CONSOLE_DOMAIN`、`DOCS_DOMAIN`，并按部署调整 `ADMIN_UPSTREAM`、`CONTENT_UPSTREAM`。管理域名在 `/console/` 提供 React 控制台静态文件与 SPA 深链接，并覆盖管理 API、审计和 `/ops/*` 作业接口，文档域名交给 Reader。

```text
infra/
├── edition.ts        # 平台、诊断、验收、种子、采集、仓库检查与质量门禁
├── content/        # 种子读取的页面样例
├── deployment/     # Compose、登录角色、Caddy 与对象存储策略
├── tests/          # 工程工具的回归测试
├── c8.json、java.gradle、python.coveragerc、requirements.txt
└── quality.md      # 覆盖率口径与质量说明
```

| 命令 | 目的 |
| --- | --- |
| `node infra/edition.ts quality all` | 统一质量验收。依赖准备、局部检查与报告口径见[质量看护](quality.md) |
| `node infra/edition.ts platform start` | 部署三个应用、前端和演示；`doctor` / `setup` / `restart` / `stop` / `status` / `logs` 管理当前项目 |
| `node infra/edition.ts verify delivery` | 统一真实浏览器验收；其它 suite 为 `private`、`vfs`、`console`，共用拓扑且顺序执行 |
| `node infra/edition.ts seed` | 补齐阅读示例、管理示例数据和内容维护 PAT；`--check` 只验证 |
| `node infra/edition.ts diagnose run reader` | 手动单角色诊断；`bootstrap` 准备本地受限凭据 |
| `node infra/edition.ts collect --help` | 查询 Reader 观察日志的采集参数 |
| `node infra/edition.ts repository` | 文档链接、现行包名、CI/npm 脚本入口与 PRD 组合一致性检查；无需运行服务 |
| `node --test infra/tests/*.test.ts` | 运行工程工具回归测试 |

## 内部协作者与专用工具

- [edition.ts](edition.ts) 提供共享拓扑、受限身份、稳定密钥与产物快照，并分发上面的命令。
- 平台启动器启用 `platform` 和 `ingress` profile，并按需执行 `tools` 中的一次性初始化。宿主机验收复用依赖和 HTTPS 入口。
- 仓库根的 [docker-compose.yml](../docker-compose.yml) 供手动诊断使用，保留原有容器名、端口和数据卷。
- 种子数据只在 [edition.ts](edition.ts) 维护；[content](content) 是正文样例。
- 日志采集授权由平台 Analytics 概念承担；采集检查点与种子凭据均写入忽略的运行目录。

运行资源、密钥与日志写入忽略的 `.scratch/dw-v1/runtime/`。验证日志按运行目录保存；一次性验证源码与缓存用后删除。

独立博客前端采用 AstroPaper + Edition Reader；构建、systemd 定时更新与保留业务路由见 [reading](../reading/README.md)。

管理控制台开发和生成契约见 [control-console](../clients/control-console/README.md)。生产镜像把控制台产物放入 `/srv/console`；`/console/assets/*` 的缺失资源返回 404，只有页面路由回退到控制台入口。宿主机 `verify console` 启动独立预览角色（默认 8098，跟随端口偏移），经 HTTPS `console.acme.test` 入口访问，与真实管理服务、Worker 和数据库协作。

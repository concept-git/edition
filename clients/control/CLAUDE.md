# CLAUDE.md

独立的 Java 25 / Gradle Wrapper 管理 CLI。不依赖 backend 运行时，不加入 backend settings。

## Project map

- `contracts/openapi.json` — HTTP、类型、认证与 scope
- `metadata/commands.json` — 只维护命名、精炼 description 与高影响确认要求。无本体或谓词运行时
- `SPECS.md` — 行为规格。改行为先更新这里
- 技能只有一个中文 SKILL.md，以平台专家说明操作的口吻组织原则、概念和 CLI 工程事实。参数以当前 help/schema 为准，本次运行事实留在任务目录

<important if="you need to run commands to build, test, lint, or generate code">

| Command | What it does |
|---|---|
| `python3 scripts/generate_contract.py` | 更新 CLI 目录。verifyContract 阻断漂移 |
| `./gradlew check installDist distZip` | 构建验证 |
| 真实 HTTP / CLI / MCP 进程 | 业务集成使用真实 Control 与 PostgreSQL，并设置 `SPACECTL_REQUIRE_CLI=true` |
</important>

<important if="you are changing CLI behavior or generated contracts">
- 契约从后端源生成，禁止手改 generated contracts。
- 技能保留决策、必要示例和约束。完整参数以当前 help/schema 为准。
</important>

<important if="you are adding or changing commands, argv, or schema">
- 固定命令与动态 API 使用 Aesh 实际命令模型。CLI、MCP、批量共享输入校验与执行器。
- 非交互 argv 不经 shell 重解析，schema 投影实际模型。
- 字段角色决定合法输入。保留文本换行、URL query 与动态 map。
</important>

<important if="you are handling credentials, config, errors, or command output">
- 认证秘密不得进入 argv、配置、异常或默认输出。凭据库不可用时不回退明文。
</important>

<important if="you are changing dry-run, replay, or write recovery">
- 所有预演零业务请求、零凭据刷新、零 journal。服务端始终重验授权和并发前置。
- 未知写入保留原意图。有键恢复，无键拒绝重放。
</important>

<important if="you are changing update or install behavior">
- 更新使用独立签名源，不携带 Control 凭据。安装目录与状态目录隔离。跨 CLI 主版本不得自动安装。
</important>

<important if="you are adding abstractions, types, or comments">
- 类按职责与状态所有权组织。注释说明边界及非显然约束。
- 新增抽象必须有已验证需求。无理由的接口、工厂与转发层不保留。
</important>

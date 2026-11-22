# CLAUDE.md

后端按 ADR-0037 分成三个应用。概念在 Control 源码根的 `modules/`，技术库在 `libraries/`。

## Project map

- `apps/control` — `modules`、`usecases`、`adapters`、`bootstrap`。概念规格在模块 `CONCEPT.md`，组合规格在用例组 `SYNCS.md`
- `apps/content`、`apps/index` — `usecases`、`adapters`、`bootstrap`。没有概念模块
- `libraries/` — contract、values、request-context。规则见 `libraries/CLAUDE.md`
- 管理产物名是 `edition-control`，项目路径是 `:control`

<important if="you need to run commands to build, test, lint, or generate code">

在 `backend/` 使用 `./gradlew`。根项目没有应用源码。

| Command | What it does |
|---|---|
| `:control:bootRun` 等完整项目路径 | 定向启动一个服务。裸 `bootRun` 会匹配多个服务 |
| `./gradlew spotlessApply` | 改完源文件后格式化。不要手调 import 顺序或折行 |
| 消费方的 `check` | 改共享库时同时检查消费它的服务 |
</important>

<important if="you are changing architecture checks, module boundaries, or build dependencies">
- 每个生产构件都进入正常架构检查。不能以空扫描、遗漏项目或单点豁免使检查通过。构建依赖和实际字节码依赖分别验证。
</important>

<important if="an architecture or specification check fails">
- 改实现。规则确需变化时先改规格并说明理由，不添加单点豁免。
</important>

<important if="you are changing Gradle dependency declarations or reading buildHealth">
- `buildHealth` 不纳入 `check`。Spring starter 会被判 unused，先看报告再改声明。
- 跨模块版本只改 `gradle/libs.versions.toml`。
</important>

<important if="you are editing files under build/">
- `*/build/` 是生成产物，不要修生成类。
</important>

<important if="you are changing cross-store projection, reader permissions, published versions, or recovery">
- 见 `infra/README.md`。
</important>

<important if="you are changing failure handling, retries, or external I/O">
- 见 `docs/agents/failure-handling.md`。
</important>

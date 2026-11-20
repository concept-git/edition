# CLAUDE.md

具名技术库：有具体用途、显式构建与测试，不依赖概念或应用组合，也不隐藏业务状态或协调。

## 技术库

- `contract` — 被动跨进程记录与内容值。规则见 `contract/CLAUDE.md`
- `values` — 无业务生命周期的值、哈希与分页计算
- `request-context` — 请求作用域身份上下文，不携带凭据明文
- `testing` — 只发布 test fixtures，供独立概念测试装配 Spring 与真实 PostgreSQL

<important if="you are depending on testing or changing production dependencies">
- 生产应用不得引入 `testing` 的 fixture 变体。它不编译或加载 Control，也不实现概念行为。
</important>

<important if="you are changing delivery writes, migrations, or database roles">
- reader 不获得交付写实现。迁移 owner 与运行凭据保持分离。
- 数据库迁移和函数的业务状态所有权不因放进共享设施而改变。
</important>

<important if="you are changing a technical library or its version">
- 同时验证所有消费者。依赖版本只改 `backend/gradle/libs.versions.toml`。
</important>

## 概念库

独立概念模块。概念之间零源码、构建、动作调用和状态读取依赖。

- 每个概念拥有独立 `build.gradle.kts`、模块根 `CONCEPT.md`、业务导出、装配入口及本模块测试
- 清单由 `backend/concept-modules.json` 声明。PRD 和装配覆盖相同的 19 个产品概念与 18 个平台概念
- `domain` — 纯 Java，不依赖 application、adapters、Spring、ORM 或 HTTP。领域专用仓储端口可由 domain 拥有
- `application/ports` — 声明内部技术契约。application 不依赖具体 adapter
- `adapters` — 实现内部端口。新代码使用 `adapters`；简单概念可以扁平实现，不建空层
- 外部身份是不透明值。跨概念校验与组合属于应用 `composition`

<important if="you are adding exports, ports, adapters, or assembly wiring">
- 业务 API 与装配入口分开。默认根包和显式 NamedInterface 提供业务导出。
- assembly 命名接口只供应用 bootstrap 与限定测试装配使用。业务代码不得从容器解析依赖。
</important>

<important if="you are writing SQL or sharing a schema across concepts">
- SQL 遵守状态归属。schema 共置不授予跨概念读写许可。
</important>

<important if="you are moving a type into another module">
- 业务含义、约束和变更责任明确后，才做跨模块技术复用。
</important>

<important if="you are writing or running concept tests">
- 模块测试独立执行。真实 PostgreSQL 通过 `testing` 的 test fixtures 装配。
- 业务连接使用受限 RLS 角色。owner 只用于迁移与夹具。
- 跨概念或应用场景测试留在应用层。
</important>

<important if="you are changing a public interface, concept spec, published migration, or cross-concept effect">
- 改公开接口或规格后，运行概念/平台规格、完整接口映射及受影响组合检查。转录映射不能证明行为正确。
- 跨概念同库事务、幂等、外部效果、恢复和已发布迁移遵守仓库既有策略。
</important>

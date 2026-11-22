# CLAUDE.md

具名技术库：有具体用途、显式构建与测试，不依赖概念或应用组合，也不隐藏业务状态或协调。

## 技术库

- `contract` — 被动跨进程记录与内容值。规则见 `contract/CLAUDE.md`
- `values` — 无业务生命周期的值、哈希与分页计算
- `request-context` — 请求作用域身份上下文，不携带凭据明文

概念不在这里。37 个概念位于 Control 的 `modules/`，见 `backend/apps/control/CLAUDE.md`。

<important if="you are changing delivery writes, migrations, or database roles">
- reader 不获得交付写实现。迁移 owner 与运行凭据保持分离。
- 数据库迁移和函数的业务状态所有权不因放进共享设施而改变。
</important>

<important if="you are changing a technical library or its version">
- 同时验证所有消费者。依赖版本只改 `backend/gradle/libs.versions.toml`。
</important>

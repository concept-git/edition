# Failure handling

本护栏适用于新增/修改错误、重试、幂等、外部 I/O、异步作业或失败 UX。决策见
ADR-0015～0017；概念 error case、SYNCS、API 与前端状态必须同一变更更新。

## 分类与边界

| 类别 | 公共语义 | 调用方行动 |
| --- | --- | --- |
| 业务拒绝 | 概念声明的有限 error case；HTTP 400/409/422 | 修正输入、解决冲突或停止 |
| 认证/限流 | 已确认的 401/403/429 | 仅 `invalid_refresh` 清会话；429 等 `Retry-After` |
| 瞬态依赖故障 | 503/504 + `traceId` | 查询可退避重试；变更仅携原幂等 key 重试 |
| 程序不变量失败 | 500 `unexpected_error` + 告警 | 不自动重试，修复缺陷 |

- 按“调用方下一步是否不同”决定 error case；内部原因可合并，行动不同则不可合并。
- 校验详情用 `violations[{field,code}]`；公共 `code` 为生成枚举，禁止透出异常类名、SQL、凭据或任意异常文本。
- 依赖超时/不可用不是业务拒绝，不返回空集合、false、Optional.empty 或伪成功。
- 只有 HTTP、消息/作业消费者等顶层边界可宽泛捕获并分类；局部只捕获可恢复、补偿或精确翻译的异常。

## 事务、重试与外部效果

- 同一业务原子内的概念动作使用共享事务；任一步业务拒绝或系统故障都回滚全部可观察状态。
- 事务内写业务事实与 outbox；邮件、webhook、搜索等提交后副作用由 worker 幂等投递。
- 幂等范围是 `principal + operation + key + request fingerprint`；同键异请求为 409，重放返回原结果。
- 查询只重试已分类瞬态故障；变更没有幂等 key 时禁止自动重试。退避必须有上限、抖动与可观测终态。
- 作业状态统一为 `queued/running/retrying/held/failed/completed`；held 只表示业务需人工处理，依赖故障用 retrying/failed。

上述重试上限是通用设计要求。现状例外：账号事实投影的 `shared.finish_identity_snapshot` 失败后持续 retrying，等待线性增加至六十秒，没有与邮件/阅读安全投影相同的失败预算；不能将通用要求描述为全部任务已具备的保证。源码及其他任务差异见 [ADR 实现核对](../adr/README.md#implementation-evidence)，统一这项机制须另行裁决。

## 前端与契约

- 只有 refresh 明确返回 `401 invalid_refresh` 才清凭据并跳登录；403、429、5xx、网络失败保留会话和草稿。
- 4xx 由 code/violations 驱动具体修正；429 尊重 `Retry-After`；5xx/网络错误保留页面状态并展示可重试反馈与 traceId。
- OpenAPI、生成错误枚举、SYNCS 匹配条件、UX 状态矩阵必须与概念 error case 同步。

## 必测失败路径

- 每个 error case、事务中途失败与回滚；并发唯一性/最后拥有者等竞争。
- 非法 JWT 是 401；数据库/对象存储/DNS/搜索不可用是 503/504，且不能降级为 401、空结果或 held。
- 幂等同键同请求重放、并发首写、同键异请求冲突；外部投递重复、重试、死信与恢复。
- 搜索 generation 替换失败继续服务旧版，永不读到半新半旧。

## 完成检查

- [ ] 概念 error case 有限、命名稳定，且每个都对应不同调用方行动
- [ ] SYNCS 明确原子边界、失败匹配与提交前/后时序
- [ ] API/前端分类一致，未把真实故障改写成业务结果
- [ ] 上述失败、并发、重试测试已加入；门禁存在前不得宣称自动保证

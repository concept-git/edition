# concept Idempotency

## purpose

让同一请求的重试取得原响应，同时阻止同键异请求重复执行。

## state

records: (PrincipalType, PrincipalId, Operation, Key) -> lone (fingerprint: String, response: StoredResponse, expiresAt: Time)

初态为空。scope 四元组唯一；processing 只存在于未提交的首写事务。完成响应的 body 加密保存，24 小时后可清理或复用 scope。

## actions

execute [command: Command; action: Supplier<StoredResponse>] => [response: StoredResponse]
  requires scope 无有效记录；ensures 与 action 在同一事务保存最终响应；action 回滚则不留占位
execute [command: Command; action: Supplier<StoredResponse>] => [response: StoredResponse]
  requires scope 已完成且 fingerprint 相同；ensures 不执行 action，返回原响应
execute [command: Command; action: Supplier<StoredResponse>] => [error: IdempotencyKeyReusedException]
  requires scope 已存在且 fingerprint 不同；ensures 不执行 action
execute [command: Command; action: Supplier<StoredResponse>] => [error: IdempotencyRequestInProgressException]
  requires 存在历史已提交 processing 行；ensures 不执行 action
deleteExpired [cutoff: Time; limit: Int] => [count: Int]
  ensures 有界删除过期记录，返回删除数

## operational principle

after execute [command: c; action: a] => [response: r]
then 使用相同 c 再执行 execute [command: c; action: a2] => [response: r]，a2 不执行；
若同 scope 改动 fingerprint，则拒绝而不重放错误请求。

## notes

平台类概念；与产品概念采用相同规格形式。以下保留实现边界与运维约束。

本概念落实 ADR-0016，独占写入 `shared.idempotency_records`；其目的属于平台能力，而非产品业务状态。

### 边界与保证

- scope 为 `principal type/id + operation + idempotency key`，另存 canonical request fingerprint。
- 首写记录、业务动作与最终响应在同一事务；回滚不会留下 `completed` 或占位记录。
- PostgreSQL 主键裁决并发首写；竞争插入等待首事务结束，同请求重放，异请求拒绝。
- 最终响应保存 status、content type，以及 AES-256-GCM 加密的版本化 body envelope；保留期固定 24 小时。
- 每条 completed 响应使用随机 96-bit nonce；AAD 绑定 principal type/id、operation、key 与 request
  fingerprint，防止跨记录搬移。模块 API 与 sync 只看到认证解密后的 `StoredResponse`。
- 加密 key 独立读取 `IDEMPOTENCY_ENCRYPTION_KEY`（base64 32 bytes），缺失默认拒绝启动；临时 key
  仅供本地/测试通过显式开关启用。认证解密失败是程序不变量失败，必须进入 500 + 告警。
- 过期 scope 可原子删除后复用；repository 另提供批量 `deleteExpired` 安全清理入口。
- `processing` 只存在于未提交的首写事务。若发现历史遗留的已提交 processing 行，稳定返回
  `idempotency_request_in_progress`，绝不执行第二次业务动作或伪造成功。

sync 是唯一调用方；gateway 只能通过具体 flow 使用本模块。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `IdempotencyApi.deleteExpired` | `cutoff: Instant, limit: int` | `int` |
| `IdempotencyApi.execute` | `command: IdempotencyApi.Command, action: Supplier<IdempotencyApi.StoredResponse>` | `IdempotencyApi.StoredResponse` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `IdempotencyApi.Command` | `principalType: String, principalId: UUID, operation: String, key: String, requestFingerprint: String` |
| `IdempotencyApi.StoredResponse` | `status: int, body: String, contentType: String` |

<!-- interface-contract:end -->

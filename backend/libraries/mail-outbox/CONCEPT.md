# concept MailOutbox

## purpose

让一次性邮件意图在业务提交后可恢复投递，且重试不改变已发送内容。

## state

messages: MessageId -> (kind: Kind, recipient: String, encryptedPayload: Bytes, status: Status, attempt: Nat, lease: lone Token, prepared: lone Content)

初态为空。Kind 为 verification/invitation/password_reset。payload 和首次发送前固化内容加密保存；列表不含秘密。租约两分钟，自动尝试最多八次。

## actions

enqueue [kind: Kind; recipient: String; payload: Map<String, String>] => [id: MessageId]
  ensures 在调用事务保存加密意图
claim [] => [lease: optional Lease]
  ensures 以短事务领取可投递项，无候选为 empty
prepare [lease: Lease; payload: Map<String, String>] => [prepared: Bool]
  ensures 当前租约首次发送前固化主题、正文与链接；失败不发送
send [messageId: MessageId; recipient: String; subject: String; text: String] => []
  ensures SMTP 供方接受；不承诺收件箱送达或恰好一次
accepted [lease: Lease] => []
obsolete [lease: Lease] => []
failed [lease: Lease; code: String; retryable: Bool] => []
  ensures 仅当前租约可终结或安排有界重试
retry [id: MessageId] => [accepted: Bool]
  ensures 可恢复时沿用原 id 和已固化内容
eraseRecipient [recipient: String] => []
  ensures 擦除注销地址与密文

## operational principle

after enqueue [kind: k; recipient: r; payload: p] => [id: i]
then claim [] => [lease: l]，prepare [lease: l; payload: p] => [prepared: true]，send [messageId: i; recipient: r; subject: s; text: t] => []；
若需要 retry [id: i] => [accepted: true]，仍使用首次固化的 s/t。

## queries

payload [lease: Lease] => [payload: Map<String, String>]
  returns 仅内部投递使用的解密数据
list [tenant: TenantId; before: KeysetCursor; limit: Int] => [views: seq View]
view [id: MessageId] => [view: optional View]
  returns 不含秘密的状态视图，未知 id 为 empty

## notes

平台类概念；与产品概念采用相同规格形式。以下保留实现边界与运维约束。

本模块独占 `shared.mail_outbox`，把注册验证、邀请、密码重置的一次性凭据作为加密持久意图与业务
事务共同提交。接口只接受稳定 kind、收件地址与模板数据；AES-256-GCM payload 使用独立 key，AAD
绑定 outbox id/kind/recipient。日志、查询与失败码均不含明文 payload。

领取在短事务内以 SKIP LOCKED、两分钟租约与随机领取 token 完成。失租可重新领取；完成和失败
必须匹配领取 token，旧 worker 不得改写新领取。SMTP 在提交后执行，最多八次有界退避与抖动；
供方确认接收即 completed/accepted，不承诺收件箱或恰好一次。原 messageId 保持不变。

第一次实际发送前把最终主题/正文与链接加密固化到原意图，并确认租约仍有效；后续自动或人工
恢复沿用该内容，不因配置/模板升级改变已经发送过的邮件。固化失败不得开始SMTP。

业务凭据资格由 sync 通过各概念只读 query 核对。本模块不查询 IAM 表；过期/使用/替换/撤销/
注销后 completed/obsolete，不再重发或续签。人工重试仅恢复原失败意图，资格仍须重验。
日志与公开查询只含稳定 id、kind、脱敏收件人、状态、attempt、时间、有限 error code 和 traceId。
注销同步清地址及密文；历史不可解密意图 failed/payload_unreadable，不能借恢复自动签发新凭据。

生产通过 SMTP 环境配置启用发送；本地及 E2E 使用隔离 SMTP 接收器。密钥须跨重启保存，
临时密钥仅用于无持久恢复承诺的单次测试。开发与 E2E 通过 Mailpit 接收真实 SMTP 并查询其
HTTP API；应用日志不输出邮件链接或一次性凭据，也不得被当作发送证据。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `MailDeliveryApi.accepted` | `lease: MailDeliveryApi.Lease` | `void` |
| `MailDeliveryApi.claim` | `` | `Optional<MailDeliveryApi.Lease>` |
| `MailDeliveryApi.eraseRecipient` | `recipient: String` | `void` |
| `MailDeliveryApi.failed` | `lease: MailDeliveryApi.Lease, code: String, retryable: boolean` | `void` |
| `MailDeliveryApi.list` | `tenant: UUID, before: KeysetCursor, limit: int` | `List<MailDeliveryApi.View>` |
| `MailDeliveryApi.obsolete` | `lease: MailDeliveryApi.Lease` | `void` |
| `MailDeliveryApi.payload` | `lease: MailDeliveryApi.Lease` | `Map<String, String>` |
| `MailDeliveryApi.prepare` | `lease: MailDeliveryApi.Lease, payload: Map<String, String>` | `boolean` |
| `MailDeliveryApi.retry` | `id: UUID` | `boolean` |
| `MailDeliveryApi.view` | `id: UUID` | `Optional<MailDeliveryApi.View>` |
| `MailOutboxApi.enqueue` | `kind: MailOutboxApi.Kind, recipient: String, payload: Map<String, String>` | `MailOutboxApi.MessageId` |
| `MailTransport.send` | `messageId: UUID, recipient: String, subject: String, text: String` | `void` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `MailDeliveryApi.Lease` | `id: UUID, token: UUID, kind: String, recipient: String, encryptedPayload: String, attempt: int` |
| `MailDeliveryApi.View` | `id: UUID, kind: String, recipient: String, tenantId: UUID, status: String, attempt: int, nextRunAt: Instant, error: String, traceId: UUID, outcome: String, createdAt: Instant, completedAt: Instant, canRetry: boolean` |
| `MailOutboxApi.Kind` | `VERIFICATION / INVITATION / PASSWORD_RESET` |
| `MailOutboxApi.MessageId` | `value: UUID` |

<!-- interface-contract:end -->

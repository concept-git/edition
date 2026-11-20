# concept Webhook

## purpose

让外部订阅者可靠收到选定范围的完成事件，并能追踪投递结果。

## state

subscriptions: WebhookId -> (tenant: TenantId, url: HTTPS, scope: Scope, events: set EventType, active: Bool, encryptedSecret: Bytes)
deliveries: (WebhookId, EventId) -> lone (status: Status, attempts: Nat, nextRunAt: Time, lease: lone Token)

初态为空。自动扇出对每个订阅/eventId 至多一条投递；自动尝试最多八次，失租也消耗预算。列表不返回密钥，停用后不领取也不回补漏过的事件。

## actions

create [tenant: TenantId; url: String; scopeType: String; scopeId: optional UUID; events: set String] => [created: Created]
  requires validConfiguration 为 true；ensures 建立订阅并仅在创建结果返回一次明文密钥
update [id: WebhookId; url: String; scopeType: String; scopeId: optional UUID; events: set String; active: Bool] => []
  requires 配置有效；ensures 更新订阅与启停状态
rotate [id: WebhookId] => [secret: String]
  ensures 更换加密保存的签名密钥
capture [tenant: TenantId; event: Event] => []
  ensures 在事件事务内按活动订阅扇出，重复 eventId 不新增自动投递
claim [limit: Int] => [claims: seq Claim]
  ensures 以 token 和 90 秒租约有界领取可投递项
finish [claim: Claim; status: optional Int; error: String; durationMs: Long] => []
  ensures 仅当前 token 可记回执；迟到回执不覆盖新领取
redeliver [webhook: WebhookId; delivery: DeliveryId] => [accepted: Bool]
  ensures 明确人工重发在同 eventId 下增加尝试

## operational principle

after create [tenant: t; url: u; scopeType: s; scopeId: i; events: e] => [created: c]
then capture [tenant: t; event: matching(e)] => []，claim [limit: n] => [claims: q]，finish [claim: q; status: 200; error: null; durationMs: d] => []；
订阅者得到签名事件，运营者可在 deliveries/attempts 中追踪结果。

## queries

validConfiguration [value: String; scope: String; id: optional UUID; events: set String] => [valid: Bool]
  returns 仅接受已知事件、tenant/space/site 范围及无 userinfo/fragment 的 HTTPS URL
view [id: WebhookId] => [subscription: optional Subscription]
list [before: WebhookId; limit: Int] => [subscriptions: seq Subscription]
deliveries [webhook: WebhookId; before: DeliveryId; limit: Int] => [deliveries: seq Delivery]
attempts [delivery: DeliveryId] => [attempts: seq Attempt]
secret [encrypted: String] => [secret: String]
  returns 仅供内部投递器使用，不进入公开视图

## notes

平台类概念；与产品概念采用相同规格形式。以下保留实现边界与运维约束。

订阅属于tenant，可限制space/site。完成事件同事务扇出；eventId稳定、每订阅唯一投递。至少一次、有界8次自动尝试，领取token+90s租约，乱序回执CAS；人工重发同eventId新增尝试。停用阻止领取且不回补漏过事件。密钥AES-GCM保存，DNS发送时验证每个地址，不跟随重定向。列表无秘密。输入/输出与HTTP层只通过sync编排。

线上格式遵循 Standard Webhooks v1，接收方可直接使用其标准库校验：
- 密钥为 `whsec_` 加 32 字节随机数的 base64；签名键是去前缀后的解码字节。
- 请求头 `webhook-id`（= eventId，重发不变）、`webhook-timestamp`（Unix 秒）、`webhook-signature`（`v1,` 加 base64(HMAC-SHA256(键, id.timestamp.rawBody))）。
- 载荷 `{type, timestamp, data:{resourceId, spaceId, siteId, outcome, requestId}}`；只含稳定 ID、动作状态及时间，缺失范围为 null。

`io.space.webhooks.allowed-hosts` 精确命中的主机只豁免公网地址检查，仍须 HTTPS 且不跟随重定向；默认空，仅供运维明示信任的内网接收端与隔离验收。

失租同样消耗自动尝试预算：第8次租约到期后，领取器先将其标记failed并清除token，不再外发；迟到回执不能复活耗尽任务。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `WebhookApi.attempts` | `delivery: UUID` | `List<WebhookApi.Attempt>` |
| `WebhookApi.capture` | `tenant: UUID, event: WebhookApi.Event` | `void` |
| `WebhookApi.claim` | `limit: int` | `List<WebhookApi.Claim>` |
| `WebhookApi.create` | `tenant: UUID, url: String, scopeType: String, scopeId: UUID, events: Set<String>` | `WebhookApi.Created` |
| `WebhookApi.deliveries` | `webhook: UUID, before: UUID, limit: int` | `List<WebhookApi.Delivery>` |
| `WebhookApi.finish` | `claim: WebhookApi.Claim, status: Integer, error: String, durationMs: long` | `void` |
| `WebhookApi.list` | `before: UUID, limit: int` | `List<WebhookApi.Subscription>` |
| `WebhookApi.redeliver` | `webhook: UUID, delivery: UUID` | `boolean` |
| `WebhookApi.rotate` | `id: UUID` | `String` |
| `WebhookApi.secret` | `encrypted: String` | `String` |
| `WebhookApi.update` | `id: UUID, url: String, scopeType: String, scopeId: UUID, events: Set<String>, active: boolean` | `void` |
| `WebhookApi.view` | `id: UUID` | `Optional<WebhookApi.Subscription>` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `WebhookApi.Attempt` | `id: UUID, startedAt: Instant, responseCode: Integer, error: String, durationMs: Long` |
| `WebhookApi.Claim` | `id: UUID, webhookId: UUID, eventId: UUID, token: UUID, url: String, encryptedSecret: String, payload: String, attempt: int` |
| `WebhookApi.Created` | `subscription: WebhookApi.Subscription, secret: String` |
| `WebhookApi.Delivery` | `id: UUID, eventId: UUID, eventType: String, status: String, attempts: int, nextRunAt: Instant, responseCode: Integer, createdAt: Instant` |
| `WebhookApi.Event` | `id: UUID, type: String, time: Instant, resourceId: UUID, spaceId: UUID, siteId: UUID, outcome: String, requestId: String` |
| `WebhookApi.Subscription` | `id: UUID, tenantId: UUID, url: String, scopeType: String, scopeId: UUID, events: Set<String>, active: boolean, createdAt: Instant` |

<!-- interface-contract:end -->

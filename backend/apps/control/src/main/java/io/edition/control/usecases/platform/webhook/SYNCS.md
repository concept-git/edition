# syncs: Webhook订阅与投递

租户根admin，TOKEN不可用；资源限制必须真实属于租户。创建/更新/轮换/重发全部强制幂等键并审计。秘密只在创建与轮换响应返回、幂等响应仍加密。配置HTTPS、无userinfo/fragment，字段事件封闭。scope=tenant覆盖全部事件，space仅匹配带spaceId的事件，site仅匹配带siteId的事件，不能把release.promoted当上线通知。

```text
sync listWebhooks
// implementation: ListWebhooksUseCase#listWebhooks
when {
  Requesting/listWebhooks: [tenant: ?tenant; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  guard: [chain: [?tenant]; op: admin]
}
then {
  Requesting/respond: [request: ?request]
}

sync createWebhook
// implementation: CreateWebhookUseCase#createWebhook
when {
  Requesting/createWebhook: [tenant: ?tenant; url: ?url; scopeType: ?scopeType; scopeId: ?scopeId; events: ?events] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  guard: [chain: [?tenant]; op: admin]
  ResourceChain: [tenant: ?tenant; scopeType: ?scopeType; scopeId: ?scopeId]
}
then {
  Webhook.subscribe: [tenant: ?tenant; url: ?url; scopeType: ?scopeType; scopeId: ?scopeId; events: ?events] => [subscription: ?sub; secret: ?secret]
  Requesting/respond: [request: ?request; subscription: ?sub; secret: ?secret]
}

sync updateWebhook
// implementation: UpdateWebhookUseCase#updateWebhook
when {
  Requesting/updateWebhook: [tenant: ?tenant; id: ?id; url: ?url; scopeType: ?scopeType; scopeId: ?scopeId; events: ?events; active: ?active] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  guard: [chain: [?tenant]; op: admin]
  ResourceChain: [tenant: ?tenant; scopeType: ?scopeType; scopeId: ?scopeId]
}
then {
  Webhook.update: [id: ?id; url: ?url; scopeType: ?scopeType; scopeId: ?scopeId; events: ?events; active: ?active]
}

sync rotateWebhook
// implementation: RotateWebhookUseCase#rotateWebhook
when {
  Requesting/rotateWebhook: [tenant: ?tenant; id: ?id] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  guard: [chain: [?tenant]; op: admin]
}
then {
  Webhook.rotate: [id: ?id] => [secret: ?secret]
  Requesting/respond: [request: ?request; secret: ?secret]
}

sync listDeliveries
// implementation: ListDeliveriesUseCase#listDeliveries
when {
  Requesting/listDeliveries: [tenant: ?tenant; id: ?id; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  guard: [chain: [?tenant]; op: admin]
}
then {
  Requesting/respond: [request: ?request]
}

sync redeliver
// implementation: RedeliverUseCase#redeliver
when {
  Requesting/redeliver: [tenant: ?tenant; id: ?id; delivery: ?delivery] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  guard: [chain: [?tenant]; op: admin]
  // 订阅启用且投递为 failed/completed
}
then {
  Webhook.redeliver: [id: ?id; delivery: ?delivery]
}
```

同步事件旁路在源事务内capture：Release.Promoted/Flagged/ValidationRejected、Page.Published、CustomDomain.Verified；只扇出实际完成事件，源回滚同时回滚投递。交付终态由独立投递回执持久事件承接。
错误：不存在resource_not_found404、输入validation_failed422、未启用webhook_disabled409、不可重发webhook_delivery_not_replayable409。发送超时/429/5xx有界退避；停用不领取；8次失败进入failed，可人工重发。界面逐项解释状态。

创建和更新在写入前校验 HTTPS 地址、事件清单及 scopeType/scopeId 配对，非法返回 `validation_failed`；创建时遵守 active 初始值。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `CreateWebhookUseCase.createWebhook` | `credential: String, tenant: UUID, input: WebhookTypes.Configuration, key: String` | `FlowResponse<WebhookTypes.SecretResult>` |
| `ListDeliveriesUseCase.listDeliveries` | `credential: String, tenant: UUID, id: UUID, cursor: UUID, limit: int` | `WebhookTypes.DeliveryPage` |
| `ListWebhooksUseCase.listWebhooks` | `credential: String, tenant: UUID, before: UUID, limit: int` | `WebhookTypes.SubscriptionPage` |
| `RedeliverUseCase.redeliver` | `credential: String, tenant: UUID, id: UUID, delivery: UUID, key: String` | `void` |
| `RotateWebhookUseCase.rotateWebhook` | `credential: String, tenant: UUID, id: UUID, key: String` | `FlowResponse<WebhookTypes.SecretResult>` |
| `UpdateWebhookUseCase.updateWebhook` | `credential: String, tenant: UUID, id: UUID, input: WebhookTypes.Configuration, key: String` | `FlowResponse<WebhookTypes.Subscription>` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `WebhookTypes.Attempt` | `id: UUID, startedAt: Instant, responseCode: Integer, error: String, durationMs: Long` |
| `WebhookTypes.Configuration` | `url: String, scopeType: String, scopeId: UUID, events: Set<String>, active: boolean` |
| `WebhookTypes.DeliveryPage` | `items: List<WebhookTypes.Delivery>, nextCursor: UUID` |
| `WebhookTypes.Delivery` | `id: UUID, eventId: UUID, eventType: String, status: String, attempts: int, nextRunAt: Instant, responseCode: Integer, createdAt: Instant, history: List<WebhookTypes.Attempt>` |
| `WebhookTypes.SecretResult` | `subscription: WebhookTypes.Subscription, secret: String` |
| `WebhookTypes.SubscriptionPage` | `items: List<WebhookTypes.Subscription>, nextCursor: UUID, eventTypes: Set<String>` |
| `WebhookTypes.Subscription` | `id: UUID, url: String, scopeType: String, scopeId: UUID, events: Set<String>, active: boolean, createdAt: Instant` |

<!-- interface-contract:end -->

# flow: mail management

```text
sync listMailJobs
// implementation: ListMailJobsUseCase#listMailJobs
when {
  Requesting/listMailJobs: [tenant: ?tenant; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  ?tenant 非空 ⇒ TenantAccess: [tenant: ?tenant; principal: ?actor]
                 guard: [chain: [?tenant]; op: admin]
  ?tenant 空 ⇒ PlatformOperatorGuard.require
}
then {
  Requesting/respond: [request: ?request]
}

sync retryMailJob
// implementation: RetryMailJobUseCase#retryMailJob
when {
  Requesting/retryMailJob: [tenant: ?tenant; messageId: ?messageId] => [request: ?request]
}
where {
  ?tenant 非空 ⇒ TenantAccess: [tenant: ?tenant; principal: ?actor]
                 guard: [chain: [?tenant]; op: admin]
  ?tenant 空 ⇒ PlatformOperatorGuard.require
  // message belongs to the requested scope
}
then {
  MailOutbox.retry: [messageId: ?messageId]
}
```

Errors: resource_not_found / permission_denied / platform_operator_required / invalid_cursor.

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `ListMailJobsUseCase.listMailJobs` | `credential: String, tenant: UUID, cursor: String, limit: int` | `MailAdminTypes.MailJobPage` |
| `RetryMailJobUseCase.retryMailJob` | `credential: String, tenant: UUID, messageId: UUID, key: String` | `FlowResponse<MailAdminTypes.MailJob>` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `MailAdminTypes.MailJobPage` | `items: List<MailAdminTypes.MailJob>, nextCursor: String` |
| `MailAdminTypes.MailJob` | `id: UUID, kind: String, recipient: String, tenantId: UUID, status: String, attempt: int, nextRunAt: Instant, error: String, traceId: UUID, outcome: String, createdAt: Instant, completedAt: Instant, canRetry: boolean` |

<!-- interface-contract:end -->

MailJob 的 canRetry 同时要求当前凭据 operations:write；只读 PAT 不展示重试能力。

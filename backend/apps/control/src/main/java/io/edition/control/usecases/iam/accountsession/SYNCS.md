# syncs: 本人账户与设备

> IAM `accountsession` flow 的唯一 sync 规格；共享约定见 [../SYNCS.md](../SYNCS.md)。

## flow: 本人账户与设备

触发: `Requesting/profile` / `Requesting/updateProfile` / `Requesting/listSessions` / `Requesting/endSession`
`touch` 由 SessionTouchFilter 在已认证请求上触发，不是独立 HTTP 入口。

```text
sync profile
// implementation: ProfileUseCase#profile
when {
  Requesting/profile: [principal: ?principal] => [request: ?request]
}
then {
  User/_accountProfile: [user: ?principal] => [profile: ?profile]
  tenantsOf
}

query tenantsOf
when {
  Requesting/profile: [principal: ?principal] => [request: ?request]
}
where {
  Membership/_groupsOf: [member: ?principal] => [groups: ?groups]
}
then {
  TenantRegistry.viewsOf: [tenantGroups: ?groups] => [tenants: ?tenants]
}

sync updateProfile
// implementation: UpdateProfileUseCase#updateProfile
when {
  Requesting/updateProfile: [principal: ?principal; name: ?name; locale: ?locale; avatar: ?avatar] => [request: ?request]
}
then {
  User/updateProfile: [user: ?principal; name: ?name; locale: ?locale; avatar: ?avatar] => [profile: ?profile]
  tenantsOf
}

sync listSessions
// implementation: ListSessionsUseCase#listSessions
when {
  Requesting/listSessions: [principal: ?principal; cursor: ?cursor; limit: ?limit; currentSession: ?current] => [request: ?request]
}
then {
  Session/_listOf: [principal: ?principal; cursor: ?cursor; limit: ?limit; currentSession: ?current]
}

sync endSession
// implementation: EndSessionUseCase#endSession
when {
  Requesting/endSession: [principal: ?principal; session: ?session] => [request: ?request]
}
then {
  Session/end: [session: ?session; requester: ?principal]
}

sync touch
// implementation: TouchUseCase#touch
when {
  Requesting/authenticated: [session: ?session] => []
}
then {
  Session/touch: [session: ?session]
}
```

所有入口要求有效管理 User 会话；tenantsOf 仅取 TENANT group，登记处缺失项省略，按 name 排序。
TenantRegistry 是平台概念登记处；`Tenant` 身份本身无状态机。updateProfile 的 Rejected 对应 422 profile_invalid。
HTTP `PUT /me` 完整替换本人资料：name、locale、avatar 三个字段必须显式出现；locale/avatar 允许 null 表示清空，遗漏字段拒绝且不写入。旧 `PATCH /me` 保留原完整替换行为并标记弃用；新客户端使用 PUT，不能把 PATCH 误解为局部更新。
touch 为异步尽力活跃心跳，5 分钟节流、不延长会话，无 HTTP 独立响应。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `EndSessionUseCase.endSession` | `principal: UUID, session: UUID` | `void` |
| `ListSessionsUseCase.listSessions` | `principal: UUID, cursor: String, limit: int, current: UUID` | `AccountSessionTypes.Sessions` |
| `ProfileUseCase.profile` | `principal: UUID` | `AccountSessionTypes.Profile` |
| `TouchUseCase.touch` | `session: UUID` | `void` |
| `UpdateProfileUseCase.updateProfile` | `principal: UUID, name: String, locale: String, avatar: String` | `AccountSessionTypes.Profile` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `AccountSessionTypes.Device` | `name: String, browser: String, os: String` |
| `AccountSessionTypes.Profile` | `id: UUID, email: String, name: String, avatar: String, locale: String, verified: boolean, status: String, platformOperator: boolean, tenants: List<AccountSessionTypes.TenantMembership>` |
| `AccountSessionTypes.SessionView` | `id: UUID, device: AccountSessionTypes.Device, ipApproximate: String, createdAt: Instant, lastSeenAt: Instant, expiresAt: Instant, current: boolean` |
| `AccountSessionTypes.Sessions` | `sessions: List<AccountSessionTypes.SessionView>, nextCursor: String` |
| `AccountSessionTypes.TenantMembership` | `id: UUID, name: String, role: String, status: String` |

<!-- interface-contract:end -->

前端完成边界：业务成功与后续刷新、导航分离；后续故障不重新提交已完成动作。身份结束后的完成反馈在应用外层保留。


## Implementation policy ownership

`AccountTenants` owns `tenantsOf`. These names denote entry policy, refusal translation, or a read projection. They do not create completion events or persist rule identities. Protected effects retain the original transaction, lock, and tenant scope.

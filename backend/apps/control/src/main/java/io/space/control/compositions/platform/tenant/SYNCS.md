# syncs: 租户开通与冻结

> Platform `tenant` flow 的唯一 sync 规格；platformOperator 模板与记法声明见
> [../SYNCS.md](../SYNCS.md)，app 组合与 guard 模板见 [../../SYNCS.md](../../SYNCS.md)。
> 入口是平台运维面（`/admin`），按"跨组 flow 按入口 Requesting 动作的归属组落位"落在 platform 组。

## flow: 租户开通与冻结

触发: `Requesting.provisionTenant (name, ownerEmail, credential)` / `Requesting.listTenants` /
`Requesting.suspendTenant` / `Requesting.resumeTenant`

```text
sync provisionTenant
// implementation: ProvisionTenantUseCase#provisionTenant
when {
  Requesting/provisionTenant: [name: ?name; ownerEmail: ?ownerEmail] => [request: ?request]
}
where {
  PlatformOperatorGuard.require
}
then {
  TenantRegistry/provision: [name: ?name]
}

mediator branch tenantNameInvalid
when {
  Requesting/provisionTenant: [name: ?name; ownerEmail: ?ownerEmail] => [request: ?request]
  TenantRegistry/provision: [name: ?name] => [result: InvalidName(?reason)]
}
then {
  Requesting/respond: [request: ?request; error: TenantNameInvalid]
}

sync seatOwner
// implementation: SeatOwnerOnCompletion#seatOwner
when {
  Requesting/provisionTenant: [name: ?name; ownerEmail: ?ownerEmail] => [request: ?request]
  TenantRegistry/provision: [name: ?name] => [result: Provisioned(?tenantView)]
}
where {
  ?tenant = ?tenantView.id
  User/_byEmail: [email: ?ownerEmail] => [user: ?u]
  User/_profile: [user: ?u] => [verified: true]
  User/_isActive: [user: ?u] => [active: true]
}
then {
  Membership/add: [group: ?tenant; member: ?u; role: owner]
  // 经 grantOwnerRootAccess 取得租户根 admin
  Requesting/respond: [request: ?request; tenant: ?tenant]
}

sync inviteOwner
// implementation: InviteOwnerOnCompletion#inviteOwner
when {
  Requesting/provisionTenant: [name: ?name; ownerEmail: ?ownerEmail] => [request: ?request]
  TenantRegistry/provision: [name: ?name] => [result: Provisioned(?tenantView)]
}
where {
  ?tenant = ?tenantView.id
  User/_byEmail: [email: ?ownerEmail] 返回零绑定；或返回的用户未验证/已停用
}
then {
  Membership/invite: [group: ?tenant; email: ?ownerEmail; role: owner] => [invite: ?invite; token: ?token]
  // 明文 token 随开通响应返回一次，并在同事务写加密邮件 outbox
  Requesting/respond: [request: ?request; tenant: ?tenant; token: ?token]
}

sync listTenants
// implementation: ListTenantsUseCase#listTenants
when {
  Requesting/listTenants: [cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  PlatformOperatorGuard.require
}
then {
  Requesting/respond: [request: ?request]
  // ownerCount 逐租户在其上下文内读 Membership；平台面自身跨租户，只能逐个进入
}

sync suspendTenant
// implementation: SuspendTenantUseCase#suspendTenant
when {
  Requesting/suspendTenant: [tenant: ?tenant] => [request: ?request]
}
where {
  PlatformOperatorGuard.require
}
then {
  TenantRegistry/suspend: [tenant: ?tenant]
  // 不结束会话、不影响该用户在其他租户的操作；交付面冻结随票 21/23
}

sync resumeTenant
// implementation: ResumeTenantUseCase#resumeTenant
when {
  Requesting/resumeTenant: [tenant: ?tenant] => [request: ?request]
}
where {
  PlatformOperatorGuard.require
}
then {
  TenantRegistry/resume: [tenant: ?tenant]
}

mediator branch platformOperatorRequired
when {
  Requesting/provisionTenant: [name: ?name; ownerEmail: ?ownerEmail] => [request: ?request]
}
where {
  PlatformOperatorGuard.require => [operator: false]
}
then {
  Requesting/respond: [request: ?request; error: PlatformOperatorRequired]
}

mediator branch tenantNotFound
when {
  Requesting/suspendTenant: [tenant: ?tenant] => [request: ?request]
}
where {
  Tenant._status: [tenant: ?tenant] => []
}
then {
  Requesting/respond: [request: ?request; error: TenantNotFound]
}
```

**开通的失败路径裁决**（backend/CLAUDE.md 二选一）：走**单库共享事务**——
登记与首个 owner 落座（或 owner 邀请）必须同时成交，否则会留下无人可管的空壳租户。

排除动作: `Tenant.rename`（改名走管理杂项模板，由租户 admin 自助；不随票 21）。

tenantNameInvalid 与 platformOperatorRequired 是开通/冻结/恢复入口的内联拒绝分支，
上文以 mediator branch 保留结果要求；入口直接使用现有错误类型与平台运营员 guard。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `InviteOwnerOnCompletion.inviteOwner` | `binding: TenantSignals.InviteOwner` | `void` |
| `ListTenantsUseCase.listTenants` | `credential: String, cursor: String, limit: int` | `TenantTypes.Tenants` |
| `ProvisionTenantUseCase.provisionTenant` | `credential: String, name: String, ownerEmail: String` | `TenantTypes.Provisioned` |
| `ResumeTenantUseCase.resumeTenant` | `credential: String, tenant: UUID` | `void` |
| `SeatOwnerOnCompletion.seatOwner` | `binding: TenantSignals.SeatOwner` | `void` |
| `SuspendTenantUseCase.suspendTenant` | `credential: String, tenant: UUID` | `void` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `TenantSignals.InviteOwner` | `group: MembershipApi.Group, ownerEmail: String, tenant: TenantRegistryApi.View, completion: RuleCompletion<TenantTypes.Provisioned>` |
| `TenantSignals.SeatOwner` | `group: MembershipApi.Group, owner: MembershipApi.MemberId, tenant: TenantRegistryApi.View, completion: RuleCompletion<TenantTypes.Provisioned>` |
| `TenantTypes.Provisioned` | `tenant: TenantTypes.TenantView, ownerInviteToken: String` |
| `TenantTypes.TenantView` | `id: UUID, name: String, status: String, ownerCount: long, createdAt: Instant` |
| `TenantTypes.Tenants` | `tenants: List<TenantTypes.TenantView>, nextCursor: String` |

<!-- interface-contract:end -->


## Implementation policy ownership

`TenantLookup` owns `tenantNotFound`. These names denote entry policy, refusal translation, or a read projection. They do not create completion events or persist rule identities. Protected effects retain the original transaction, lock, and tenant scope.


## Native completion protocol

`TenantRelay` publishes the bindings in `TenantSignals` synchronously at the corresponding call-completion or entry-continuation point. Each binding carries a unique occurrence and the current root flow. It is local execution data, not a second business state. Receiving rules claim their occurrence before effects and record one response. Equal-valued later requests use distinct occurrences; another flow cannot supply this binding. A missing response fails explicitly.

These continuations use the existing synchronous Java transaction and Spring event publisher. Receiving listeners must remain synchronous: no `@Async`, after-commit listener, durable replay, or independent transaction is added. Failures propagate to the caller and retain the original rollback/refusal policy. Persistent asynchronous delivery continues through the existing outboxes.

The native implementation retains the documented ordered transactional synchronization dialect. The typed binding is emitted only at the declared request/result branch; it does not join arbitrary historical concept events.

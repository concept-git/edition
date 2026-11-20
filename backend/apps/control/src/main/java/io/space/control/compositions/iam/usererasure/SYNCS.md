# syncs: 用户注销（合规删除）

> IAM `usererasure` flow 的唯一 sync 规格；共享约定见 [../SYNCS.md](../SYNCS.md)。

## flow: 全局 User 查询与生命周期

触发: `Requesting/searchUsers` / `Requesting/userDetail` / `Requesting/deactivateUser` /
`Requesting/reactivateUser` / `Requesting/eraseSelf` / `Requesting/eraseUser`

```text
sync searchUsers
// implementation: SearchUsersUseCase#searchUsers
when {
  Requesting/searchUsers: [query: ?q; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  PlatformOperatorGuard.require
  length(normalize(?q)) ≥ 3
}
then {
  User/_search: [query: ?q; cursor: ?cursor; limit: ?limit]
}

sync userDetail
// implementation: UserDetailUseCase#userDetail
when {
  Requesting/userDetail: [user: ?user] => [request: ?request]
}
where {
  PlatformOperatorGuard.require
  User/_accountProfile: [user: ?user] => [profile: ?profile]
  Membership/_groupsOf: [member: ?user] => [groups: ?groups]
}
then {
  Requesting/respond: [request: ?request; profile: ?profile; groups: ?groups]
}

sync deactivateUser
// implementation: DeactivateUserUseCase#deactivateUser
when {
  Requesting/deactivateUser: [user: ?user; confirmationEmail: ?email; currentPassword: ?password] => [request: ?request]
}
where {
  PlatformOperatorGuard.require => [operator: ?operator]
  confirm(?operator.currentPassword, ?user.email = ?email)
}
then {
  User/deactivate: [user: ?user]
  Session/endAll: [principal: ?user]
  对 ApiToken/_ownedBy: [owner: ?user; includeRevoked: false] 的每一项
    ApiToken/revoke: [token: ?token]
    Permission/clearPrincipal: [principal: ?token]
}

sync reactivateUser
// implementation: ReactivateUserUseCase#reactivateUser
when {
  Requesting/reactivateUser: [user: ?user] => [request: ?request]
}
where {
  PlatformOperatorGuard.require
}
then {
  User/reactivate: [user: ?user]
}

sync eraseSelf
// implementation: EraseSelfUseCase#eraseSelf
when {
  Requesting/eraseSelf: [confirmationEmail: ?email; currentPassword: ?password] => [request: ?request]
}
where {
  Session/_principal: [session: ?sid] => [principal: ?u]
  confirm(?u.currentPassword, ?u.email = ?email)
  Membership/_lockGroupsOf: [member: ?u] => [groups: ?groups]
  每个 owner 群体另有 owner
}
then {
  User/deactivate: [user: ?u]
  eraseAtomically(?u, originalEmail)
}

sync eraseUser
// implementation: EraseUserUseCase#eraseUser
when {
  Requesting/eraseUser: [user: ?user; confirmationEmail: ?email; currentPassword: ?password] => [request: ?request]
}
where {
  PlatformOperatorGuard.require => [operator: ?operator]
  confirm(?operator.currentPassword, ?user.email = ?email)
  User/_accountProfile: [user: ?user] => [status: deactivated | erased]
  Membership/_lockGroupsOf: [member: ?user] => [groups: ?groups]
  每个 owner 群体另有 owner
}
then {
  eraseAtomically(?user, originalEmail)
}

mediator branch deactivateConfirmationRejected
when {
  Requesting/deactivateUser: [user: ?user; confirmationEmail: ?email; currentPassword: ?password] => [request: ?request]
}
where {
  confirm(?password, ?user.email = ?email) => [ok: false]
}
then {
  Requesting/respond: [request: ?request; error: EraseConfirmationInvalid]
}

mediator branch eraseSelfConfirmationRejected
when {
  Requesting/eraseSelf: [confirmationEmail: ?email; currentPassword: ?password] => [request: ?request]
}
where {
  Session/_principal: [session: ?sid] => [principal: ?u]
  confirm(?password, ?u.email = ?email) => [ok: false]
}
then {
  Requesting/respond: [request: ?request; error: EraseConfirmationInvalid]
}

mediator branch eraseUserConfirmationRejected
when {
  Requesting/eraseUser: [user: ?user; confirmationEmail: ?email; currentPassword: ?password] => [request: ?request]
}
where {
  confirm(?password, ?user.email = ?email) => [ok: false]
}
then {
  Requesting/respond: [request: ?request; error: EraseConfirmationInvalid]
}

mediator branch eraseRejected
when {
  Requesting/eraseUser: [user: ?u] => [request: ?request]
  User/erase: [user: ?u] => [error: MustBeDeactivated]
}
then {
  Requesting/respond: [request: ?request; error: MustBeDeactivated]
}

mediator branch selfEraseRejected
when {
  Requesting/eraseSelf: [] => [request: ?request]
  User/erase: [user: ?u] => [error: MustBeDeactivated]
}
then {
  Requesting/respond: [request: ?request; error: MustBeDeactivated]
}

mediator branch ownershipTransferRequired
when {
  Requesting/eraseUser: [user: ?user] => [request: ?request]
}
where {
  Membership/_lockGroupsOf: [member: ?user] => [groups: ?groups]
  ?groups 中存在 ?user 是唯一 owner 的 Tenant/Team
}
then {
  Requesting/respond: [request: ?request; error: OwnershipTransferRequired]
}

mediator branch selfOwnershipTransferRequired
when {
  Requesting/eraseSelf: [] => [request: ?request]
}
where {
  Session/_principal: [session: ?sid] => [principal: ?u]
  Membership/_lockGroupsOf: [member: ?u] => [groups: ?groups]
  ?groups 中存在 ?u 是唯一 owner 的 Tenant/Team
}
then {
  Requesting/respond: [request: ?request; error: OwnershipTransferRequired]
}
```

`eraseAtomically` 是同一数据库事务中的组合步骤：revoke + anonymize + clearPrincipal(token)，
Membership/revokeInvitesFor、逐一 Membership/remove、Permission/clearPrincipal(user)、
Audit.scrub、Session/eraseAll、User/erase，以及主库 reader-state 会话和历史清除。旧部署仍由已有清除意图处理其交付库历史。
Password/terminate 在同一主库事务删除密码和重设挑战；后续失败同时回滚用户擦除与凭据删除。
远端历史由 worker 调用交付库中的受限清除函数；失败按租约持续重试，不能把源事务与目标库称为原子事务。eraseRejected 也匹配
User/deactivate 或 reactivate 的 Erased。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `DeactivateUserUseCase.deactivateUser` | `credential: String, user: UUID, confirmationEmail: String, currentPassword: String, key: String` | `void` |
| `EraseSelfUseCase.eraseSelf` | `credential: String, confirmationEmail: String, currentPassword: String, key: String` | `void` |
| `EraseUserUseCase.eraseUser` | `credential: String, user: UUID, confirmationEmail: String, currentPassword: String, key: String` | `void` |
| `ReactivateUserUseCase.reactivateUser` | `credential: String, user: UUID, key: String` | `void` |
| `SearchUsersUseCase.searchUsers` | `credential: String, query: String, cursor: String, limit: int` | `UserErasureTypes.UserPage` |
| `UserDetailUseCase.userDetail` | `credential: String, user: UUID` | `UserErasureTypes.UserDetail` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `UserErasureTypes.MembershipSummary` | `type: String, id: UUID, tenantId: UUID, name: String, role: String, soleOwner: boolean` |
| `UserErasureTypes.RelatedGroup` | `type: String, id: UUID, tenantId: UUID, name: String` |
| `UserErasureTypes.UserDetail` | `id: UUID, email: String, name: String, avatar: String, locale: String, verified: boolean, status: String, platformOperator: boolean, memberships: List<UserErasureTypes.MembershipSummary>` |
| `UserErasureTypes.UserPage` | `users: List<UserErasureTypes.UserSummary>, nextCursor: String` |
| `UserErasureTypes.UserSummary` | `id: UUID, email: String, name: String, status: String, platformOperator: boolean, updatedAt: Instant` |

<!-- interface-contract:end -->

前端完成边界：业务成功与后续刷新、导航分离；后续故障不重新提交已完成动作。身份结束后的完成反馈在应用外层保留。
# Reader history is personal navigation state. Source-side historical rows are removed in
# the account transaction; reader-state rows are removed by the durable erasure intent.

## 管理 PAT 级联

用户停用在原事务调用 ManagementToken.revokeAll；恢复不恢复旧 PAT。用户擦除在原事务调用 ManagementToken.eraseAll，保留稳定 credentialId 审计锚而移除名称和秘密。

二次密码确认前先锁定 User；运营员与目标不同时按稳定 User ID 顺序取得两行锁，再验证密码和执行终结，避免与登录、改密、重设或相互停用形成反向锁序。

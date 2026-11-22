# syncs: 成员与邀请

> IAM `invitation` flow 的唯一 sync 规格；共享约定见 [../SYNCS.md](../SYNCS.md)。

## flow: 成员与邀请

触发: `Requesting/invite` / `Requesting/previewInvite` / `Requesting/acceptInvite` /
`Requesting/listMembers` / `Requesting/setMemberRole` / `Requesting/removeMember` /
`Requesting/listInvites` / `Requesting/revokeInvite`

本 flow 的管理链是 `[tenant]`。Team 管理入口见 ../team/SYNCS.md，接受邀请共用本 flow。

```text
sync invite
// implementation: InviteUseCase#invite
when {
  Requesting/invite: [group: ?group; email: ?email; role: ?role] => [request: ?request]
}
where {
  guard: [chain: 群体对应资源链; op: admin]
}
then {
  Membership/invite: [group: ?group; email: ?email; role: ?role] => [invite: ?invite; token: ?token]
  MailOutbox.enqueue: [kind: invite; email: ?email; token: ?token]
}

mediator branch inviteAlreadyMember
when {
  Requesting/invite: [group: ?group; email: ?email; role: ?role] => [request: ?request]
}
where {
  User/_byEmail: [email: ?email] => [user: ?u]
  Membership/_isMember: [group: ?group; member: ?u] => [member: true]
}
then {
  Requesting/respond: [request: ?request; error: AlreadyMember]
}

sync previewInvite
// implementation: PreviewInviteUseCase#previewInvite
when {
  Requesting/previewInvite: [token: ?token] => [request: ?request]
}
where {
  Membership/_invite: [invite: ?token] => [invite: ?view]
}
then {
  Requesting/respond: [request: ?request; view: ?view]
}

sync acceptInvite
// implementation: AcceptInviteUseCase#acceptInvite
when {
  Requesting/acceptInvite: [token: ?token] => [request: ?request]
}
where {
  Session/_principal: [session: ?sid] => [principal: ?u]
  Membership/_invite: [invite: ?token] => [email: ?email]
  User/_accountProfile: [user: ?u] => [email: ?email]
}
then {
  Membership/accept: [invite: ?token; member: ?u]
}

mediator branch acceptInviteEmailMismatch
when {
  Requesting/acceptInvite: [token: ?token] => [request: ?request]
}
where {
  Session/_principal: [session: ?sid] => [principal: ?u]
  Membership/_invite: [invite: ?token] => [email: ?invited]
  User/_accountProfile: [user: ?u] => [email: ?actual]
  ?actual ≠ ?invited
}
then {
  Requesting/respond: [request: ?request; error: InviteEmailMismatch]
}

mediator branch inviteInvalid
when {
  Membership/accept: [invite: ?token; member: ?u] => [error: Invalid]
}
then {
  Requesting/respond: [request: ?request; error: InviteInvalid]
}

sync listMembers
// implementation: ListMembersUseCase#listMembers
when {
  Requesting/listMembers: [group: ?group; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  guard: [chain: 群体对应资源链; op: admin]
}
then {
  Membership/_membersOf: [group: ?group; cursor: ?cursor; limit: ?limit]
}

sync listInvites
// implementation: ListInvitesUseCase#listInvites
when {
  Requesting/listInvites: [group: ?group; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  guard: [chain: 群体对应资源链; op: admin]
}
then {
  Membership/_invitesOf: [group: ?group; cursor: ?cursor; limit: ?limit]
}

sync setMemberRole
// implementation: SetMemberRoleUseCase#setMemberRole
when {
  Requesting/setMemberRole: [group: ?group; member: ?member; role: ?role] => [request: ?request]
}
where {
  guard: [chain: 群体对应资源链; op: admin]
}
then {
  Membership/setRole: [group: ?group; member: ?member; role: ?role]
}

sync removeMember
// implementation: RemoveMemberUseCase#removeMember
when {
  Requesting/removeMember: [group: ?group; member: ?member] => [request: ?request]
}
where {
  guard: [chain: 群体对应资源链; op: admin]
}
then {
  若 group=Tenant：Membership/_lockMembership: [group: ?group; member: ?member]
  再按稳定顺序锁 Team
  Membership/remove: [group: ?group; member: ?member]
  若 group=Tenant 且确实移除：同事务移出其全部 Team，并 Permission/clearPrincipal: [principal: ?member]
}

mediator branch lastOwnerProtected
when {
  Membership/setRole: [group: ?group; member: ?member; role: ?role] => [error: LastOwner]
}
then {
  Requesting/respond: [request: ?request; error: LastOwner]
}

sync revokeInvite
// implementation: RevokeInviteUseCase#revokeInvite
when {
  Requesting/revokeInvite: [tenant: ?tenant; invite: ?inviteId] => [request: ?request]
}
where {
  guard: [chain: 邀请所属群体资源链; op: admin]
}
then {
  Membership/revokeInvite: [group: tenant(?tenant); invite: ?inviteId]
}

sync grantOwnerRootAccess
// implementation: GrantOwnerRootAccessOnCompletion#grantOwnerRootAccess
when {
  Membership/add: [group: ?group; member: ?member; role: owner] => [group: ?group; member: ?member; role: owner]
}
then {
  Permission/grant: [resource: 群体根; principal: ?member; role: admin]
}

sync revokeOwnerRootAccess
// implementation: RevokeOwnerRootAccessOnCompletion#revokeOwnerRootAccess
when {
  Membership/remove: [group: ?group; member: ?member] => [group: ?group; member: ?member]
}
then {
  Permission/revoke: [resource: 群体根; principal: ?member]
}
```

accept 返回 AlreadyMember 时仍消费该邀请，HTTP 409 invite_already_accepted，不回滚消费。
Expired 对应 400 invite_expired。Membership.add 无通用直加入口。
`grantOwnerRootAccess` / `revokeOwnerRootAccess` 也匹配 setRole→owner 与 accept 成功且 role=owner；
revoke 也匹配 setRole→member。

拒绝的 mediator branch 由所属入口直接翻译动作结果或条件失败，不对应独立 Java 方法；错误码、违反项和事务结果保持上述契约。

接受邀请的 HTTP schema 名为 `InvitationAcceptance`，与统计接收结果区分。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `AcceptInviteUseCase.acceptInvite` | `principal: UUID, token: String` | `MembershipTypes.Accepted` |
| `GrantOwnerRootAccessOnCompletion.grantOwnerRootAccess` | `binding: MembershipSignals.GrantOwnerRootAccess` | `void` |
| `GrantOwnerRootAccessOnCompletion.grantOwnerRootAccess` | `group: MembershipApi.Group, member: MembershipApi.MemberId, role: MembershipApi.Role` | `void` |
| `InviteUseCase.invite` | `credential: String, tenant: UUID, email: String, role: String, idempotencyKey: String` | `FlowResponse<MembershipTypes.IssuedInvite>` |
| `ListInvitesUseCase.listInvites` | `credential: String, tenant: UUID, cursor: String, limit: int` | `MembershipTypes.Invites` |
| `ListMembersUseCase.listMembers` | `credential: String, tenant: UUID, cursor: String, limit: int` | `MembershipTypes.Members` |
| `PreviewInviteUseCase.previewInvite` | `token: String` | `MembershipTypes.InvitePreview` |
| `RemoveMemberUseCase.removeMember` | `credential: String, tenant: UUID, member: UUID` | `void` |
| `RevokeInviteUseCase.revokeInvite` | `credential: String, tenant: UUID, invite: UUID` | `void` |
| `RevokeOwnerRootAccessOnCompletion.revokeOwnerRootAccess` | `binding: MembershipSignals.RevokeOwnerRootAccess` | `void` |
| `RevokeOwnerRootAccessOnCompletion.revokeOwnerRootAccess` | `group: MembershipApi.Group, member: MembershipApi.MemberId` | `void` |
| `SetMemberRoleUseCase.setMemberRole` | `credential: String, tenant: UUID, member: UUID, role: String` | `void` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `MembershipSignals.GrantOwnerRootAccess` | `group: MembershipApi.Group, member: MembershipApi.MemberId, role: MembershipApi.Role, completion: RuleCompletion<Void>` |
| `MembershipSignals.RevokeOwnerRootAccess` | `group: MembershipApi.Group, member: MembershipApi.MemberId, completion: RuleCompletion<Void>` |
| `MembershipTypes.Accepted` | `kind: String, tenant: MembershipTypes.InviteGroup, team: MembershipTypes.InviteGroup, role: String` |
| `MembershipTypes.InviteGroup` | `id: UUID, name: String` |
| `MembershipTypes.InvitePreview` | `kind: String, tenant: MembershipTypes.InviteGroup, team: MembershipTypes.InviteGroup, email: String, role: String, expiresAt: Instant` |
| `MembershipTypes.InviteSummary` | `id: UUID, email: String, role: String, expiresAt: Instant, createdAt: Instant` |
| `MembershipTypes.Invites` | `items: List<MembershipTypes.InviteSummary>, nextCursor: String` |
| `MembershipTypes.IssuedInvite` | `invite: MembershipTypes.InviteSummary, token: String` |
| `MembershipTypes.MemberSummary` | `id: UUID, name: String, role: String, joinedAt: Instant` |
| `MembershipTypes.Members` | `items: List<MembershipTypes.MemberSummary>, nextCursor: String` |

<!-- interface-contract:end -->


## Implementation policy ownership

`MembershipChecks` owns `inviteAlreadyMember`, `acceptInviteEmailMismatch`. These names denote entry policy, refusal translation, or a read projection. They do not create completion events or persist rule identities. Protected effects retain the original transaction, lock, and tenant scope.


## Native completion protocol

`MembershipRelay` publishes the bindings in `MembershipSignals` synchronously at the corresponding call-completion or entry-continuation point. Each binding carries a unique occurrence and the current root flow. It is local execution data, not a second business state. Receiving rules claim their occurrence before effects and record one response. Equal-valued later requests use distinct occurrences; another flow cannot supply this binding. A missing response fails explicitly.

These continuations use the existing synchronous Java transaction and Spring event publisher. Receiving listeners must remain synchronous: no `@Async`, after-commit listener, durable replay, or independent transaction is added. Failures propagate to the caller and retain the original rollback/refusal policy. Persistent asynchronous delivery continues through the existing outboxes.

The native implementation retains the documented ordered transactional synchronization dialect. The typed binding is emitted only at the declared request/result branch; it does not join arbitrary historical concept events.

# syncs: Team 管理

## flow: Team 生命周期与成员

所有入口显式携带 tenantId。Team 管理链为 `[tenant, team]`。

```text
sync createTeam
// implementation: CreateTeamUseCase#createTeam
when {
  Requesting/createTeam: [tenant: ?tenant; name: ?name] => [request: ?request]
}
where {
  guard: [chain: [?tenant]; op: admin]
  Session/_principal: [session: ?sid] => [principal: ?creator]
}
then {
  Team/create: [scope: ?tenant; name: ?name] => [team: ?team]
  Membership/add: [group: ?team; member: ?creator; role: owner]
  Permission/grant: [resource: ?team; principal: ?creator; role: admin]
}

sync listTeams
// implementation: ListTeamsUseCase#listTeams
when {
  Requesting/listTeams: [tenant: ?tenant; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  Session/_principal: [session: ?sid] => [principal: ?actor]
}
then {
  Team/_list: [scope: ?tenant; cursor: ?cursor; limit: ?limit]
  非 tenant admin 再与 Membership/_groupsOf 求交
}

sync getTeam
// implementation: GetTeamUseCase#getTeam
when {
  Requesting/getTeam: [tenant: ?tenant; team: ?team] => [request: ?request]
}
where {
  team 属于 tenant 且调用方为 tenant admin 或 team member
}
then {
  Team/_view: [team: ?team]
}

sync renameTeam
// implementation: RenameTeamUseCase#renameTeam
when {
  Requesting/renameTeam: [tenant: ?tenant; team: ?team; name: ?name] => [request: ?request]
}
where {
  guard: [chain: [?tenant, ?team]; op: admin]
}
then {
  Team/rename: [team: ?team; name: ?name]
}

sync deleteTeam
// implementation: DeleteTeamUseCase#deleteTeam
when {
  Requesting/deleteTeam: [tenant: ?tenant; team: ?team] => [request: ?request]
}
where {
  guard: [chain: [?tenant, ?team]; op: admin]
}
then {
  Membership/clearGroup: [group: ?team]
  Permission/clearPrincipal: [principal: ?team]
  Permission/clearResource: [resource: ?team]
  Team/delete: [team: ?team]
}

sync inviteTeamMember
// implementation: InviteTeamMemberUseCase#inviteTeamMember
when {
  Requesting/inviteTeamMember: [tenant: ?tenant; team: ?team; email: ?email; role: ?role] => [request: ?request]
}
where {
  guard: [chain: [?tenant, ?team]; op: admin]
  User/_byEmail: [email: ?email] => [user: ?u]
  Membership/_isMember: [group: ?tenant; member: ?u] => [member: true]
}
then {
  Membership/invite: [group: ?team; email: ?email; role: ?role]
}

mediator branch tenantMembershipRequired
when {
  Requesting/inviteTeamMember: [tenant: ?tenant; team: ?team; email: ?email; role: ?role] => [request: ?request]
}
where {
  目标不是当前租户成员
}
then {
  Requesting/respond: [request: ?request; error: TenantMembershipRequired]
}

sync listTeamMembers
// implementation: ListTeamMembersUseCase#listTeamMembers
when {
  Requesting/listTeamMembers: [tenant: ?tenant; team: ?team; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  guard: [chain: [?tenant, ?team]; op: admin]
}
then {
  Membership/_membersOf: [group: ?team; cursor: ?cursor; limit: ?limit]
}

sync setTeamMemberRole
// implementation: SetTeamMemberRoleUseCase#setTeamMemberRole
when {
  Requesting/setTeamMemberRole: [tenant: ?tenant; team: ?team; member: ?member; role: ?role] => [request: ?request]
}
where {
  guard: [chain: [?tenant, ?team]; op: admin]
}
then {
  Membership/setRole: [group: ?team; member: ?member; role: ?role]
}

sync removeTeamMember
// implementation: RemoveTeamMemberUseCase#removeTeamMember
when {
  Requesting/removeTeamMember: [tenant: ?tenant; team: ?team; member: ?member] => [request: ?request]
}
where {
  guard: [chain: [?tenant, ?team]; op: admin]
}
then {
  Membership/remove: [group: ?team; member: ?member]
  Permission/revoke: [resource: ?team; principal: ?member]
}

sync listTeamInvites
// implementation: ListTeamInvitesUseCase#listTeamInvites
when {
  Requesting/listTeamInvites: [tenant: ?tenant; team: ?team; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  guard: [chain: [?tenant, ?team]; op: admin]
}
then {
  Membership/_invitesOf: [group: ?team; cursor: ?cursor; limit: ?limit]
}

sync revokeTeamInvite
// implementation: RevokeTeamInviteUseCase#revokeTeamInvite
when {
  Requesting/revokeTeamInvite: [tenant: ?tenant; team: ?team; invite: ?invite] => [request: ?request]
}
where {
  guard: [chain: [?tenant, ?team]; op: admin]
}
then {
  Membership/revokeInvite: [group: ?team; invite: ?invite]
}
```

创建首 owner、签发 Team 邀请和接受 Team 邀请时，先锁目标租户成员关系并确认仍存在，再锁 Team。
移出租户沿同一顺序锁定并清理 Team 成员。tenantMembershipRequired 也涵盖创建者在等待期间被移出租户。

拒绝的 mediator branch 由所属入口直接翻译动作结果或条件失败，不对应独立 Java 方法；错误码、违反项和事务结果保持上述契约。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `CreateTeamUseCase.createTeam` | `credential: String, tenant: UUID, name: String, key: String` | `FlowResponse<TeamTypes.TeamView>` |
| `DeleteTeamUseCase.deleteTeam` | `credential: String, tenant: UUID, team: UUID` | `void` |
| `GetTeamUseCase.getTeam` | `credential: String, tenant: UUID, team: UUID` | `TeamTypes.TeamView` |
| `InviteTeamMemberUseCase.inviteTeamMember` | `credential: String, tenant: UUID, team: UUID, email: String, role: String, key: String` | `FlowResponse<TeamTypes.IssuedInvite>` |
| `ListTeamInvitesUseCase.listTeamInvites` | `credential: String, tenant: UUID, team: UUID, cursor: String, limit: int` | `TeamTypes.Invites` |
| `ListTeamMembersUseCase.listTeamMembers` | `credential: String, tenant: UUID, team: UUID, cursor: String, limit: int` | `TeamTypes.Members` |
| `ListTeamsUseCase.listTeams` | `credential: String, tenant: UUID, cursor: String, limit: int` | `TeamTypes.TeamPage` |
| `RemoveTeamMemberUseCase.removeTeamMember` | `credential: String, tenant: UUID, team: UUID, member: UUID` | `void` |
| `RenameTeamUseCase.renameTeam` | `credential: String, tenant: UUID, team: UUID, name: String` | `TeamTypes.TeamView` |
| `RevokeTeamInviteUseCase.revokeTeamInvite` | `credential: String, tenant: UUID, team: UUID, invite: UUID` | `void` |
| `SetTeamMemberRoleUseCase.setTeamMemberRole` | `credential: String, tenant: UUID, team: UUID, member: UUID, role: String` | `void` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `TeamTypes.InviteView` | `id: UUID, email: String, role: String, expiresAt: Instant, createdAt: Instant` |
| `TeamTypes.Invites` | `items: List<TeamTypes.InviteView>, nextCursor: String` |
| `TeamTypes.IssuedInvite` | `invite: TeamTypes.InviteView, token: String` |
| `TeamTypes.MemberView` | `id: UUID, name: String, avatar: String, email: String, role: String, joinedAt: Instant` |
| `TeamTypes.Members` | `items: List<TeamTypes.MemberView>, nextCursor: String` |
| `TeamTypes.TeamPage` | `items: List<TeamTypes.TeamView>, nextCursor: String` |
| `TeamTypes.TeamView` | `id: UUID, tenantId: UUID, name: String, callerRole: String, memberCount: long, ownerCount: long, createdAt: Instant, updatedAt: Instant` |

<!-- interface-contract:end -->

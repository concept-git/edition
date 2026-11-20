# concept Membership [Group, Member]

## purpose
控制一个群体的成员构成，加入须经同意

## state
members: Group -> Member -> Role
invites: Invite -> (group: Group, email: String, role: Role, expiry: Time)

Role ∈ {owner, member}。初始各 Group 无成员/邀请。InviteId 为稳定管理身份，InviteRef 为明文或服务端句柄。
邀请 metadata={id, group, email, role, expiresAt, createdAt}；成员保留 joinedAt。

## actions
add [group: Group; member: Member; role: Role] => [group: Group; member: Member; role: Role]
  requires member 尚非该群体成员；空群体时 role 必须是 owner
  ensures 写入成员关系。无自助直加入口；仅群体创建 flow 可内部落座首个 owner

add [group: Group; member: Member; role: Role] => [error: AlreadyMember]
  requires member 已是成员
  ensures 返回 AlreadyMember；状态不变

remove [group: Group; member: Member] => [group: Group; member: Member]
  requires 移除后仍至少一位 owner，或本就不是成员
  ensures 非成员时幂等成功；否则删除该成员关系

remove [group: Group; member: Member] => [error: LastOwner]
  requires 将移除最后 owner
  ensures 返回 LastOwner；状态不变

setRole [group: Group; member: Member; role: Role] => [group: Group; member: Member; role: Role]
  requires member 已在群体内且不会降级最后 owner
  ensures 更新角色

setRole [group: Group; member: Member; role: Role] => [error: LastOwner]
  requires 将降级最后 owner
  ensures 返回 LastOwner；状态不变

setRole [group: Group; member: Member; role: Role] => [error: NotMember]
  requires member 不在群体内
  ensures 返回 NotMember；状态不变

invite [group: Group; email: String; role: Role] => [invite: InviteView; token: String]
  ensures 生成限时邀请（7 天）；同群体同邮箱的既有待处理邀请作废。邮箱去首尾空白、大小写不敏感。发布 InviteMailRequested，由组合层在同事务写邮件 outbox

accept [invite: InviteRef; member: Member] => [group: Group; member: Member; role: Role]
  requires 邀请有效未过期且此人尚非成员
  ensures 成为成员并作废邀请

accept [invite: InviteRef; member: Member] => [error: Invalid]
  requires 令牌不存在或已被使用
  ensures 返回 Invalid；状态不变

accept [invite: InviteRef; member: Member] => [error: Expired]
  requires 邀请已过期
  ensures 返回 Expired；状态不变

accept [invite: InviteRef; member: Member] => [error: AlreadyMember]
  requires 邀请已作废或此人本来就是成员
  ensures 保留原成员角色且消费邀请；返回 AlreadyMember(group)

revokeInvite [group: Group; invite: InviteId] => []
  ensures 撤销该稳定 id 的待处理邀请；用 InviteId 而非令牌

revokeInvitesFor [email: String] => []
  ensures 删除发给该规范化邮箱的全部待处理邀请；不存在时幂等成功

clearGroup [group: Group] => []
  ensures 该群体的全部成员与待处理邀请被删除；仅群体终结 sync 调用

## operational principle
after invite [group: g; email: "b@x.com"; role: member] => [invite: i; token: t]
after accept [invite: t; member: b] => [group: g; member: b; role: member]
then _isMember [group: g; member: b] => [member: true]
加入经过了双方同意

after remove [group: g; member: b] => [group: g; member: b]
then _isMember [group: g; member: b] => [member: false]
成员构成始终受控

after add [group: g; member: a; role: owner] => [group: g; member: a; role: owner]
after remove [group: g; member: a] => [error: LastOwner]
then _isMember [group: g; member: a] => [member: true]
群体永不沦为无人可管的孤岛

## queries
_membersOf [group: Group; cursor: String; limit: Int] => [members: seq MemberView; nextCursor: String]
  returns 按 createdAt 及身份倒序分页

_groupsOf [member: Member] => [groups: seq Membership]
  returns 该成员全部群体关系

_lockGroupsOf [member: Member] => [groups: seq Membership]
  returns 主体终结专用：锁住该 member 的全部成员关系

_isMember [group: Group; member: Member] => [member: Bool]
  returns 是否在群体内

_pendingFor [email: String] => [invites: seq PendingInvite]
  returns 该邮箱的全部服务端句柄；库内只存 hash，明文不可复原

_invite [invite: InviteRef] => [id: InviteId; group: Group; email: String; role: Role; expiresAt: Time; createdAt: Time]
  returns 有效未过期邀请；无匹配为零行。供接受前的邮箱核对与公开摘要

_invitesOf [group: Group; cursor: String; limit: Int] => [invites: seq InviteView; nextCursor: String]
  returns 管理列表，包括过期但未撤销记录

_roleOf [group: Group; member: Member] => [role: Role]
  returns 零或一绑定

_lockMembership [group: Group; member: Member] => [membership: Membership]
  returns 锁定一条确定的成员关系；不存在为零行。不得用 lockGroupsOf 代替，以免打乱 Team 锁顺序

_ownerCount [group: Group] => [n: Nat]
  returns 所有者数；判定 LastOwner 时须锁行后再数

_lockOwnerCount [group: Group] => [n: Nat]
  returns 终结预检：锁住该群体全部 owner 行后计数

_memberCount [group: Group] => [n: Nat]
  returns 成员数

_snapshot [] => [members: seq (group: Group, member: Member, role: Role)]
  returns 当前隔离作用域中的成员事实，不读取或推断资源权限

## notes
两次实例化：租户成员 [Tenant, User] 与用户组 [Team, User]，同期交付。
空群体的 add / accept 必须落座 owner；违反是编程错误（抛 IllegalArgumentException），不是 HTTP error case。
有成员则至少一名 owner：remove/setRole 返回 LastOwner，DDL 延迟约束在提交时再挡一层。
无 already_member 邀请分支：本概念只认 member id，邮箱与成员的对应关系在组合层。
Role 是成员角色，与资源角色不合并。两者的唯一同步点是组合层的 grantOwnerRootAccess / revokeOwnerRootAccess。
revokeInvitesFor 仅由全局 User 注销 flow 经窄 bootstrap 调用，防止邮箱释放后新身份继承旧邀请。
Java 模块不得依赖其他概念；Group/Member 是不透明实例化值。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `MembershipApi.accept` | `invite: MembershipApi.InviteRef, member: MembershipApi.MemberId` | `MembershipApi.AcceptResult` |
| `MembershipApi.add` | `group: MembershipApi.Group, member: MembershipApi.MemberId, role: MembershipApi.Role` | `MembershipApi.AddResult` |
| `MembershipApi.clearGroup` | `group: MembershipApi.Group` | `void` |
| `MembershipApi.groupsOf` | `member: MembershipApi.MemberId` | `List<MembershipApi.Membership>` |
| `MembershipApi.inviteOf` | `invite: MembershipApi.InviteRef` | `Optional<MembershipApi.InviteView>` |
| `MembershipApi.invite` | `group: MembershipApi.Group, email: String, role: MembershipApi.Role` | `MembershipApi.Invited` |
| `MembershipApi.invitesOf` | `group: MembershipApi.Group, cursor: String, limit: int` | `MembershipApi.InvitePage` |
| `MembershipApi.isMember` | `group: MembershipApi.Group, member: MembershipApi.MemberId` | `boolean` |
| `MembershipApi.lockGroupsOf` | `member: MembershipApi.MemberId` | `List<MembershipApi.Membership>` |
| `MembershipApi.lockMembership` | `group: MembershipApi.Group, member: MembershipApi.MemberId` | `Optional<MembershipApi.Membership>` |
| `MembershipApi.lockOwnerCount` | `group: MembershipApi.Group` | `long` |
| `MembershipApi.memberCount` | `group: MembershipApi.Group` | `long` |
| `MembershipApi.membersOf` | `group: MembershipApi.Group, cursor: String, limit: int` | `MembershipApi.MemberPage` |
| `MembershipApi.ownerCount` | `group: MembershipApi.Group` | `long` |
| `MembershipApi.pendingFor` | `email: String` | `List<MembershipApi.PendingInvite>` |
| `MembershipApi.remove` | `group: MembershipApi.Group, member: MembershipApi.MemberId` | `MembershipApi.RemoveResult` |
| `MembershipApi.revokeInvite` | `group: MembershipApi.Group, invite: MembershipApi.InviteId` | `void` |
| `MembershipApi.revokeInvitesFor` | `email: String` | `void` |
| `MembershipApi.roleOf` | `group: MembershipApi.Group, member: MembershipApi.MemberId` | `Optional<MembershipApi.Role>` |
| `MembershipApi.setRole` | `group: MembershipApi.Group, member: MembershipApi.MemberId, role: MembershipApi.Role` | `MembershipApi.SetRoleResult` |
| `MembershipApi.snapshot` | `` | `List<MembershipApi.ScopedMember>` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `MembershipApi.AcceptResult.Accepted` | `group: MembershipApi.Group, member: MembershipApi.MemberId, role: MembershipApi.Role` |
| `MembershipApi.AcceptResult.AlreadyMember` | `group: MembershipApi.Group` |
| `MembershipApi.AcceptResult.Expired` | `[]` |
| `MembershipApi.AcceptResult.Invalid` | `[]` |
| `MembershipApi.AcceptResult` | `MembershipApi.AcceptResult.Accepted / MembershipApi.AcceptResult.AlreadyMember / MembershipApi.AcceptResult.Expired / MembershipApi.AcceptResult.Invalid` |
| `MembershipApi.AddResult.Added` | `group: MembershipApi.Group, member: MembershipApi.MemberId, role: MembershipApi.Role` |
| `MembershipApi.AddResult.AlreadyMember` | `member: MembershipApi.MemberId` |
| `MembershipApi.AddResult` | `MembershipApi.AddResult.Added / MembershipApi.AddResult.AlreadyMember` |
| `MembershipApi.GroupType` | `TENANT / TEAM` |
| `MembershipApi.Group` | `type: MembershipApi.GroupType, id: UUID, tenantId: UUID` |
| `MembershipApi.InviteId` | `value: UUID` |
| `MembershipApi.InvitePage` | `invites: List<MembershipApi.InviteView>, nextCursor: String` |
| `MembershipApi.InviteRef.Handle` | `tokenHash: String` |
| `MembershipApi.InviteRef.Plaintext` | `token: String` |
| `MembershipApi.InviteRef` | `MembershipApi.InviteRef.Handle / MembershipApi.InviteRef.Plaintext` |
| `MembershipApi.InviteView` | `id: MembershipApi.InviteId, group: MembershipApi.Group, email: String, role: MembershipApi.Role, expiresAt: Instant, createdAt: Instant` |
| `MembershipApi.Invited` | `invite: MembershipApi.InviteView, token: String` |
| `MembershipApi.MemberId` | `value: UUID` |
| `MembershipApi.MemberPage` | `members: List<MembershipApi.MemberView>, nextCursor: String` |
| `MembershipApi.MemberView` | `member: MembershipApi.MemberId, role: MembershipApi.Role, joinedAt: Instant` |
| `MembershipApi.Membership` | `group: MembershipApi.Group, role: MembershipApi.Role, joinedAt: Instant` |
| `MembershipApi.PendingInvite` | `group: MembershipApi.Group, role: MembershipApi.Role, handle: String` |
| `MembershipApi.RemoveResult.LastOwner` | `[]` |
| `MembershipApi.RemoveResult.Removed` | `group: MembershipApi.Group, member: MembershipApi.MemberId` |
| `MembershipApi.RemoveResult` | `MembershipApi.RemoveResult.LastOwner / MembershipApi.RemoveResult.Removed` |
| `MembershipApi.Role` | `OWNER / MEMBER` |
| `MembershipApi.ScopedMember` | `group: MembershipApi.Group, member: MembershipApi.MemberId, role: MembershipApi.Role` |
| `MembershipApi.SetRoleResult.LastOwner` | `[]` |
| `MembershipApi.SetRoleResult.NotMember` | `member: MembershipApi.MemberId` |
| `MembershipApi.SetRoleResult.RoleSet` | `group: MembershipApi.Group, member: MembershipApi.MemberId, role: MembershipApi.Role` |
| `MembershipApi.SetRoleResult` | `MembershipApi.SetRoleResult.LastOwner / MembershipApi.SetRoleResult.NotMember / MembershipApi.SetRoleResult.RoleSet` |

<!-- interface-contract:end -->

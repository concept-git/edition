# flow: 权限管理

目的：让 Space admin 管理 Space grant、让 Site admin 管理 Site grant（含 anonymous reader）、
让 Page 只做 restriction，并解释某一主体为何能或不能读取 Page / 管理站点；
ACL 管理本身始终可由父级 admin 救援。

入口：
`Requesting.listSpacePermissions / searchPermissionUsers / searchPermissionTeams /
putSpaceGrant / deleteSpaceGrant / listPermissionPages / viewPagePermission /
putPageRestriction / deletePageRestriction / explainPageRead /
listSitePermissions / searchSitePermissionUsers / searchSitePermissionTeams /
putSiteGrant / deleteSiteGrant / explainSiteAdmin`。

共同前置：

- 先经组合根 `ResourceChain` 核对真实 tenant→space→page 归属；路径错配按 not-found 收口。
- Session User 必须是当前 Tenant member；TOKEN 不可管理 ACL。
- ACL 元权限 = `Permission._decide([tenant], actor, admin)` allow，或
  `Permission._decide([tenant,space], actor, admin)` allow（Space/Page），或
  `Permission._decide([tenant,site], actor, admin)` allow（Site）。Page restriction 不进入此判定。
- actor 的判定主体闭包为 `{User + 当前 Tenant Teams}`，每次请求只展开一次。
- 外部主体键为 `user:<uuid> | team:<uuid> | token:<uuid> | anonymous`；Space/Page 新增/修改只接受
  当前 Tenant active User 或现存 Team。Token 只读展示。Site 额外允许 `anonymous`，且角色仅
  `reader` 或 `none`。历史 Page restriction 中的 Token/anonymous 可删除但不可新增。
- 角色 catalog 固定为 `admin/maintainer/author/reader/none`；普通 grant 不接受任意文本角色。
- active Space 可执行全部本 flow mutation；archived Space 只允许写 `none`、首次启用
  restriction、或从已有 restriction 删除成员。其余 widening 返回 `409 space_archived`。

```text
sync listSpacePermissions
// implementation: ListSpacePermissionsUseCase#listSpacePermissions
when {
  Requesting/listSpacePermissions: [tenant: ?tenant; space: ?space; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
  Permission/_decide: [chain: [?tenant]; subject: ?actor; op: admin] => [allowed: true]
    或 Permission/_decide: [chain: [?tenant, ?space]; subject: ?actor; op: admin] => [allowed: true]
  Permission/_grants: [resources: {?tenant, ?space}; cursor: ?cursor; limit: ?limit] => [grants: ?grants]
}
then {
  Requesting/respond: [request: ?request; grants: ?grants]
}

sync searchPermissionUsers
// implementation: SearchPermissionUsersUseCase#searchPermissionUsers
when {
  Requesting/searchPermissionUsers: [tenant: ?tenant; space: ?space; q: ?q; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
  Permission/_decide: [chain: [?tenant]; subject: ?actor; op: admin] => [allowed: true]
    或 Permission/_decide: [chain: [?tenant, ?space]; subject: ?actor; op: admin] => [allowed: true]
  q 至少 2 个 Unicode code point
  User/_search: [query: ?q; cursor: ?cursor; limit: ?limit] => [users: ?users]
  ?members = ?users 中 Membership/_isMember([group: ?tenant; member: ?user]) 为 true 的用户；无匹配时为空列表
}
then {
  Requesting/respond: [request: ?request; items: ?members]
}

sync searchPermissionTeams
// implementation: SearchPermissionTeamsUseCase#searchPermissionTeams
when {
  Requesting/searchPermissionTeams: [tenant: ?tenant; space: ?space; q: ?q; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
  Permission/_decide: [chain: [?tenant]; subject: ?actor; op: admin] => [allowed: true]
    或 Permission/_decide: [chain: [?tenant, ?space]; subject: ?actor; op: admin] => [allowed: true]
  Team/_list: [scope: ?tenant; cursor: ?cursor; limit: ?limit] => [teams: ?teams]
}
then {
  Requesting/respond: [request: ?request; teams: ?teams]
}

sync putSpaceGrant
// implementation: PutSpaceGrantUseCase#putSpaceGrant
when {
  Requesting/putSpaceGrant: [tenant: ?tenant; space: ?space; principalKey: ?principal; role: ?role] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
  Permission/_decide: [chain: [?tenant]; subject: ?actor; op: admin] => [allowed: true]
    或 Permission/_decide: [chain: [?tenant, ?space]; subject: ?actor; op: admin] => [allowed: true]
  principal 属当前 Tenant，role 属固定 catalog
  User principal 先 Membership/_lockMembership: [group: ?tenant; member: ?user] => [membership: ?membership]
  Team principal 仍锁定该 Team，禁止改用全主体 lockGroupsOf
  archived 时 role 必须为 none
}
then {
  Permission/grant: [resource: ?space; principal: ?principal; role: ?role]
}

sync deleteSpaceGrant
// implementation: DeleteSpaceGrantUseCase#deleteSpaceGrant
when {
  Requesting/deleteSpaceGrant: [tenant: ?tenant; space: ?space; principalKey: ?principal] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
  Permission/_decide: [chain: [?tenant]; subject: ?actor; op: admin] => [allowed: true]
    或 Permission/_decide: [chain: [?tenant, ?space]; subject: ?actor; op: admin] => [allowed: true]
  Space/_status: [space: ?space] => [status: active]
}
then {
  Permission/revoke: [resource: ?space; principal: ?principal]
  // 不存在时亦成功
}

sync listPermissionPages
// implementation: ListPermissionPagesUseCase#listPermissionPages
when {
  Requesting/listPermissionPages: [tenant: ?tenant; space: ?space; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
  Permission/_decide: [chain: [?tenant]; subject: ?actor; op: admin] => [allowed: true]
    或 Permission/_decide: [chain: [?tenant, ?space]; subject: ?actor; op: admin] => [allowed: true]
  Permission/_restrictions: [resources: 该 Space 全部 Page] => [views: ?restrictions]
}
then {
  Requesting/respond: [request: ?request; restrictions: ?restrictions]
  // 管理 cursor 投影 {id,title,slug,restrictionActive,restrictionCount,allowedActions}
  // 不返回 content、properties、attachments、Revision 或 SEO
}

sync viewPagePermission
// implementation: ViewPagePermissionUseCase#viewPagePermission
when {
  Requesting/viewPagePermission: [tenant: ?tenant; space: ?space; page: ?page] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.page: [tenant: ?tenant; space: ?space; page: ?page]
  Permission/_decide: [chain: [?tenant]; subject: ?actor; op: admin] => [allowed: true]
    或 Permission/_decide: [chain: [?tenant, ?space]; subject: ?actor; op: admin] => [allowed: true]
  Permission/_restriction: [resource: ?page] => [active: ?active; principals: ?principals; revision: ?revision]
}
then {
  Requesting/respond: [request: ?request; active: ?active; principals: ?principals; revision: ?revision]
  // active=false 与 active=true+空名单（deny-all）严格不同
}

sync putPageRestriction
// implementation: PutPageRestrictionUseCase#putPageRestriction
when {
  Requesting/putPageRestriction: [tenant: ?tenant; space: ?space; page: ?page; principals: ?principals; ifMatch: ?revision] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.page: [tenant: ?tenant; space: ?space; page: ?page]
  Permission/_decide: [chain: [?tenant]; subject: ?actor; op: admin] => [allowed: true]
    或 Permission/_decide: [chain: [?tenant, ?space]; subject: ?actor; op: admin] => [allowed: true]
  If-Match 对应当前 revision，名单不超过 100 且新增项仅 User/Team
  archived 时仅允许首次启用或删除已有成员
}
then {
  Permission/restrict: [resource: ?page; principals: ?principals; expectedRevision: ?revision]
}

sync deletePageRestriction
// implementation: DeletePageRestrictionUseCase#deletePageRestriction
when {
  Requesting/deletePageRestriction: [tenant: ?tenant; space: ?space; page: ?page; ifMatch: ?revision] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.page: [tenant: ?tenant; space: ?space; page: ?page]
  Permission/_decide: [chain: [?tenant]; subject: ?actor; op: admin] => [allowed: true]
    或 Permission/_decide: [chain: [?tenant, ?space]; subject: ?actor; op: admin] => [allowed: true]
  Space/_status: [space: ?space] => [status: active]
  If-Match 对应当前 revision
}
then {
  Permission/unrestrict: [resource: ?page; expectedRevision: ?revision]
  // 已 unrestrict 时保持幂等
}

sync explainPageRead
// implementation: ExplainPageReadUseCase#explainPageRead
when {
  Requesting/explainPageRead: [tenant: ?tenant; space: ?space; page: ?page; principalKey: ?principal] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.page: [tenant: ?tenant; space: ?space; page: ?page]
  Permission/_decide: [chain: [?tenant]; subject: ?actor; op: admin] => [allowed: true]
    或 Permission/_decide: [chain: [?tenant, ?space]; subject: ?actor; op: admin] => [allowed: true]
  principal 可在当前 Tenant 解释
  Permission/_decide: [chain: [?tenant, ?space, ?page]; subject: ?principal; op: read] => [allowed: ?allowed]
}
then {
  Requesting/respond: [request: ?request; allowed: ?allowed]
  // User 展开 User+Teams，Team 只解释自身
}

sync listSitePermissions
// implementation: ListSitePermissionsUseCase#listSitePermissions
when {
  Requesting/listSitePermissions: [tenant: ?tenant; site: ?site; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
  Permission/_decide: [chain: [?tenant]; subject: ?actor; op: admin] => [allowed: true]
    或 Permission/_decide: [chain: [?tenant, ?site]; subject: ?actor; op: admin] => [allowed: true]
  Permission/_grants: [resources: {?tenant, ?site}; cursor: ?cursor; limit: ?limit] => [grants: ?grants]
}
then {
  Requesting/respond: [request: ?request; grants: ?grants]
}

sync searchSitePermissionUsers
// implementation: SearchSitePermissionUsersUseCase#searchSitePermissionUsers
when {
  Requesting/searchSitePermissionUsers: [tenant: ?tenant; site: ?site; q: ?q; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
  Permission/_decide: [chain: [?tenant]; subject: ?actor; op: admin] => [allowed: true]
    或 Permission/_decide: [chain: [?tenant, ?site]; subject: ?actor; op: admin] => [allowed: true]
  q 至少 2 个 Unicode code point
  User/_search: [query: ?q; cursor: ?cursor; limit: ?limit] => [users: ?users]
}
then {
  Requesting/respond: [request: ?request; users: ?users]
}

sync searchSitePermissionTeams
// implementation: SearchSitePermissionTeamsUseCase#searchSitePermissionTeams
when {
  Requesting/searchSitePermissionTeams: [tenant: ?tenant; site: ?site; q: ?q; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
  Permission/_decide: [chain: [?tenant]; subject: ?actor; op: admin] => [allowed: true]
    或 Permission/_decide: [chain: [?tenant, ?site]; subject: ?actor; op: admin] => [allowed: true]
  Team/_list: [scope: ?tenant; cursor: ?cursor; limit: ?limit] => [teams: ?teams]
}
then {
  Requesting/respond: [request: ?request; teams: ?teams]
}

sync putSiteGrant
// implementation: PutSiteGrantUseCase#putSiteGrant
when {
  Requesting/putSiteGrant: [tenant: ?tenant; site: ?site; principalKey: ?principal; role: ?role] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
  Permission/_decide: [chain: [?tenant]; subject: ?actor; op: admin] => [allowed: true]
    或 Permission/_decide: [chain: [?tenant, ?site]; subject: ?actor; op: admin] => [allowed: true]
  role 属固定 catalog
  User/Team 规则与 putSpaceGrant 相同
  anonymous 仅允许 reader 或 none
}
then {
  Permission/grant: [resource: ?site; principal: ?principal; role: ?role]
}

sync deleteSiteGrant
// implementation: DeleteSiteGrantUseCase#deleteSiteGrant
when {
  Requesting/deleteSiteGrant: [tenant: ?tenant; site: ?site; principalKey: ?principal] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
  Permission/_decide: [chain: [?tenant]; subject: ?actor; op: admin] => [allowed: true]
    或 Permission/_decide: [chain: [?tenant, ?site]; subject: ?actor; op: admin] => [allowed: true]
}
then {
  Permission/revoke: [resource: ?site; principal: ?principal]
  // 不存在时亦成功；允许撤销 anonymous
}

sync explainSiteAdmin
// implementation: ExplainSiteAdminUseCase#explainSiteAdmin
when {
  Requesting/explainSiteAdmin: [tenant: ?tenant; site: ?site; principalKey: ?principal] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
  Permission/_decide: [chain: [?tenant]; subject: ?actor; op: admin] => [allowed: true]
    或 Permission/_decide: [chain: [?tenant, ?site]; subject: ?actor; op: admin] => [allowed: true]
  principal 可在当前 Tenant 解释
  Permission/_decide: [chain: [?tenant, ?site]; subject: ?principal; op: admin] => [allowed: ?allowed]
}
then {
  Requesting/respond: [request: ?request; allowed: ?allowed]
}
```

错误与调用方行动：

| 条件 | HTTP / code |
| --- | --- |
| principalKey/q 字段校验失败 | 422 validation_failed + violations |
| If-Match 语法错误 | 400 invalid_precondition |
| 缺 If-Match | 428 precondition_required |
| principal 非当前 Tenant、Team 已删除 | 404 permission_principal_not_found |
| User 已停用 | 409 permission_principal_inactive |
| role 非固定 catalog | 422 permission_role_invalid |
| mutation 使用 Token；Space/Page mutation 使用 anonymous | 422 permission_principal_type_unsupported |
| Site 上 anonymous 角色不是 reader/none | 422 permission_role_invalid |
| 站点不存在或路径 tenant 错配 | 404 site_not_found |
| restriction 超过 100 | 422 permission_restriction_too_large |
| ETag 过期 | 412 permission_version_conflict |
| archived widening | 409 space_archived |
| actor 无 ACL 元权限 | 403 permission_denied |

外部依赖故障保持 503/504；程序不变量保持 500 unexpected。Page grant 没有 Requesting 入口，
OpenAPI 与前端都不得出现该能力。

资源关联写入与终结共享实体行锁；锁后重新确认资源存在与状态，顺序为Space先于Page/Site，避免晚到授权、挂载或域名绑定在删除后恢复。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `DeletePageRestrictionUseCase.deletePageRestriction` | `credential: String, tenant: UUID, space: UUID, page: UUID, expectedRevision: long` | `PermissionTypes.PagePermissionView` |
| `DeleteSiteGrantUseCase.deleteSiteGrant` | `credential: String, tenant: UUID, site: UUID, principalKey: String` | `void` |
| `DeleteSpaceGrantUseCase.deleteSpaceGrant` | `credential: String, tenant: UUID, space: UUID, principalKey: String` | `void` |
| `ExplainPageReadUseCase.explainPageRead` | `credential: String, tenant: UUID, space: UUID, page: UUID, principalKey: String` | `PermissionTypes.EffectivePermissionView` |
| `ExplainSiteAdminUseCase.explainSiteAdmin` | `credential: String, tenant: UUID, site: UUID, principalKey: String` | `PermissionTypes.EffectivePermissionView` |
| `ListPermissionPagesUseCase.listPermissionPages` | `credential: String, tenant: UUID, space: UUID, cursor: String, limit: int` | `PermissionTypes.PermissionPage` |
| `ListSitePermissionsUseCase.listSitePermissions` | `credential: String, tenant: UUID, site: UUID, cursor: String, limit: int` | `PermissionTypes.GrantPage` |
| `ListSpacePermissionsUseCase.listSpacePermissions` | `credential: String, tenant: UUID, space: UUID, cursor: String, limit: int` | `PermissionTypes.GrantPage` |
| `PutPageRestrictionUseCase.putPageRestriction` | `credential: String, tenant: UUID, space: UUID, page: UUID, principalKeys: List<String>, expectedRevision: long` | `PermissionTypes.PagePermissionView` |
| `PutSiteGrantUseCase.putSiteGrant` | `credential: String, tenant: UUID, site: UUID, principalKey: String, role: String` | `PermissionTypes.GrantView` |
| `PutSpaceGrantUseCase.putSpaceGrant` | `credential: String, tenant: UUID, space: UUID, principalKey: String, role: String` | `PermissionTypes.GrantView` |
| `SearchPermissionTeamsUseCase.searchPermissionTeams` | `credential: String, tenant: UUID, space: UUID, query: String, cursor: String, limit: int` | `PermissionTypes.PrincipalPage` |
| `SearchPermissionUsersUseCase.searchPermissionUsers` | `credential: String, tenant: UUID, space: UUID, query: String, cursor: String, limit: int` | `PermissionTypes.PrincipalPage` |
| `SearchSitePermissionTeamsUseCase.searchSitePermissionTeams` | `credential: String, tenant: UUID, site: UUID, query: String, cursor: String, limit: int` | `PermissionTypes.PrincipalPage` |
| `SearchSitePermissionUsersUseCase.searchSitePermissionUsers` | `credential: String, tenant: UUID, site: UUID, query: String, cursor: String, limit: int` | `PermissionTypes.PrincipalPage` |
| `ViewPagePermissionUseCase.viewPagePermission` | `credential: String, tenant: UUID, space: UUID, page: UUID` | `PermissionTypes.PagePermissionView` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `PermissionTypes.DecisionTraceView` | `resource: PermissionTypes.ResourceView, subjectGrants: List<PermissionTypes.EffectiveGrantView>, restrictionActive: boolean, restrictionRevision: long, restrictionMatches: List<String>, restrictionSatisfied: boolean, decisive: boolean` |
| `PermissionTypes.EffectiveGrantView` | `resource: PermissionTypes.ResourceView, principalKey: String, role: PermissionTypes.PermissionRole` |
| `PermissionTypes.EffectivePermissionView` | `principal: PermissionTypes.PrincipalView, allowed: boolean, reason: PermissionTypes.EffectiveReason, effectiveOperations: List<PermissionTypes.PermissionOperation>, matchedLayer: Optional<PermissionTypes.ResourceView>, matchedGrants: List<PermissionTypes.EffectiveGrantView>, trace: List<PermissionTypes.DecisionTraceView>` |
| `PermissionTypes.EffectiveReason` | `DIRECT_GRANT / TEAM_GRANT / EXPLICIT_NONE / NO_GRANT / RESTRICTION_MISS` |
| `PermissionTypes.GrantPage` | `items: List<PermissionTypes.GrantView>, nextCursor: String, allowedActions: List<PermissionTypes.PermissionAction>` |
| `PermissionTypes.GrantView` | `resource: PermissionTypes.ResourceView, principal: PermissionTypes.PrincipalView, role: PermissionTypes.PermissionRole, operations: List<PermissionTypes.PermissionOperation>, editable: boolean, allowedActions: List<PermissionTypes.PermissionAction>` |
| `PermissionTypes.PagePermissionSummary` | `id: UUID, title: String, slug: String, restrictionActive: boolean, restrictionCount: int, allowedActions: List<PermissionTypes.PermissionAction>` |
| `PermissionTypes.PagePermissionView` | `pageId: UUID, restriction: PermissionTypes.RestrictionView, allowedActions: List<PermissionTypes.PermissionAction>` |
| `PermissionTypes.PermissionAction` | `GRANT / OVERRIDE / SET_NONE / CHANGE_ROLE / REVOKE / EXPLAIN / RESTRICT / REPLACE_RESTRICTION / NARROW_RESTRICTION / UNRESTRICT` |
| `PermissionTypes.PermissionOperation` | `READ / WRITE / PUBLISH / ADMIN` |
| `PermissionTypes.PermissionPage` | `items: List<PermissionTypes.PagePermissionSummary>, nextCursor: String` |
| `PermissionTypes.PermissionRole` | `ADMIN / MAINTAINER / AUTHOR / READER / NONE` |
| `PermissionTypes.PrincipalPage` | `items: List<PermissionTypes.PrincipalView>, nextCursor: String` |
| `PermissionTypes.PrincipalView` | `key: String, type: String, id: UUID, name: String, status: String, email: String, avatar: String, memberCount: Long` |
| `PermissionTypes.ResourceView` | `type: String, id: UUID, source: String` |
| `PermissionTypes.RestrictionView` | `active: boolean, principals: List<PermissionTypes.PrincipalView>, revision: long` |

<!-- interface-contract:end -->

## 管理凭据能力约束

`allowedActions` 是当前资源授权、业务状态、PAT task scope 与租户边界的交集。会话保持原有能力；PAT 的读取范围不隐含写入、发布或权限管理范围。管理 scope catalog 与网关及生成命令契约共用。预演只读观察不锁定执行，写入仍重新校验授权、ETag 与业务前置条件。

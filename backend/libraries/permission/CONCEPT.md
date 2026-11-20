# concept Permission [Resource, Principal]

## purpose
判定某个主体能否对某个资源执行某种操作

## state
roles: Role -> set Operation
grants: Resource -> Principal -> Role
restrictions: Resource -> (active: Bool, principals: set Principal, revision: Nat)

初始 grants/restrictions 为空，Role 目录由迁移种子建立。Role/Operation 名称 strip+lowercase(ROOT)。
每 (resource, principal) 至多一个 grant，grant 覆盖。
unrestrict 保留 inactive tombstone 与 revision，防止 ABA；从未收窄的资源投影为 inactive/revision=0。

## actions
defineRole [role: Role; operations: set Operation] => []
  ensures 写入该角色的操作集。角色目录由迁移拥有；本动作是概念与测试 seam，不开放 HTTP 管理入口

grant [resource: Resource; principal: Principal; role: Role] => []
  ensures 该 (resource, principal) 的 grant 覆盖为 role

revoke [resource: Resource; principal: Principal] => []
  ensures 移除该 (resource, principal) 的 grant

restrict [resource: Resource; principals: set Principal; expectedRevision: Nat] => [restriction: Restriction]
  requires expectedRevision 匹配当前 revision
  ensures 可及者限定为链上授权与各 active restriction 的交集；revision+1。替换名单可相对旧名单扩大，但不能新增上游未授予的能力

restrict [resource: Resource; principals: set Principal; expectedRevision: Nat] => [error: Conflict]
  requires expectedRevision 不匹配
  ensures 返回 Conflict(current)；状态不变

unrestrict [resource: Resource; expectedRevision: Nat] => [restriction: Restriction]
  requires expectedRevision 匹配当前 revision
  ensures 置为 inactive；同版本 inactive 幂等不递增，初次 unrestrict(0) 创建 inactive 0

unrestrict [resource: Resource; expectedRevision: Nat] => [error: Conflict]
  requires expectedRevision 不匹配
  ensures 返回 Conflict(current)；状态不变

clearResource [resource: Resource] => []
  ensures 该资源的全部 grants 与 restrictions 移除。资源终结时的级联清理入口

clearPrincipal [principal: Principal] => []
  ensures 当前租户作用域内该主体在全部资源上的 grants 移除，并从 restrictions 集合剔除；每个实际改变的 restriction revision 递增

## operational principle
after defineRole [role: reader; operations: {read}] => []
after grant [resource: r1; principal: anonymous; role: reader] => []
then _decide [chain: [r1, r2]; subject: anonymous; op: read] => [allow: true]
内层继承外层授权

after grant [resource: r2; principal: anonymous; role: none] => []
then _decide [chain: [r1, r2]; subject: anonymous; op: read] => [allow: false]
内层可就近覆盖

after grant [resource: r1; principal: teamA; role: reader] => []
after restrict [resource: r3; principals: {teamA}; expectedRevision: 0] => [restriction: rev1]
then _decide [chain: [r1, r3]; subject: (bob, {teamA}); op: read] => [allow: true]
收窄与完整身份闭包求交

after restrict [resource: r3; principals: {alice}; expectedRevision: 1] => [restriction: rev2]
then _decide [chain: [r1, r3]; subject: (bob, {teamA}); op: read] => [allow: false]
收窄只减不增，闭包未命中白名单即拒绝

## queries
_tenantIdsOf [principal: Principal] => [tenantIds: set Tenant]
  returns 该主体已有 grant/restriction 的 tenant_id；全局主体终结的窄发现查询

_grants [resources: set Resource; cursor: String; limit: Int] => [grants: seq Grant; nextCursor: String]
  returns 指定资源上的授权页

_restriction [resource: Resource] => [active: Bool; principals: set Principal; revision: Nat]
  returns 该资源的收窄投影；从未收窄为 inactive/revision=0

_restrictions [resources: set Resource] => [views: Resource -> Restriction]
  returns 批量收窄投影

_decide [chain: seq Resource; subject: Principal | Subject; op: Operation] => [allowed: Bool; effectiveRole?: Role; effectiveOperations: set Operation; matchedGrants: seq Grant; trace: seq Trace]
  returns 从内向外取首个存在 subject grant 的资源层；该层 primary 的直接 grant 优先，否则合并 affiliations。链上每一 active restriction 都须与 {primary} ∪ affiliations 有交集；无任何 grant 则 deny。可使用跨请求缓存

_decideFresh [chain: seq Resource; principal: Principal; op: Operation] => [allowed: Bool; effectiveRole?: Role; effectiveOperations: set Operation; matchedGrants: seq Grant; trace: seq Trace]
  returns 与 _decide 相同判权算法，直接读取调用事务内当前状态，零跨请求缓存。公开接口只接受单 Principal

_filter [chains: set seq Resource; subject: Principal | Subject; op: Operation] => [permitted: set seq Resource]
  returns 批量判定后仍允许的链

_filterFresh [chains: set seq Resource; subject: Principal | Subject; op: Operation] => [permitted: set seq Resource]
  returns 批量加载当前事务授权/收窄事实。Subject 重载使用相同判权算法；完整身份闭包参与授权与收窄交集

_effectiveRole [chain: seq Resource; principal: Principal] => [role: Role]
  returns 指定 principal 在最近层的 grant，不检查 restriction；无匹配为零行。不等于完整主体最终能力

_operations [role: Role] => [ops: set Operation]
  returns 该角色的操作集

_snapshot [] => [grants: seq Grant; restrictions: Resource -> Restriction]
  returns 当前隔离作用域内的完整只读策略投影，含空名单的 active restriction，不含其他作用域

## notes
应用中授权入口只接站点与空间、收窄入口只接页面——约束在组合层。Principal 实例化含 anonymous：把 anonymous 授为 reader 即公开站点。
资源一律以稳定 id 入链，绝不锚 slug/路径。角色是否更高按 _operations(role) 的集合包含关系判定。
Decision 完整输出为 allowed/effectiveRole?/effectiveOperations/matchedGrants/trace。
只有一个 matched grant 时返回 effectiveRole，多个 affiliation grants 合并时以 effectiveOperations 为准。
`_decide` 可使用跨请求缓存；交付投影构建只用 `_decideFresh` / `_filterFresh`。
所有 Subject 重载必须由实现明确支持，不提供仅支持空身份闭包的占位默认实现。
Java 模块不得依赖其他概念；Resource/Principal 是不透明实例化值。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `PermissionApi.clearPrincipal` | `principal: PermissionApi.Principal` | `void` |
| `PermissionApi.clearResource` | `resource: PermissionApi.Resource` | `void` |
| `PermissionApi.decideFresh` | `chain: List<PermissionApi.Resource>, principal: PermissionApi.Principal, operation: PermissionApi.Operation` | `PermissionApi.Decision` |
| `PermissionApi.decide` | `chain: List<PermissionApi.Resource>, principal: PermissionApi.Principal, operation: PermissionApi.Operation` | `PermissionApi.Decision` |
| `PermissionApi.decide` | `chain: List<PermissionApi.Resource>, subject: PermissionApi.Subject, operation: PermissionApi.Operation` | `PermissionApi.Decision` |
| `PermissionApi.defineRole` | `role: PermissionApi.Role, operations: Set<PermissionApi.Operation>` | `void` |
| `PermissionApi.effectiveRole` | `chain: List<PermissionApi.Resource>, principal: PermissionApi.Principal` | `Optional<PermissionApi.Role>` |
| `PermissionApi.filterFresh` | `chains: Set<List<PermissionApi.Resource>>, principal: PermissionApi.Principal, operation: PermissionApi.Operation` | `Set<List<PermissionApi.Resource>>` |
| `PermissionApi.filterFresh` | `chains: Set<List<PermissionApi.Resource>>, subject: PermissionApi.Subject, operation: PermissionApi.Operation` | `Set<List<PermissionApi.Resource>>` |
| `PermissionApi.filter` | `chains: Set<List<PermissionApi.Resource>>, principal: PermissionApi.Principal, operation: PermissionApi.Operation` | `Set<List<PermissionApi.Resource>>` |
| `PermissionApi.filter` | `chains: Set<List<PermissionApi.Resource>>, subject: PermissionApi.Subject, operation: PermissionApi.Operation` | `Set<List<PermissionApi.Resource>>` |
| `PermissionApi.grant` | `resource: PermissionApi.Resource, principal: PermissionApi.Principal, role: PermissionApi.Role` | `void` |
| `PermissionApi.grants` | `resources: Set<PermissionApi.Resource>, cursor: String, limit: int` | `PermissionApi.GrantPage` |
| `PermissionApi.operations` | `role: PermissionApi.Role` | `Set<PermissionApi.Operation>` |
| `PermissionApi.restrict` | `resource: PermissionApi.Resource, principals: Set<PermissionApi.Principal>, expectedRevision: long` | `PermissionApi.RestrictResult` |
| `PermissionApi.restriction` | `resource: PermissionApi.Resource` | `PermissionApi.RestrictionView` |
| `PermissionApi.restrictions` | `resources: Set<PermissionApi.Resource>` | `Map<PermissionApi.Resource, PermissionApi.RestrictionView>` |
| `PermissionApi.revoke` | `resource: PermissionApi.Resource, principal: PermissionApi.Principal` | `void` |
| `PermissionApi.snapshot` | `` | `PermissionApi.Policy` |
| `PermissionApi.tenantIdsOf` | `principal: PermissionApi.Principal` | `Set<UUID>` |
| `PermissionApi.unrestrict` | `resource: PermissionApi.Resource, expectedRevision: long` | `PermissionApi.UnrestrictResult` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `PermissionApi.DecisionTrace` | `resource: PermissionApi.Resource, subjectGrants: List<PermissionApi.Grant>, restriction: PermissionApi.RestrictionView, restrictionMatches: Set<PermissionApi.Principal>, restrictionSatisfied: boolean, decisive: boolean` |
| `PermissionApi.Decision` | `allowed: boolean, effectiveRole: Optional<PermissionApi.Role>, effectiveOperations: Set<PermissionApi.Operation>, matchedGrants: List<PermissionApi.Grant>, trace: List<PermissionApi.DecisionTrace>` |
| `PermissionApi.GrantPage` | `items: List<PermissionApi.Grant>, nextCursor: String` |
| `PermissionApi.Grant` | `resource: PermissionApi.Resource, principal: PermissionApi.Principal, role: PermissionApi.Role` |
| `PermissionApi.Operation` | `value: String` |
| `PermissionApi.Policy` | `grants: List<PermissionApi.Grant>, restrictions: Map<PermissionApi.Resource, PermissionApi.RestrictionView>` |
| `PermissionApi.PrincipalType` | `USER / TEAM / TOKEN / ANONYMOUS` |
| `PermissionApi.Principal` | `type: PermissionApi.PrincipalType, id: UUID` |
| `PermissionApi.ResourceType` | `TENANT / TEAM / SITE / SPACE / PAGE` |
| `PermissionApi.Resource` | `type: PermissionApi.ResourceType, id: UUID` |
| `PermissionApi.RestrictResult.Conflict` | `current: PermissionApi.RestrictionView` |
| `PermissionApi.RestrictResult.Restricted` | `restriction: PermissionApi.RestrictionView` |
| `PermissionApi.RestrictResult` | `PermissionApi.RestrictResult.Conflict / PermissionApi.RestrictResult.Restricted` |
| `PermissionApi.RestrictionView` | `active: boolean, principals: Set<PermissionApi.Principal>, revision: long` |
| `PermissionApi.Role` | `value: String` |
| `PermissionApi.Subject` | `primary: PermissionApi.Principal, affiliations: Set<PermissionApi.Principal>` |
| `PermissionApi.UnrestrictResult.Conflict` | `current: PermissionApi.RestrictionView` |
| `PermissionApi.UnrestrictResult.Unrestricted` | `restriction: PermissionApi.RestrictionView` |
| `PermissionApi.UnrestrictResult` | `PermissionApi.UnrestrictResult.Conflict / PermissionApi.UnrestrictResult.Unrestricted` |

<!-- interface-contract:end -->

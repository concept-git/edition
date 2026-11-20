# concept TenantRegistry

## purpose

让平台能登记租户身份及其管理操作是否被冻结。

## state

tenants: TenantId -> lone (name: String, status: {ACTIVE, SUSPENDED}, createdAt: Time)

初态无租户。合法名称非空且最多 120 字符；TenantId 稳定。租户上下文是调用登记处时的隔离机制，不是登记处拥有的状态。

## actions

provision [name: String] => [result: Provisioned(View)]
  requires 名称合法；ensures 创建 ACTIVE 租户并返回其 id 与视图
provision [name: String] => [result: InvalidName(reason)]
  requires 名称非法；ensures 不创建租户
suspend [tenant: TenantId] => []
  ensures 将已存在租户设为 SUSPENDED；重复冻结幂等
resume [tenant: TenantId] => []
  ensures 将已存在租户设为 ACTIVE；重复恢复幂等

## operational principle

after provision [name: n] => [result: Provisioned(v)]
then status [tenant: v.id] => [status: ACTIVE]；
after suspend [tenant: v.id] => []，status 返回 SUSPENDED；resume 后恢复 ACTIVE。冻结只影响该租户管理入口。

## queries

status [tenant: TenantId] => [status: optional Status]
view [tenant: TenantId] => [view: optional View]
  returns 未知 id 为 empty
viewsOf [tenants: Collection<TenantId>] => [views: seq View]
list [cursor: String; limit: Int] => [page: Page]

## notes

平台类概念；与产品概念采用相同规格形式。以下保留实现边界与运维约束。

`TenantScopeApi.inTenant/withoutTenant` 是事务级 RLS 上下文机制，不是 TenantRegistry 动作；它不拥有租户名称或冻结状态。其 bootstrap reason 仅限 TENANT_PROVISIONING、INVITE_RESOLUTION、TOKEN_RESOLUTION、USER_SECURITY_CASCADE，调用结束恢复上一层上下文。

`Tenant` 仍是不透明身份类型；本概念名为 `TenantRegistry`，只回答“这个租户叫什么、是否被冻结”。
Tenant 是身份类型；登记处拥有独立的租户名称、冻结状态与动作。

### 为什么需要一个模块

`shared.tenants` 有状态（name、status）与生命周期（开通、冻结、恢复），必须有唯一写入者。
边界由三条规则确定：

- 不把 Tenant 身份本身升格为概念；登记行为由 TenantRegistry 负责。
- 不能放 `shared` Java 包——`shared` 只放被动类型（Ids、错误码、游标），零 Spring。
- 不能攒在 `syncs`——backend/CLAUDE.md：sync 层积攒自有状态 = 该升格为概念。

登记处与审计、Webhook 投递同属平台类概念，位于 `platform` 组。

### 边界

- 拥有 `shared.tenants` 的写入（该表在 shared schema，是人人可读的共享内核）。
- `allowedDependencies = {"shared"}`——不依赖任何概念模块。
- `syncs` 可依赖本模块；**`gateway` 不可见本模块**（gateway 只见 shared + sync），
  所以开通/冻结端点只能经由 `sync.platform` 的 flow。
- 其他概念模块**不得**依赖本模块：租户隔离由成员 + 授权 + 空间 + 域名达成，登记处只经 sync 参与组合。

### 租户上下文与 RLS

`shared.tenants`、`iam.memberships`、`iam.invites` 均 `enable + force row level security`，
策略 `for all to space_app` 依赖事务级 `app.tenant_id`。Flyway 使用独立 migration pool；
业务 pool 每条连接建立时 `SET ROLE space_app`，RLS 已真实生效。因此本模块与 membership 的写入
一律经platform.tenantregistry的TenantScopeApi.inTenant设置事务级GUC，结束时恢复上一层上下文。
withoutTenant仅用于枚举的bootstrap原因；实现为TenantScopeService，跨租户操作经基线V1/V2/V5的逐操作SECURITY DEFINER窄函数，运行角色没有通用BYPASSRLS。

**平台运维面本身是跨租户的**：`list`、`suspend`、`resume` 以及 guard 的冻结探测都要读别的租户
（甚至全部租户）的行，天然无法置于任一租户上下文。而 `shared.tenants` 的策略是
`using (id = require_tenant_id())`——票 29 切到受限角色后，这条路径会整体 42501。
平台面通过 `runtime_tenant*` SECURITY DEFINER 函数执行按 id/list/status 的封闭操作，不授予
运行时角色通用跨租户表访问能力。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `TenantRegistryApi.list` | `cursor: String, limit: int` | `TenantRegistryApi.Page` |
| `TenantRegistryApi.provision` | `name: String` | `TenantRegistryApi.ProvisionResult` |
| `TenantRegistryApi.resume` | `tenant: TenantRegistryApi.TenantId` | `void` |
| `TenantRegistryApi.status` | `tenant: TenantRegistryApi.TenantId` | `Optional<TenantRegistryApi.Status>` |
| `TenantRegistryApi.suspend` | `tenant: TenantRegistryApi.TenantId` | `void` |
| `TenantRegistryApi.view` | `tenant: TenantRegistryApi.TenantId` | `Optional<TenantRegistryApi.View>` |
| `TenantRegistryApi.viewsOf` | `tenants: Collection<TenantRegistryApi.TenantId>` | `List<TenantRegistryApi.View>` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `TenantRegistryApi.Page` | `tenants: List<TenantRegistryApi.View>, nextCursor: String` |
| `TenantRegistryApi.ProvisionResult.InvalidName` | `reason: String` |
| `TenantRegistryApi.ProvisionResult.Provisioned` | `tenant: TenantRegistryApi.View` |
| `TenantRegistryApi.ProvisionResult` | `TenantRegistryApi.ProvisionResult.InvalidName / TenantRegistryApi.ProvisionResult.Provisioned` |
| `TenantRegistryApi.Status` | `ACTIVE / SUSPENDED` |
| `TenantRegistryApi.TenantId` | `value: UUID` |
| `TenantRegistryApi.View` | `id: TenantRegistryApi.TenantId, name: String, status: TenantRegistryApi.Status, createdAt: Instant` |

<!-- interface-contract:end -->

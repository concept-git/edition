# syncs: Space 管理

触发：租户作用域 HTTP Requesting 动作。Session 先验证 Tenant membership，TOKEN 先验证唯一
tenant/space binding；全部 Space 访问都包在 `TenantScope.inTenant`。任何 `[tenant,space]`
guard 前先用组合根 `ResourceChain` 验证真实 tenant 归属，路径错配按 `space_not_found` 收口。
补丁归一与幂等指纹走本包 `SpacePatch`；概念有限输出翻译走 `SpaceResults`。
create 显式写 tenant id。变更经 ADR-0016 执行器，范围为 principal + operation + key + canonical
fingerprint；规范化后同请求重放原响应，同键异请求拒绝。

```text
sync createSpace
// implementation: CreateSpaceUseCase#createSpace
when {
  Requesting/createSpace: [tenant: ?tenant; name: ?name; mode: ?mode] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  guard: [chain: [?tenant]; op: admin]
}
then {
  Space/create: [actor: ?actor; tenant: ?tenant; name: ?name; mode: ?mode]
}

sync listSpaces
// implementation: ListSpacesUseCase#listSpaces
when {
  Requesting/listSpaces: [tenant: ?tenant; cursor: ?cursor; limit: ?limit; status: ?status; mode: ?mode; collectionId: ?collectionId] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  collectionId 省略 = 全量，按 (updatedAt,id) keyset 分批取 Space/_pageByTenant: [tenant: ?tenant; cursor: ?cursor; limit: ?limit; status: ?status; mode: ?mode]
  collectionId=ungrouped = 排除 Collection/_placed: [tenant: ?tenant] => [items: ?placed]，仍 (updatedAt,id)
  collectionId=<uuid> = ResourceChain.collection: [tenant: ?tenant; collection: ?collectionId] => [collection: ?col]
    Collection/_itemsIn: [col: ?col] => [items: ?items] 人工序，keyset (position,id)
    未知组 → 404 collection_not_found
  Permission/_filter: [chains: 各 [?tenant, ?space]; subject: ?principal; op: read] => [spaces: ?readable]
}
then {
  Requesting/respond: [request: ?request; items: ?items; nextCursor: ?next; total: null; allowedActions: ?actions]
}

sync viewSpace
// implementation: ViewSpaceUseCase#viewSpace
when {
  Requesting/viewSpace: [tenant: ?tenant; space: ?space] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
  guard: [chain: [?tenant, ?space]; op: read]
}
then {
  Space/_view: [space: ?space]
}

sync updateSpace
// implementation: UpdateSpaceUseCase#updateSpace
when {
  Requesting/updateSpace: [tenant: ?tenant; space: ?space; mergePatch: ?patch] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
  guard: [chain: [?tenant, ?space]; op: admin]
}
then {
  // omitted=保持、null=清空、值=替换
  Space/rename: [actor: ?actor; space: ?space; name: ?name]
  Space/describe: [actor: ?actor; space: ?space; icon: ?icon; description: ?description]
  Space/setAutoRelease: [actor: ?actor; space: ?space; on: ?autoRelease]
  // 仅 authored；synced 写 autoRelease → 409 space_mode_restricted；autoRelease: null → 422
}

sync archiveSpace
// implementation: ArchiveSpaceUseCase#archiveSpace
when {
  Requesting/archiveSpace: [tenant: ?tenant; space: ?space] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
  guard: [chain: [?tenant, ?space]; op: admin]
}
then {
  Space/archive: [actor: ?actor; space: ?space]
}

sync restoreSpace
// implementation: RestoreSpaceUseCase#restoreSpace
when {
  Requesting/restoreSpace: [tenant: ?tenant; space: ?space] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
  guard: [chain: [?tenant, ?space]; op: admin]
}
then {
  Space/restore: [actor: ?actor; space: ?space]
}

sync convertSpace
// implementation: ConvertSpaceUseCase#convertSpace
when {
  Requesting/convertSpace: [tenant: ?tenant; space: ?space; toMode: ?toMode] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
  guard: [chain: [?tenant, ?space]; op: admin]
  Space/_status: [space: ?space] => [status: active]
  toMode=synced 时 Release/_live: [scope: ?space] => [rel: ?live] 必须存在否则 409 live_release_required
}
then {
  Space/convert: [actor: ?actor; space: ?space; toMode: ?toMode]
  // synced→authored 时概念将 autoRelease 置 true；同模式幂等
}
```

错误输出：Space 不存在或不属于路径 tenant → 404 `space_not_found`；存在但 guard 拒绝 → 403；
归档后的 rename/describe/convert → 409 `space_archived`；authored→synced 且无 live → 409
`live_release_required`；空 patch、非法 name/icon/mode → 422。archive/restore/同模式 convert
对目标状态天然幂等，但仍统一进入执行器以保存响应语义。读取详情固定使用
`[tenant, space] / read`：session owner 由 tenant-root admin 继承；TOKEN principal 必须同时具备
该资源 grant、read scope 与唯一 binding。

列表/详情投影由 sync 组合，不写回 Space state。完整字段与中性值见 API.md §5。
`collectionId` / `collectionPath` 经 Collection._collectionOf / _pathOf 补实（未分组为
null / []）。能力为服务端计算的 Permission/scopes/binding/Tenant status/Space status
交集，前端只消费 `allowedActions`，不猜 role。

Space详情的mounts只包含当前主体可read的Site标识与slug；mountCount为所有挂载总数。空间管理员无Site权限时只能看数量，终结仍覆盖所有挂载。

updateSpace/convertSpace首次执行在Space行锁内复核active、mode与所需live基线。归档拒绝优先于字段校验错误；有效原键重放不重新执行变更。

前端创建旅程：成功响应是已提交事实；列表刷新、导航或后续查询失败不得改写为创建失败。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `ArchiveSpaceUseCase.archiveSpace` | `credential: String, tenant: UUID, space: UUID, key: String` | `FlowResponse<SpaceTypes.SpaceDetail>` |
| `ConvertSpaceUseCase.convertSpace` | `credential: String, tenant: UUID, space: UUID, mode: String, key: String` | `FlowResponse<SpaceTypes.SpaceDetail>` |
| `CreateSpaceUseCase.createSpace` | `credential: String, tenant: UUID, name: String, mode: String, key: String` | `FlowResponse<SpaceTypes.SpaceDetail>` |
| `ListSpacesUseCase.listSpaces` | `credential: String, tenant: UUID, cursor: String, limit: int, status: String, mode: String, collectionId: String` | `SpaceTypes.SpacePage` |
| `RestoreSpaceUseCase.restoreSpace` | `credential: String, tenant: UUID, space: UUID, key: String` | `FlowResponse<SpaceTypes.SpaceDetail>` |
| `UpdateSpaceUseCase.updateSpace` | `credential: String, tenant: UUID, space: UUID, patch: SpaceTypes.UpdatePatch, key: String` | `FlowResponse<SpaceTypes.SpaceDetail>` |
| `ViewSpaceUseCase.viewSpace` | `credential: String, tenant: UUID, space: UUID` | `SpaceTypes.SpaceDetail` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `SpaceTypes.Action` | `DELETE / CREATE / READ / UPDATE / ARCHIVE / RESTORE / CONVERT / WRITE_PAGES / MANAGE_PERMISSIONS` |
| `SpaceTypes.Mount` | `siteId: UUID, slug: String` |
| `SpaceTypes.SpaceDetail` | `id: UUID, tenantId: UUID, name: String, icon: String, description: String, mode: String, status: String, pageCount: long, driftCount: long, lastReleaseAt: Instant, createdAt: Instant, createdBy: UUID, updatedAt: Instant, updatedBy: UUID, collectionId: UUID, allowedActions: List<SpaceTypes.Action>, collectionPath: List<String>, mounts: List<SpaceTypes.Mount>, mountCount: int, retention: int, autoRelease: Boolean` |
| `SpaceTypes.SpacePage` | `items: List<SpaceTypes.SpaceSummary>, nextCursor: String, total: Long, allowedActions: List<SpaceTypes.Action>` |
| `SpaceTypes.SpaceSummary` | `id: UUID, tenantId: UUID, name: String, icon: String, mode: String, status: String, pageCount: long, driftCount: long, lastReleaseAt: Instant, createdAt: Instant, createdBy: UUID, updatedAt: Instant, updatedBy: UUID, collectionId: UUID, allowedActions: List<SpaceTypes.Action>` |
| `SpaceTypes.UpdatePatch` | `name: SpaceApi.Patch<String>, icon: SpaceApi.Patch<String>, description: SpaceApi.Patch<String>, autoRelease: Optional<Boolean>` |

<!-- interface-contract:end -->

## 管理凭据能力约束

`allowedActions` 是当前资源授权、业务状态、PAT task scope 与租户边界的交集。会话保持原有能力；PAT 的读取范围不隐含写入、发布或权限管理范围。管理 scope catalog 与网关及生成命令契约共用。预演只读观察不锁定执行，写入仍重新校验授权、ETag 与业务前置条件。

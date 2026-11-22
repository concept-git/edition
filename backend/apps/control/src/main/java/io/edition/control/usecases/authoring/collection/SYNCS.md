# syncs: 空间分组

> Authoring `collection` flow 的唯一 sync 规格；共享约定见 [../../SYNCS.md](../../SYNCS.md)。
> 与唯一 `CollectionFacade`、访问投影 `CollectionAccess`、补丁 `CollectionPatch`、
> 响应投影 `CollectionProjection` 共置一层浅包。真实分组与空间归属走组合根 `ResourceChain`。
> 租户准入走组合根 `TenantAccess`。

## flow: 空间分组

触发: `Requesting.viewCollections/createCollection/patchCollection/moveCollection/
removeCollection/placeSpace/unplaceSpace`

入口显式携带 tenantId；分组是租户根资源，Site 不进链。GET：租户准入即可。写：
`[tenant] / admin`（TOKEN 无 admin，不能写）。写接口强制 Idempotency-Key，与幂等结果
共享事务；后写覆盖，不要求 If-Match。GET 返回整棵分组森林（人工序，不分页、不接受
sort、**不挂空间叶子**）。四种组 mutation 均回整棵 `CollectionView`。place/unplace
回 `SpaceDetail`（含补实的 `collectionPath` / `collectionId`）。

```text
sync viewCollections
// implementation: ViewCollectionsUseCase#viewCollections
when {
  Requesting/viewCollections: [tenant: ?tenant] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  Collection/_tree: [tenant: ?tenant] => [cols: ?cols]
}
then {
  Requesting/respond: [request: ?request; collections: ?cols]
}

sync createCollection
// implementation: CreateCollectionUseCase#createCollection
when {
  Requesting/createCollection: [tenant: ?tenant; parent: ?parent; name: ?name; icon: ?icon; pos: ?pos] => [request: ?request]
}
where {
  guard: [chain: [?tenant]; op: admin]
}
then {
  Collection/create: [tenant: ?tenant; parent: ?parent; name: ?name; icon: ?icon; pos: ?pos]
}

mediator branch createCollectionRejected
when {
  Requesting/createCollection: [tenant: ?tenant; parent: ?parent; name: ?name; icon: ?icon; pos: ?pos] => [request: ?request]
  Collection/create: [tenant: ?tenant; parent: ?parent; name: ?name; icon: ?icon; pos: ?pos] => [error: DepthExceeded | PositionInvalid | NameTaken | Invalid]
}
then {
  Requesting/respond: [request: ?request; error: ?error]
}

sync patchCollection
// implementation: PatchCollectionUseCase#patchCollection
when {
  Requesting/patchCollection: [tenant: ?tenant; col: ?col; mergePatch: ?patch] => [request: ?request]
}
where {
  ResourceChain.collection: [tenant: ?tenant; collection: ?col] => [collection: ?col]
  guard: [chain: [?tenant]; op: admin]
  omitted=保持、null 仅 icon 可清空、空 patch 422
}
then {
  Collection/rename: [col: ?col; name: ?name]
  Collection/setIcon: [col: ?col; icon: ?icon]
}

mediator branch patchCollectionRejected
when {
  Requesting/patchCollection: [tenant: ?tenant; col: ?col; mergePatch: ?patch] => [request: ?request]
  Collection/rename: [col: ?col; name: ?name] => [error: NameTaken | Invalid]
}
then {
  Requesting/respond: [request: ?request; error: ?error]
}

sync moveCollection
// implementation: MoveCollectionUseCase#moveCollection
when {
  Requesting/moveCollection: [tenant: ?tenant; col: ?col; newParent: ?newParent; pos: ?pos] => [request: ?request]
}
where {
  ResourceChain.collection: [tenant: ?tenant; collection: ?col] => [collection: ?col]
  guard: [chain: [?tenant]; op: admin]
}
then {
  Collection/move: [col: ?col; newParent: ?newParent; pos: ?pos]
}

mediator branch moveCollectionRejected
when {
  Requesting/moveCollection: [tenant: ?tenant; col: ?col; newParent: ?newParent; pos: ?pos] => [request: ?request]
  Collection/move: [col: ?col; newParent: ?newParent; pos: ?pos] => [error: DepthExceeded | CycleDetected | PositionInvalid | NameTaken]
}
then {
  Requesting/respond: [request: ?request; error: ?error]
}

sync removeCollection
// implementation: RemoveCollectionUseCase#removeCollection
when {
  Requesting/removeCollection: [tenant: ?tenant; col: ?col] => [request: ?request]
}
where {
  ResourceChain.collection: [tenant: ?tenant; collection: ?col] => [collection: ?col]
  guard: [chain: [?tenant]; op: admin]
}
then {
  Collection/remove: [col: ?col]
  // 非空 → 409 collection_not_empty；不存在 → 404
}

sync placeSpace
// implementation: PlaceSpaceUseCase#placeSpace
when {
  Requesting/placeSpace: [tenant: ?tenant; col: ?col; space: ?space; pos: ?pos] => [request: ?request]
}
where {
  ResourceChain.collection: [tenant: ?tenant; collection: ?col] => [collection: ?col]
  ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
  guard: [chain: [?tenant]; op: admin]
}
then {
  Collection/place: [item: ?space; col: ?col; pos: ?pos]
}

mediator branch placeSpaceRejected
when {
  Requesting/placeSpace: [tenant: ?tenant; col: ?col; space: ?space; pos: ?pos] => [request: ?request]
  Collection/place: [item: ?space; col: ?col; pos: ?pos] => [error: PositionInvalid]
}
then {
  Requesting/respond: [request: ?request; error: ?error]
}

sync unplaceSpace
// implementation: UnplaceSpaceUseCase#unplaceSpace
when {
  Requesting/unplaceSpace: [tenant: ?tenant; col: ?col; space: ?space] => [request: ?request]
}
where {
  ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
  guard: [chain: [?tenant]; op: admin]
  Collection/_collectionOf: [item: ?space] => [col: ?current]
}
then {
  若 ?current = ?col：Collection/unplace: [item: ?space]；否则空操作（含已在别组或未分组）
}
```

错误词汇：`collection_not_found` / `collection_not_empty` / `collection_name_taken` /
`depth_exceeded` / `cycle_detected` / `position_invalid` / `validation_failed` /
`space_not_found` 属本 flow。

判定顺序：认证 → 租户准入/权限 → 分组或空间存在且属该租户 → 校验/深度/环/重名/非空 → 执行。

幂等重放在认证及租户 admin 校验之后、目标存在性检查之前完成；删除成功后同键同请求
仍返回原200响应，不因目标已经删除而改成404。首次执行必须继续验证真实租户归属。

排除动作: 无。`Collection.setIcon` 由 patchCollection 承接，不再留在管理杂项剩菜行。
分组不管权限、地址、空间归档；归档空间仍可 place/unplace。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `CreateCollectionUseCase.createCollection` | `credential: String, tenant: UUID, parentId: UUID, name: String, icon: String, position: Integer, key: String` | `FlowResponse<CollectionTypes.CollectionView>` |
| `MoveCollectionUseCase.moveCollection` | `credential: String, tenant: UUID, collectionId: UUID, parentId: UUID, position: int, key: String` | `FlowResponse<CollectionTypes.CollectionView>` |
| `PatchCollectionUseCase.patchCollection` | `credential: String, tenant: UUID, collectionId: UUID, namePresent: boolean, name: String, iconPresent: boolean, icon: String, key: String` | `FlowResponse<CollectionTypes.CollectionView>` |
| `PlaceSpaceUseCase.placeSpace` | `credential: String, tenant: UUID, collectionId: UUID, spaceId: UUID, position: Integer, key: String` | `FlowResponse<SpaceTypes.SpaceDetail>` |
| `RemoveCollectionUseCase.removeCollection` | `credential: String, tenant: UUID, collectionId: UUID, key: String` | `FlowResponse<CollectionTypes.CollectionView>` |
| `UnplaceSpaceUseCase.unplaceSpace` | `credential: String, tenant: UUID, collectionId: UUID, spaceId: UUID, key: String` | `FlowResponse<SpaceTypes.SpaceDetail>` |
| `ViewCollectionsUseCase.viewCollections` | `credential: String, tenant: UUID` | `CollectionTypes.CollectionView` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `CollectionTypes.Action` | `READ / EDIT` |
| `CollectionTypes.CollectionView` | `collections: List<CollectionTypes.NodeView>, allowedActions: Set<CollectionTypes.Action>` |
| `CollectionTypes.NodeView` | `id: UUID, parentId: UUID, position: int, name: String, icon: String, depth: int, spaceCount: long, children: List<CollectionTypes.NodeView>` |

<!-- interface-contract:end -->

## 管理凭据能力约束

`allowedActions` 是当前资源授权、业务状态、PAT task scope 与租户边界的交集。会话保持原有能力；PAT 的读取范围不隐含写入、发布或权限管理范围。管理 scope catalog 与网关及生成命令契约共用。预演只读观察不锁定执行，写入仍重新校验授权、ETag 与业务前置条件。

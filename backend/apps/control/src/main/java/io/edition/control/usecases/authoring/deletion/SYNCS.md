# syncs: 删除与恢复

> Authoring `deletion` flow 的唯一 sync 规格；共享约定见 [../../SYNCS.md](../../SYNCS.md)。
> 与唯一 `DeletionFacade`、访问投影 `DeletionAccess`、响应投影 `TrashProjection` 共置一层浅包。
> 真实归属走组合根 `ResourceChain`（已回收页仍算 found，否则无法还原）；authored 可写走
> `AuthoringWrites`。永久清除与空间/站点终结由 [termination](../termination/SYNCS.md) 承接。

## flow: 删除与恢复

触发: `Requesting.trashPage` / `Requesting.restorePage` / `Requesting.listTrash`

所有入口显式携带 tenantId 与 spaceId；写入口另带 pageId。先核对真实 page→space→tenant
（`trashedAt` 不当 miss），再按 `[tenant, space, page]`（listTrash 为 `[tenant, space]`）guard。
AuthoringWrites.withLifecycleWrite持有本次生命周期变更的租户上下文；Page动作与Toc摘除在该上下文内完成。
写强制 Idempotency-Key，无 If-Match，不递增 revision。成功回 `200 PageDetail`。
listTrash 为 permission-filtered 游标，`trashedAt desc, id desc`，`total: null`。

synced 作者不能 trash/restore（409 `space_mode_restricted`）。导入系统回收走 bundleimport。
受保护的定时清除由 termination.purgeExpired 承接。authored 自动发版由 AuthoredAutoRelease.afterCompletion 同事务接力。

```text
sync trashPage
// implementation: TrashPageUseCase#trashPage
when {
  Requesting/trashPage: [tenant: ?tenant; space: ?space; page: ?page] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.page: [tenant: ?tenant; space: ?space; page: ?page]
  guard: [chain: [?tenant, ?space, ?page]; op: write]
  AuthoringWrites: [space: ?space]
}
then {
  Page/trash: [page: ?page; actor: ?actor]
  // 首次 trash 且空间 autoRelease 开时同事务调用 AuthoredAutoRelease.afterCompletion
  // 已回收再 trash：200 no-op，不重置 trashedAt，不跑发版流水线
}

mediator branch pruneTocOnTrash
when {
  Requesting/trashPage: [tenant: ?tenant; space: ?space; page: ?page] => [request: ?request]
  Page/trash: [page: ?page] => [page: ?page]
}
where {
  Space/_mode: [space: ?space] => [mode: authored]
  Toc/_entriesFor: [target: ?page] => [entries: ?entries]
  对 ?entries 中每个 spaceId = ?space 的条目绑定一组 ?entry；零条目则不触发
}
then {
  Toc/remove: [entry: ?entry] // 级联摘子树，不回收其他页面
}

sync restorePage
// implementation: RestorePageUseCase#restorePage
when {
  Requesting/restorePage: [tenant: ?tenant; space: ?space; page: ?page] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.page: [tenant: ?tenant; space: ?space; page: ?page]
  guard: [chain: [?tenant, ?space, ?page]; op: write]
  AuthoringWrites: [space: ?space]
}
then {
  Page/restore: [page: ?page; actor: ?actor]
  // 首次 restore 且页面仍为 published 且空间 autoRelease 开时同事务调用 AuthoredAutoRelease.afterCompletion
  // 未回收再 restore：200 no-op，不跑发版流水线
  // restore 不回挂目录（未编目，有意 loosen）；wiki 下已进版页会重新进入主版本（读者 URL 可达）
}

sync listTrash
// implementation: ListTrashUseCase#listTrash
when {
  Requesting/listTrash: [tenant: ?tenant; space: ?space; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
  guard: [chain: [?tenant, ?space]; op: read]
  Page/_trashed: [cursor: ?cursor; limit: ?limit] => [views: ?views]
  Permission/_filter: [chains: 各 [?tenant, ?space, ?page]; subject: ?principal; op: read] => [pages: ?readable]
  ?items = ?views 中 page id 属于 ?readable 的条目
}
then {
  Requesting/respond: [request: ?request; items: ?items]
}
```

错误词汇：`page_not_found` / `space_mode_restricted` / `space_archived` /
`invalid_idempotency_key` / `invalid_cursor`。不新增 code。

判定顺序：认证 → 真实链 → 租户/权限 → archived → mode → 执行。

本包不承接的动作：`purgeExpired`、`deleteSpace`、`deleteSite` 及其级联和失败语义，
统一见 [termination/SYNCS.md](../termination/SYNCS.md)。级联在终结事务内完成，
不再维护第二份 planned 规格。`Space.archive/restore` 由 [space](../space/SYNCS.md) 承接。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `ListTrashUseCase.listTrash` | `credential: String, tenant: UUID, space: UUID, cursor: String, limit: int` | `DeletionTypes.TrashPage` |
| `RestorePageUseCase.restorePage` | `credential: String, tenant: UUID, space: UUID, page: UUID, key: String` | `FlowResponse<PageEditingTypes.PageDetail>` |
| `TrashPageUseCase.trashPage` | `credential: String, tenant: UUID, space: UUID, page: UUID, key: String` | `FlowResponse<PageEditingTypes.PageDetail>` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `DeletionTypes.Action` | `READ / EDIT` |
| `DeletionTypes.TrashItem` | `id: UUID, title: String, slug: String, status: String, format: String, trashedAt: Instant, allowedActions: Set<DeletionTypes.Action>` |
| `DeletionTypes.TrashPage` | `items: List<DeletionTypes.TrashItem>, nextCursor: String, total: Long, allowedActions: Set<DeletionTypes.Action>` |

<!-- interface-contract:end -->

## 管理凭据能力约束

`allowedActions` 是当前资源授权、业务状态、PAT task scope 与租户边界的交集。会话保持原有能力；PAT 的读取范围不隐含写入、发布或权限管理范围。管理 scope catalog 与网关及生成命令契约共用。预演只读观察不锁定执行，写入仍重新校验授权、ETag 与业务前置条件。

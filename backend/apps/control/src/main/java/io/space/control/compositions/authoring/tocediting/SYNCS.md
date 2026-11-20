# syncs: 目录编排

> Authoring `tocediting` flow 的唯一 sync 规格；共享约定见 [../../SYNCS.md](../../SYNCS.md)。
> 与唯一 `TocEditingFacade`、访问投影 `TocAccess`、kind 翻译 `TocKinds`、响应投影
> `TocProjection` 共置一层浅包。真实归属走组合根 `ResourceChain`；authored 可写走
> `AuthoringWrites`。

## flow: 目录编排

触发: `Requesting.viewToc/addEntry/moveEntry/relabelEntry/removeEntry`

变更在幂等首次执行内先锁Space并复核active/authored，再检查当前条目或目标页面，最后进入Toc作用域锁。
AuthoringWrites.withSpaceWrite持有本次变更的租户上下文；目录动作、响应投影和自动发版在其中完成。
已完成的原键删除请求返回保存响应，不能因条目已经删除而在重放前返回404。

所有入口显式携带 tenantId 与 spaceId；"真实 space→tenant" 由组合层先核对归属，再按
`[tenant, space]` 链 guard。租户准入（存在、未冻结、成员/绑定）走组合根 `TenantAccess`。
写接口强制 Idempotency-Key，与幂等结果共享事务；后写覆盖，不要求 If-Match。
GET 返回整棵嵌套树（人工序，不分页、不接受 sort）。四种 mutation 均回整棵 `TocView`。
authored 且 autoRelease 开时，mutation 成功后同事务调用 AuthoredAutoRelease.afterCompletion
（目录进入 live 快照；未进版 TARGET 仍被收集器摘掉，可能 skipNoChange）。

```text
sync viewToc
// implementation: ViewTocUseCase#viewToc
when {
  Requesting/viewToc: [tenant: ?tenant; space: ?space] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
  guard: [chain: [?tenant, ?space]; op: read]
  Toc/_tree: [toc: ?space] => [entries: ?entries]
}
then {
  Requesting/respond: [request: ?request; entries: ?entries]
}

sync addEntry
// implementation: AddEntryUseCase#addEntry
when {
  Requesting/addEntry: [tenant: ?tenant; space: ?space; parent: ?parent; label: ?label; kind: ?kind; target: ?target; url: ?url; pos: ?pos] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
  guard: [chain: [?tenant, ?space]; op: write]
  AuthoringWrites: [space: ?space]
  kind=target 时 ResourceChain.page: [tenant: ?tenant; space: ?space; page: ?target] => [page: ?target]
    且 Page/_view: [page: ?target] => [trashedAt: none]（否则 page_not_found）
}
then {
  Toc/addEntry: [toc: ?space; parent: ?parent; label: ?label; kind: ?kind; target: ?target; url: ?url; pos: ?pos]
  // authored 且 autoRelease 开时同事务 AuthoredAutoRelease.afterCompletion
}

mediator branch addEntryRejected
when {
  Requesting/addEntry: [tenant: ?tenant; space: ?space; parent: ?parent; label: ?label; kind: ?kind; target: ?target; url: ?url; pos: ?pos] => [request: ?request]
  Toc/addEntry: [toc: ?space; parent: ?parent; label: ?label; kind: ?kind; target: ?target; url: ?url; pos: ?pos] => [error: DepthExceeded | PositionInvalid | Invalid]
}
then {
  Requesting/respond: [request: ?request; error: ?error]
}

sync moveEntry
// implementation: MoveEntryUseCase#moveEntry
when {
  Requesting/moveEntry: [tenant: ?tenant; space: ?space; entry: ?entry; newParent: ?newParent; pos: ?pos] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
  条目属于该 space
  guard: [chain: [?tenant, ?space]; op: write]
  AuthoringWrites: [space: ?space]
}
then {
  Toc/move: [entry: ?entry; newParent: ?newParent; pos: ?pos]
  // authored 且 autoRelease 开时同事务 AuthoredAutoRelease.afterCompletion
}

mediator branch moveEntryRejected
when {
  Requesting/moveEntry: [tenant: ?tenant; space: ?space; entry: ?entry; newParent: ?newParent; pos: ?pos] => [request: ?request]
  Toc/move: [entry: ?entry; newParent: ?newParent; pos: ?pos] => [error: DepthExceeded | CycleDetected | PositionInvalid]
}
then {
  Requesting/respond: [request: ?request; error: ?error]
}

sync relabelEntry
// implementation: RelabelEntryUseCase#relabelEntry
when {
  Requesting/relabelEntry: [tenant: ?tenant; space: ?space; entry: ?entry; label: ?label] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
  条目属于该 space
  guard: [chain: [?tenant, ?space]; op: write]
  AuthoringWrites: [space: ?space]
}
then {
  Toc/relabel: [entry: ?entry; label: ?label]
  // authored 且 autoRelease 开时同事务 AuthoredAutoRelease.afterCompletion
}

sync removeEntry
// implementation: RemoveEntryUseCase#removeEntry
when {
  Requesting/removeEntry: [tenant: ?tenant; space: ?space; entry: ?entry] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
  条目属于该 space
  guard: [chain: [?tenant, ?space]; op: write]
  AuthoringWrites: [space: ?space]
}
then {
  Toc/remove: [entry: ?entry]
  // 级联摘子树，不删页面；不存在 → 404 toc_entry_not_found
  // authored 且 autoRelease 开时同事务 AuthoredAutoRelease.afterCompletion
}
```

错误词汇：`toc_entry_not_found` / `depth_exceeded` / `cycle_detected` / `position_invalid` /
`page_not_found` / `space_mode_restricted` / `validation_failed`
属本 flow；`space_archived` / `space_not_found` 复用 space 的异常。

判定顺序：认证 → 真实 space→tenant → 租户/权限 → archived → mode → 条目存在 → 校验/深度/环 → 执行。

排除动作: `Toc.replace`（无 HTTP，随票 20 导入整树替换调用）。本 flow 全部 mutation 限
authored+active；synced 空间目录只读（随导入整树替换、无漂移兜底）。读者侧栏 = live 快照 Toc ∩ 权限
（票 23；本 flow 只负责把工作区 Toc 推进快照）。`trashPage` 随票 17 消费 `_entriesFor` + `remove`，在删除 flow 内摘目录。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `AddEntryUseCase.addEntry` | `credential: String, tenant: UUID, space: UUID, parentId: UUID, label: String, kind: String, targetId: UUID, url: String, position: Integer, key: String` | `FlowResponse<TocEditingTypes.TocView>` |
| `MoveEntryUseCase.moveEntry` | `credential: String, tenant: UUID, space: UUID, entryId: UUID, parentId: UUID, position: int, key: String` | `FlowResponse<TocEditingTypes.TocView>` |
| `RelabelEntryUseCase.relabelEntry` | `credential: String, tenant: UUID, space: UUID, entryId: UUID, label: String, key: String` | `FlowResponse<TocEditingTypes.TocView>` |
| `RemoveEntryUseCase.removeEntry` | `credential: String, tenant: UUID, space: UUID, entryId: UUID, key: String` | `FlowResponse<TocEditingTypes.TocView>` |
| `ViewTocUseCase.viewToc` | `credential: String, tenant: UUID, space: UUID` | `TocEditingTypes.TocView` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `TocEditingTypes.Action` | `READ / EDIT` |
| `TocEditingTypes.EntryView` | `id: UUID, parentId: UUID, position: int, label: String, kind: String, targetId: UUID, url: String, depth: int, children: List<TocEditingTypes.EntryView>` |
| `TocEditingTypes.TocView` | `entries: List<TocEditingTypes.EntryView>, allowedActions: Set<TocEditingTypes.Action>` |

<!-- interface-contract:end -->

## 管理凭据能力约束

`allowedActions` 是当前资源授权、业务状态、PAT task scope 与租户边界的交集。会话保持原有能力；PAT 的读取范围不隐含写入、发布或权限管理范围。管理 scope catalog 与网关及生成命令契约共用。预演只读观察不锁定执行，写入仍重新校验授权、ETag 与业务前置条件。

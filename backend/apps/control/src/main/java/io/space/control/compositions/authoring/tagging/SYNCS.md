# syncs: 标签

单页tag/untag在Space→Page锁内检查未回收、active和authored。
租户级renameTag是词汇治理的明确例外：管理员全局改名，包括归档或synced条目上的既有标签；
不改正文、进版状态或发版快照。它不等同于对单页添加/移除标签。
聚合PageSummary的driftFlag从对应空间当前漂移集合派生，与页面详情一致。

> Authoring `tagging` flow 的唯一 sync 规格；共享约定见 [../../SYNCS.md](../../SYNCS.md)。
> 与唯一 `TaggingFacade`、访问投影 `TagAccess`、label 翻译 `TagLabels`、可见页装配
> `VisibleTaggedPages`、响应投影 `TagProjection` 共置一层浅包。真实归属走组合根
> `ResourceChain`；authored 可写走 `AuthoringWrites`。不依赖 pageediting 的归属核对。

## flow: 标签

触发: `Requesting.tagPage/untagPage/renameTag/listTags/listTaggedPages`

打标/摘除入口显式携带 tenantId、spaceId、pageId；先核真实 page→space→tenant，再按
`[tenant, space, page]` 链 guard。已回收页不在工作集：tag/untag 遇 `trashedAt` → 404
`page_not_found`。改名与跨空间列表入口只带 tenantId；改名走 `[tenant] / admin`。
`Tag.rename` 受当前租户 RLS 约束，不改写其他租户的同名标签。
租户准入走组合根 `TenantAccess`。

写接口强制 Idempotency-Key，与幂等结果共享事务；后写覆盖，不要求 If-Match，
不递增 Page revision、不改 `Page.updatedAt`。tag/untag 成功回 `PageDetail`。

```text
sync tagPage
// implementation: TagPageUseCase#tagPage
when {
  Requesting/tagPage: [tenant: ?tenant; space: ?space; page: ?page; label: ?label] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.page: [tenant: ?tenant; space: ?space; page: ?page]
  Page/_view: [page: ?page] => [trashedAt: none]
  guard: [chain: [?tenant, ?space, ?page]; op: write]
  AuthoringWrites: [space: ?space]
}
then {
  Tag/tag: [item: ?page; label: ?label]
}

mediator branch tagRejected
when {
  Requesting/tagPage: [tenant: ?tenant; space: ?space; page: ?page; label: ?label] => [request: ?request]
  Tag/tag: [item: ?page; label: ?label] => [error: TooMany | Invalid]
}
then {
  Requesting/respond: [request: ?request; error: ?error]
}

sync untagPage
// implementation: UntagPageUseCase#untagPage
when {
  Requesting/untagPage: [tenant: ?tenant; space: ?space; page: ?page; label: ?label] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.page: [tenant: ?tenant; space: ?space; page: ?page]
  Page/_view: [page: ?page] => [trashedAt: none]
  guard: [chain: [?tenant, ?space, ?page]; op: write]
  AuthoringWrites: [space: ?space]
}
then {
  Tag/untag: [item: ?page; label: ?label]
  // 不存在幂等
}

sync listTags
// implementation: ListTagsUseCase#listTags
when {
  Requesting/listTags: [tenant: ?tenant; q: ?q; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  Tag/_matching: [prefix: ?q] => [matches: ?matches]
  Permission/_filter: [chains: 各 tagged [?tenant, ?space, ?page]; subject: ?principal; op: read] => [pages: ?readable]
}
then {
  Requesting/respond: [request: ?request; items: ?counts; allowedActions: ?actions]
  // pageCount 只计可读未回收页；零可见不出现；序 pageCount desc, label asc
  // 租户根 admin 含 rename；q 非法 → 空目录 200（不 422 探测）
}

sync listTaggedPages
// implementation: ListTaggedPagesUseCase#listTaggedPages
when {
  Requesting/listTaggedPages: [tenant: ?tenant; label: ?label; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  label 合法
  Tag/_byLabel: [label: ?label] => [items: ?tagged]
  Permission/_filter: [chains: 各 [?tenant, ?space, ?page]; subject: ?principal; op: read] => [pages: ?readable]
}
then {
  Requesting/respond: [request: ?request; items: ?pages]
  // 零可见 → 空列表 200
}

sync renameTag
// implementation: RenameTagUseCase#renameTag
when {
  Requesting/renameTag: [tenant: ?tenant; from: ?from; to: ?to] => [request: ?request]
}
where {
  guard: [chain: [?tenant]; op: admin]
}
then {
  Tag/rename: [from: ?from; to: ?to]
  // from==to 空操作；目标已存在则合并
}

mediator branch renameRejected
when {
  Requesting/renameTag: [tenant: ?tenant; from: ?from; to: ?to] => [request: ?request]
  Tag/rename: [from: ?from; to: ?to] => [error: NotFound | Invalid]
}
then {
  Requesting/respond: [request: ?request; error: ?error]
}
```

错误词汇：`tag_not_found` / `too_many_tags` / `validation_failed` /
`space_mode_restricted` / `page_not_found` 属本 flow；`space_archived` 复用
space 的异常。

判定顺序：认证 → 真实归属 → 租户/权限 → archived → mode → 校验/上限 → 执行。

排除动作: 读者面/live 快照标签（票 18/19/23）、导入发版包标签（票 20）、回收站浏览（票 17）。
本 flow 全部页面 mutation 限 authored+active；synced 空间只读。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `ListTaggedPagesUseCase.listTaggedPages` | `credential: String, tenant: UUID, label: String, cursor: String, limit: int` | `TaggingTypes.TaggedPagePage` |
| `ListTagsUseCase.listTags` | `credential: String, tenant: UUID, q: String, cursor: String, limit: int` | `TaggingTypes.TagCatalog` |
| `RenameTagUseCase.renameTag` | `credential: String, tenant: UUID, from: String, to: String, key: String` | `FlowResponse<TaggingTypes.RenameView>` |
| `TagPageUseCase.tagPage` | `credential: String, tenant: UUID, space: UUID, page: UUID, label: String, key: String` | `FlowResponse<PageEditingTypes.PageDetail>` |
| `UntagPageUseCase.untagPage` | `credential: String, tenant: UUID, space: UUID, page: UUID, label: String, key: String` | `FlowResponse<PageEditingTypes.PageDetail>` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `TaggingTypes.Action` | `READ / RENAME` |
| `TaggingTypes.RenameView` | `from: String, to: String` |
| `TaggingTypes.TagCatalog` | `items: List<TaggingTypes.TagCount>, nextCursor: String, allowedActions: Set<TaggingTypes.Action>` |
| `TaggingTypes.TagCount` | `label: String, pageCount: long` |
| `TaggingTypes.TaggedPagePage` | `items: List<TaggingTypes.TaggedPage>, nextCursor: String` |
| `TaggingTypes.TaggedPage` | `id: UUID, title: String, slug: String, spaceId: UUID, status: String, format: String, icon: String, tags: List<String>, driftFlag: boolean, updatedAt: Instant, updatedBy: UUID, publishedAt: Instant, allowedActions: Set<PageEditingTypes.Action>` |

<!-- interface-contract:end -->

## 管理凭据能力约束

`allowedActions` 是当前资源授权、业务状态、PAT task scope 与租户边界的交集。会话保持原有能力；PAT 的读取范围不隐含写入、发布或权限管理范围。管理 scope catalog 与网关及生成命令契约共用。预演只读观察不锁定执行，写入仍重新校验授权、ETag 与业务前置条件。

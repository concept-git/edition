# syncs: 发版（authored 自动发版 / 手动构建）

> 本包是 releases 组的发版 flow，与唯一 `ReleaseFacade` 共置。组索引见 [../SYNCS.md](../SYNCS.md)。
> 持续导入 flow 在 [../bundleimport/SYNCS.md](../bundleimport/SYNCS.md)。
> 跨组 flow 按入口 Requesting 动作的归属组落位。
> 本包所有面向 Space 的 build/promote/rollback/discard/retention/patch mutation 均继承组合根的
> `Space/_status=active` 前置；归档空间只允许 export 与只读查询。
> 管理面链为 `[tenant, space, page]` / `[tenant, space]`，Site 不参与（交付未落地前空间可无站点）。

幂等记录绑定调用者提交的参数，不包含读取时的 liveId、revision 或工作区快照。
认证、租户准入和权限仍需每次验证；状态/存在性/模式前置在首次执行时锁定资源后检查，
已完成的原键请求返回原响应。回滚和晋升适用于 active 的 authored 或 synced 空间，
只选择内容发版，不修改当前配置；工作区镜像仍仅由导入批准/导入完成接力负责。

## flow: 发版（authored 自动发版 / 手动构建）

触发: `Requesting/publishPage` / `Requesting/unpublishPage` / `Requesting/buildRelease`

```text
sync publishPage
// implementation: PublishPageUseCase#publishPage
when {
  Requesting/publishPage: [tenant: ?tenant; space: ?space; page: ?page] => [request: ?request]
}
where {
  ResourceChain.page: [tenant: ?tenant; space: ?space; page: ?page]
  guard: [chain: [?tenant, ?space, ?page]; op: publish]
  Space/_status: [space: ?space] => [status: active]
  Space/_mode: [space: ?space] => [mode: authored]
}
then {
  Page/publish: [page: ?page; actor: ?actor]
  若 Space/_view.autoRelease 开则 AuthoredAutoRelease.afterCompletion
}
// 已 published 仍调用 Page/publish（幂等）并仍走流水线（更新主版本）
// 指纹含 tenant+space+page；响应 200 { page, outcome, release }

sync unpublishPage
// implementation: UnpublishPageUseCase#unpublishPage
when {
  Requesting/unpublishPage: [tenant: ?tenant; space: ?space; page: ?page] => [request: ?request]
}
where {
  ResourceChain.page: [tenant: ?tenant; space: ?space; page: ?page]
  guard: [chain: [?tenant, ?space, ?page]; op: publish]
  Space/_status: [space: ?space] => [status: active]
  Space/_mode: [space: ?space] => [mode: authored]
}
then {
  Page/unpublish: [page: ?page; actor: ?actor]
  若 Space/_view.autoRelease 开则 AuthoredAutoRelease.afterCompletion
}

// 以下分支由 AuthoredAutoRelease 在同一 Java 调用栈中执行；Requesting 与概念完成须属同一次请求。
// changed=false 的 trash/restore 没有匹配分支，因此不启动发版流水线。
mediator branch authoredAfterPublish
when {
  Requesting/publishPage: [tenant: ?tenant; space: ?space; page: ?page] => [request: ?request]
  Page/publish: [page: ?page; actor: ?actor] => [page: ?page]
}
where {
  Space/_view: [space: ?space] => [status: active; mode: authored; autoRelease: true]
  ?actorId = ?actor.id; ?ref = string(?page)
}
then {
  Release/draft: [scope: ?space; source: {kind: build; ref: ?ref; actor: ?actorId}]
}

mediator branch authoredAfterUnpublish
when {
  Requesting/unpublishPage: [tenant: ?tenant; space: ?space; page: ?page] => [request: ?request]
  Page/unpublish: [page: ?page; actor: ?actor] => [page: ?page]
}
where {
  Space/_view: [space: ?space] => [status: active; mode: authored; autoRelease: true]
  ?actorId = ?actor.id; ?ref = string(?page)
}
then {
  Release/draft: [scope: ?space; source: {kind: build; ref: ?ref; actor: ?actorId}]
}

mediator branch authoredAfterFirstTrash
when {
  Requesting/trashPage: [tenant: ?tenant; space: ?space; page: ?page] => [request: ?request]
  Page/trash: [page: ?page; actor: ?actor] => [page: ?page; changed: true]
}
where {
  Space/_view: [space: ?space] => [status: active; mode: authored; autoRelease: true]
  ?actorId = ?actor.id; ?ref = concat("trash:", ?page)
}
then {
  Release/draft: [scope: ?space; source: {kind: build; ref: ?ref; actor: ?actorId}]
}

mediator branch authoredAfterFirstRestore
when {
  Requesting/restorePage: [tenant: ?tenant; space: ?space; page: ?page] => [request: ?request]
  Page/restore: [page: ?page; actor: ?actor] => [page: ?page; changed: true]
}
where {
  Page/_view: [page: ?page] => [status: published]
  Space/_view: [space: ?space] => [status: active; mode: authored; autoRelease: true]
  ?actorId = ?actor.id; ?ref = concat("restore:", ?page)
}
then {
  Release/draft: [scope: ?space; source: {kind: build; ref: ?ref; actor: ?actorId}]
}

mediator branch authoredAfterTocAdd
when {
  Requesting/addEntry: [tenant: ?tenant; space: ?space] => [request: ?request]
  Toc/addEntry: [toc: ?space] => [entry: ?entry]
}
where {
  Space/_view: [space: ?space] => [status: active; mode: authored; autoRelease: true]
  ?actorId = principal(?request).id; ?actorId != null; ?ref = concat("toc:", ?space)
}
then {
  Release/draft: [scope: ?space; source: {kind: build; ref: ?ref; actor: ?actorId}]
}

mediator branch authoredAfterTocMove
when {
  Requesting/moveEntry: [tenant: ?tenant; space: ?space; entry: ?entry] => [request: ?request]
  Toc/move: [entry: ?entry] => [tree: ?tree]
}
where {
  Space/_view: [space: ?space] => [status: active; mode: authored; autoRelease: true]
  ?actorId = principal(?request).id; ?actorId != null; ?ref = concat("toc:", ?space)
}
then {
  Release/draft: [scope: ?space; source: {kind: build; ref: ?ref; actor: ?actorId}]
}

mediator branch authoredAfterTocRelabel
when {
  Requesting/relabelEntry: [tenant: ?tenant; space: ?space; entry: ?entry] => [request: ?request]
  Toc/relabel: [entry: ?entry] => [tree: ?tree]
}
where {
  Space/_view: [space: ?space] => [status: active; mode: authored; autoRelease: true]
  ?actorId = principal(?request).id; ?actorId != null; ?ref = concat("toc:", ?space)
}
then {
  Release/draft: [scope: ?space; source: {kind: build; ref: ?ref; actor: ?actorId}]
}

mediator branch authoredAfterTocRemove
when {
  Requesting/removeEntry: [tenant: ?tenant; space: ?space; entry: ?entry] => [request: ?request]
  Toc/remove: [entry: ?entry] => [tree: ?tree]
}
where {
  Space/_view: [space: ?space] => [status: active; mode: authored; autoRelease: true]
  ?actorId = principal(?request).id; ?actorId != null; ?ref = concat("toc:", ?space)
}
then {
  Release/draft: [scope: ?space; source: {kind: build; ref: ?ref; actor: ?actorId}]
}

mediator branch authoredAfterTransferFrom
when {
  Requesting/transferPage: [tenant: ?tenant; sourceSpace: ?source; page: ?page; targetSpace: ?target] => [request: ?request]
  Space/transfer: [item: ?page; toSpace: ?target] => [from: ?from; to: ?to]
}
where {
  ?from.space = ?source; ?to.space = ?target
  Space/_view: [space: ?source] => [status: active; mode: authored; autoRelease: true]
  ?actorId = principal(?request).id; ?ref = concat("transfer:", ?page)
}
then {
  Release/draft: [scope: ?source; source: {kind: build; ref: ?ref; actor: ?actorId}]
}

mediator branch authoredAfterTransferTo
when {
  Requesting/transferPage: [tenant: ?tenant; sourceSpace: ?source; page: ?page; targetSpace: ?target] => [request: ?request]
  Space/transfer: [item: ?page; toSpace: ?target] => [from: ?from; to: ?to]
}
where {
  ?from.space = ?source; ?to.space = ?target
  Page/_view: [page: ?page] => [status: published]
  Space/_view: [space: ?target] => [status: active; mode: authored; autoRelease: true]
  ?actorId = principal(?request).id; ?ref = concat("transfer:", ?page)
}
then {
  Release/draft: [scope: ?target; source: {kind: build; ref: ?ref; actor: ?actorId}]
}

mediator branch loadBuildDraft
when {
  Release/draft: [scope: ?space; source: {kind: build; ref: ?ref; actor: ?actorId}] => [rel: ?rel]
}
where {
  ?bundle = 组合层收集未回收且 published 的页面、Toc 投影和附件元数据
}
then {
  Release/load: [rel: ?rel; bundle: ?bundle]
}
// 目录中 target 不在快照的节点由收集器摘掉，子节点挂到父节点；不改工作区 Toc。
// 附件只写入 {path, storageKey, sha256}，不读对象存储。

sync buildRelease                     // 手动构建，authored 空间无论 autoRelease 开关均允许；走同一条流水线
when {
  Requesting/buildRelease: [tenant: ?tenant; space: ?space] => [request: ?request]
}
where {
  ResourceChain.space: [tenant: ?tenant; space: ?space]
  guard: [chain: [?tenant, ?space]; op: publish]
  Space/_status: [space: ?space] => [status: active]
  Space/_mode: [space: ?space] => [mode: authored]
}
then {
  Release/draft: [scope: ?space; source: {kind: build; ref: manual; actor: ?actor}]
}
// 指纹含 tenant+space；首次执行在锁内读取当前工作区，原键重试不会重新构建
```

控制台在构建按钮附近持续显示请求状态：进行中禁止重复提交；`promoted` 说明已更新主版本且站点仍需完成上线；`unchanged` 说明内容与主版本一致；`skipped` 说明未生成新发版（已进版内容为空或与主版本一致）；`held` 保留主版本并展示返回的校验报告。请求失败就近展示分类错误与追踪号，包括尚无发版的空列表。构建结果与列表刷新独立呈现，刷新失败不撤销已确认的构建结果。

装载之后进入下列共享流水线。autoValidate 的覆盖清单恒为空，该空清单路径仅 authored
（authored 自动发版 / 手动 build）。synced 热修由 pageediting 的 `HotfixSnapshots` 直调
`Release/validate({})` + `Release/promote` + `Release/prune`，不经过本包 `autoValidate`。
导入有自己的 `Release/validate(coverageWarnings)`，见
[../bundleimport/SYNCS.md](../bundleimport/SYNCS.md)，不得调用本包 `autoValidate(rel, {})`。
本包不声明任何导入 sync 名。

```text
mediator branch loadRejected
when {
  Release/load: [rel: ?rel; bundle: ?bundle] => [error: InvalidBundle]
}
then {
  Requesting/respond: [request: ?request; error: InvalidBundle]
  Release/discard: [rel: ?rel]
}
// authored 收集器自签 checksum，HTTP 几乎不可达；对象存储/数据库故障不匹配本 sync

mediator branch autoValidate
when {
  Release/load: [rel: ?rel; bundle: ?bundle] => [rel: ?rel]
}
where {
  Release/_scopeOf: [rel: ?rel] => [scope: ?space]
  Space/_status: [space: ?space] => [status: active]
}
then {
  Release/validate: [rel: ?rel; coverageWarnings: {}]
}
// coverageWarnings 空清单仅 authored；导入不得走本 sync

mediator branch skipNoChange
when {
  Release/validate: [rel: ?rel; coverageWarnings: {}] => [rel: ?rel]
}
where {
  Release/_scopeOf: [rel: ?rel] => [scope: ?scope]
  （Release/_live: [scope: ?scope] => [] 且快照页数为 0）
  或（Release/_live: [scope: ?scope] => [rel: ?live]
      且 Release/_diff: [left: ?live; right: ?rel] 页为空
      且完整页快照与 Toc 均与 live 相等）
}
then {
  Release/discard: [rel: ?rel]
}
// 无 live 且页数>0 不匹配本 sync（交给 autoRelease 成为第一个主版本）
// Release/_diff 只比较页面 content_hash；Toc 只改编排时仍须 promote，比较在组合层

mediator branch autoRelease                      // 校验通过且有变化即成为主版本（与空间开关同名、不是同一件事）
when {
  Release/validate: [rel: ?rel; coverageWarnings: {}] => [rel: ?rel]
}
where {
  Release/_scopeOf: [rel: ?rel] => [scope: ?scope]
  Space/_status: [space: ?scope] => [status: active]
  （Release/_live: [scope: ?scope] => [] 且快照页数>0）
  或（Release/_live: [scope: ?scope] => [rel: ?live]
      且（Release/_diff 页非空或完整页快照/Toc ≠ live））
}
then {
  Release/promote: [rel: ?rel]
}

mediator branch holdOnErrors
when {
  Release/validate: [rel: ?rel; coverageWarnings: {}] => [errors: ?report]
}
then {
  Requesting/respond: [request: ?request; outcome: held; release: draft+report]
}
// 进版标记已提交；线上不动。不新增 release_held

mediator branch retention
when {
  Release/promote: [rel: ?rel]
}
where {
  Release/_scopeOf: [rel: ?rel] => [scope: ?scope]
}
then {
  Release/prune: [scope: ?scope]
}

sync rollback
// implementation: RollbackUseCase#rollback
when {
  Requesting/rollback: [tenant: ?tenant; space: ?space; releaseId: ?releaseId] => [request: ?request]
}
where {
  ResourceChain.space: [tenant: ?tenant; space: ?space]
  guard: [chain: [?tenant, ?space]; op: publish]
  Space/_status: [space: ?space] => [status: active]
  Release/_scopeOf: [rel: ?releaseId] => [scope: ?space]
  Release/_status: [rel: ?releaseId] => [status: archived]
  否则 409 release_not_archived
}
then {
  Release/promote: [rel: ?releaseId]
}

sync promoteRelease
// implementation: PromoteReleaseUseCase#promoteRelease
when {
  Requesting/promoteRelease: [tenant: ?tenant; space: ?space; releaseId: ?releaseId] => [request: ?request]
}
where {
  ResourceChain.space: [tenant: ?tenant; space: ?space]
  guard: [chain: [?tenant, ?space]; op: publish]
  Space/_status: [space: ?space] => [status: active]
  Release/_scopeOf: [rel: ?releaseId] => [scope: ?space]
  Release/_status: [rel: ?releaseId] => [status: validated | archived]
  否则 409 release_not_promotable
}
then {
  Release/promote: [rel: ?releaseId]
}

sync discardRelease
// implementation: DiscardReleaseUseCase#discardRelease
when {
  Requesting/discardRelease: [tenant: ?tenant; space: ?space; releaseId: ?releaseId] => [request: ?request]
}
where {
  ResourceChain.space: [tenant: ?tenant; space: ?space]
  guard: [chain: [?tenant, ?space]; op: publish]
  Release/_scopeOf: [rel: ?releaseId] => [scope: ?space]
  Release/_status: [rel: ?releaseId] => [status: draft | flagged | validated]
  否则 409 release_not_discardable
}
then {
  Release/discard: [rel: ?releaseId]
}

sync listReleases
// implementation: ListReleasesUseCase#listReleases
when {
  Requesting/listReleases: [tenant: ?tenant; space: ?space; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  ResourceChain.space: [tenant: ?tenant; space: ?space]
  guard: [chain: [?tenant, ?space]; op: read]
}
then {
  Release/_page: [scopes: {?space}; status: none; cursor: ?cursor; limit: ?limit]
    按 createdAt desc, id desc 数据库键集分页，total=null；非法游标 400 invalid_cursor
}

sync listTenantReleases
// implementation: ListTenantReleasesUseCase#listTenantReleases
when {
  Requesting/listTenantReleases: [tenant: ?tenant; space?: ?space; mode?: ?mode; status?: ?status; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]（不要求任一空间 read）
  Space/_listByTenant: [tenant: ?tenant] => [spaces: ?spaces]
  Permission/_filter: [chains: 各 space 资源链; subject: ?actor; op: read] => [readable: ?readable]
  space?/mode? 再过滤范围；范围为空则空页（不 404 探测）
}
then {
  Release/_page: [scopes: ?readable; status: ?status; cursor: ?cursor; limit: ?limit]
    按 createdAt desc, id desc 键集分页，
  每行附归属空间 {id, name, mode, status} 与逐条 allowedActions；total=null；
  响应另含可读空间清单供筛选。非法游标 400 invalid_cursor
}

sync viewRelease
// implementation: ViewReleaseUseCase#viewRelease
when {
  Requesting/viewRelease: [tenant: ?tenant; space: ?space; releaseId: ?releaseId] => [request: ?request]
}
where {
  ResourceChain.space: [tenant: ?tenant; space: ?space]
  guard: [chain: [?tenant, ?space]; op: publish]
  Release/_scopeOf: [rel: ?releaseId] => [scope: ?space]
  否则 404 release_not_found
}
then {
  详情 + report + diffSummary（相对当前 Release/_live；自身是 live 则为 {0,0,0}；无 live 则全部 added）
}
// 支持draft/flagged/validated，以便检查阻断与批准覆盖；不返回页面正文/Bundle。
// 列表摘要仍按read；正文预览和导出各自鉴权，导出保留逐页当前归属read与live/archived约束。

sync diffReleases
// implementation: DiffReleasesUseCase#diffReleases
when {
  Requesting/diffReleases: [tenant: ?tenant; space: ?space; from: ?from; to: ?to] => [request: ?request]
}
where {
  ResourceChain.space: [tenant: ?tenant; space: ?space]
  guard: [chain: [?tenant, ?space]; op: read]
  两个 id 均属本 space 否则 404 release_not_found
  Release/_diff: [left: ?from; right: ?to] => [delta: ?delta]
}
then {
  Requesting/respond: [request: ?request; delta: ?delta]
}

sync setRetention
// implementation: SetRetentionUseCase#setRetention
when {
  Requesting/setRetention: [tenant: ?tenant; space: ?space; keep: ?keep] => [request: ?request]
}
where {
  ResourceChain.space: [tenant: ?tenant; space: ?space]
  guard: [chain: [?tenant, ?space]; op: admin]
  Space/_status: [space: ?space] => [status: active]
  keep ∈ [1, 50] 否则 422 validation_failed
}
then {
  Release/setRetention: [scope: ?space; n: ?keep]  // 不立刻 prune
}

sync patchRelease
// implementation: PatchReleaseUseCase#patchRelease
when {
  Requesting/patchRelease: [tenant: ?tenant; space: ?space; releaseId: ?releaseId; label?: ?label; notes?: ?notes] => [request: ?request]
}
where {
  ResourceChain.space: [tenant: ?tenant; space: ?space]
  guard: [chain: [?tenant, ?space]; op: admin]
  Space/_status: [space: ?space] => [status: active]
  Release/_scopeOf: [rel: ?releaseId] => [scope: ?space]
  空 patch 422
}
then {
  出现的字段调用 Release/setLabel: [rel: ?releaseId; label: ?label] / Release/annotate: [rel: ?releaseId; notes: ?notes]
}
```

排除动作（本包不实现）：`continuousImport` 全家、webhook 投递。
发版后的搜索喂入 `reindexOnPromote` 由 delivery 在票 25 承接（本包不声明该方法；
空壳 `SiteSearchSyncs` 若先加一个方法会触发 `delivery/SYNCS.md` 的双向 parity）。
`Release/prune` 仅 retention 触发（热修 prune 在 pageediting `hotfixAutoPromote`）。
对象存储/数据库故障是 503，Release 保持 draft，不进 held/discard。
promote 后的搜索/webhook 不在本 flow（故障由 outbox 隔离）。
synced 空间 publish/unpublish/build/setAutoRelease → 409 `space_mode_restricted`。


构建与热修快照保留 Space 的完整资源路径和附件的空间内路径；Toc 的所有条目类型保留子树。路径属于本版内容，回滚恢复本版路径；页级地址变化必须构建新版本，不能仅替换交付包中的路径。

流水线中的 loadRejected、autoValidate、skipNoChange、autoRelease、holdOnErrors、retention
由 ReleasePipeline 实施；上文以 mediator branch 保留阶段、拒绝与效果，不再为入口增加同名转发。
页面进版和人工构建仍调用同一流水线，晋升与回滚直接执行概念 prune。

## 2026-10-22 同空间选定页面批量发布

`publishPages` / `unpublishPages` 输入同一 Space 的 1..100 个不同 id。先逐页检查真实归属与当前 publish 权限，再按 Space→Page 稳定顺序加锁并重新检查可写、mode 和工作集状态。任一页面失败全批页面选择不变；成功选择状态在一个源数据库事务提交。指纹按 id 集合排序，重放原结果；结果逐页附 id，并有唯一共同 outcome/release。批量操作只改变所选页的进版状态；autoRelease 仍汇总该空间全部可发版页，最多跑一次流水线。held 表示页面选择已提交而主版本未晋升，报告由共同 release 返回。站点交付和搜索仍异步，不承诺跨库原子上线。

```text
sync publishPages
// implementation: PublishPagesUseCase#publishPages
when { Requesting/publishPages: [tenant: ?tenant; space: ?space; ids: ?ids] => [request: ?request] }
where { ResourceChain.space: [tenant: ?tenant; space: ?space]; guard: [chain: 各 [?tenant, ?space, ?page]; op: publish]; AuthoringWrites: [space: ?space] }
then { Page/publish: [page: 各 ?ids; actor: ?actor]; Release/draft: [scope: ?space; source: 最多一次批量选择发版] }

sync unpublishPages
// implementation: UnpublishPagesUseCase#unpublishPages
when { Requesting/unpublishPages: [tenant: ?tenant; space: ?space; ids: ?ids] => [request: ?request] }
where { ResourceChain.space: [tenant: ?tenant; space: ?space]; guard: [chain: 各 [?tenant, ?space, ?page]; op: publish]; AuthoringWrites: [space: ?space] }
then { Page/unpublish: [page: 各 ?ids; actor: ?actor]; Release/draft: [scope: ?space; source: 最多一次批量选择发版] }

sync selectPages
// implementation: SelectPagesOnCompletion#selectPages
when { Requesting/publishPages 或 Requesting/unpublishPages: [tenant: ?tenant; space: ?space; ids: ?ids] => [request: ?request] }
where { 校验非空、最多100、不重复；按 Page id 稳定顺序在同 Space 锁内复核所有真实归属与当前 publish 权限 }
then { Page/publish 或 Page/unpublish: [page: 各 ?ids; actor: ?actor]; AuthoredAutoRelease: [space: ?space; 最多一次]; Requesting/respond: [request: ?request; pages: 同次选择结果; outcome: 共同结果; release: 共同版本] }
```

Release outcome 保留 promoted/skipped/held/unchanged 的 wire 值，schema 声明封闭枚举；promoted 仅说明主版本晋升，不说明站点已上线。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `BuildReleaseUseCase.buildRelease` | `credential: String, tenant: UUID, space: UUID, key: String` | `FlowResponse<ReleaseTypes.BuildResult>` |
| `DiffReleasesUseCase.diffReleases` | `credential: String, tenant: UUID, space: UUID, from: UUID, to: UUID` | `ReleaseTypes.DeltaView` |
| `DiscardReleaseUseCase.discardRelease` | `credential: String, tenant: UUID, space: UUID, releaseId: UUID, key: String` | `FlowResponse<ReleaseTypes.ReleaseDetail>` |
| `ListReleasesUseCase.listReleases` | `credential: String, tenant: UUID, space: UUID, cursor: String, limit: int` | `ReleaseTypes.ReleasePage` |
| `ListTenantReleasesUseCase.listTenantReleases` | `credential: String, tenant: UUID, filter: ReleaseTypes.TenantReleaseFilter, cursor: String, limit: int` | `ReleaseTypes.TenantReleasePage` |
| `PatchReleaseUseCase.patchRelease` | `credential: String, tenant: UUID, space: UUID, releaseId: UUID, patch: ReleaseTypes.ReleasePatch, key: String` | `FlowResponse<ReleaseTypes.ReleaseDetail>` |
| `PromoteReleaseUseCase.promoteRelease` | `credential: String, tenant: UUID, space: UUID, releaseId: UUID, key: String` | `FlowResponse<ReleaseTypes.ReleaseDetail>` |
| `PublishPageUseCase.publishPage` | `credential: String, tenant: UUID, space: UUID, page: UUID, key: String` | `FlowResponse<ReleaseTypes.PublishResult>` |
| `PublishPagesUseCase.publishPages` | `credential: String, tenant: UUID, space: UUID, ids: List<UUID>, key: String` | `FlowResponse<ReleaseTypes.BatchPublishResult>` |
| `RollbackUseCase.rollback` | `credential: String, tenant: UUID, space: UUID, releaseId: UUID, key: String` | `FlowResponse<ReleaseTypes.ReleaseDetail>` |
| `SelectPagesOnCompletion.selectPages` | `binding: ReleaseSignals.SelectPages` | `void` |
| `SetRetentionUseCase.setRetention` | `credential: String, tenant: UUID, space: UUID, keep: int, key: String` | `FlowResponse<SpaceTypes.SpaceDetail>` |
| `UnpublishPageUseCase.unpublishPage` | `credential: String, tenant: UUID, space: UUID, page: UUID, key: String` | `FlowResponse<ReleaseTypes.PublishResult>` |
| `UnpublishPagesUseCase.unpublishPages` | `credential: String, tenant: UUID, space: UUID, ids: List<UUID>, key: String` | `FlowResponse<ReleaseTypes.BatchPublishResult>` |
| `ViewReleaseUseCase.viewRelease` | `credential: String, tenant: UUID, space: UUID, releaseId: UUID` | `ReleaseTypes.ReleaseDetail` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `ReleaseSignals.SelectPages` | `credential: String, tenant: UUID, space: UUID, ids: List<UUID>, key: String, publish: boolean, completion: RuleCompletion<FlowResponse<ReleaseTypes.BatchPublishResult>>` |
| `ReleaseTypes.Action` | `BUILD / SET_RETENTION / DISCARD / ROLLBACK / PROMOTE / ANNOTATE / IMPORT / APPROVE / EXPORT` |
| `ReleaseTypes.BatchPublishResult` | `pages: List<PageEditingTypes.PageSummary>, outcome: ReleaseTypes.Outcome, release: ReleaseTypes.ReleaseDetail` |
| `ReleaseTypes.BuildResult` | `outcome: ReleaseTypes.Outcome, release: ReleaseTypes.ReleaseDetail` |
| `ReleaseTypes.DeltaView` | `added: Set<UUID>, changed: Set<UUID>, removed: Set<UUID>` |
| `ReleaseTypes.DiffSummary` | `added: int, changed: int, removed: int` |
| `ReleaseTypes.IssueView` | `code: String, path: String, pageId: UUID, detail: String` |
| `ReleaseTypes.Outcome` | `PROMOTED / SKIPPED / HELD / UNCHANGED` |
| `ReleaseTypes.PipelineResult` | `outcome: ReleaseTypes.Outcome, release: ReleaseApi.View` |
| `ReleaseTypes.PublishResult` | `page: PageEditingTypes.PageDetail, outcome: ReleaseTypes.Outcome, release: ReleaseTypes.ReleaseDetail` |
| `ReleaseTypes.ReleaseDetail` | `id: UUID, label: String, status: String, source: ReleaseTypes.ReleaseSource, pageCount: int, createdAt: Instant, promotedAt: Instant, allowedActions: Set<ReleaseTypes.Action>, notes: String, report: ReleaseTypes.ReportView, diffSummary: ReleaseTypes.DiffSummary, size: Long` |
| `ReleaseTypes.ReleasePage` | `items: List<ReleaseTypes.ReleaseSummary>, nextCursor: String, total: Long, allowedActions: Set<ReleaseTypes.Action>` |
| `ReleaseTypes.ReleasePatch` | `labelPresent: boolean, label: String, notesPresent: boolean, notes: String` |
| `ReleaseTypes.ReleaseSource` | `kind: String, ref: String, actor: UUID` |
| `ReleaseTypes.ReleaseSpaceChoice` | `id: UUID, name: String, mode: String, status: String` |
| `ReleaseTypes.ReleaseSummary` | `id: UUID, label: String, status: String, source: ReleaseTypes.ReleaseSource, pageCount: int, createdAt: Instant, promotedAt: Instant, allowedActions: Set<ReleaseTypes.Action>` |
| `ReleaseTypes.ReportView` | `errors: List<ReleaseTypes.IssueView>, warnings: List<ReleaseTypes.IssueView>, info: List<ReleaseTypes.IssueView>` |
| `ReleaseTypes.TenantReleaseFilter` | `space: Optional<UUID>, mode: Optional<SpaceApi.Mode>, status: Optional<ReleaseApi.Status>` |
| `ReleaseTypes.TenantReleasePage` | `items: List<ReleaseTypes.TenantReleaseSummary>, nextCursor: String, total: Long, spaces: List<ReleaseTypes.ReleaseSpaceChoice>` |
| `ReleaseTypes.TenantReleaseSummary` | `id: UUID, label: String, status: String, source: ReleaseTypes.ReleaseSource, pageCount: int, createdAt: Instant, promotedAt: Instant, allowedActions: Set<ReleaseTypes.Action>, spaceId: UUID, spaceName: String, spaceMode: String, spaceStatus: String` |

<!-- interface-contract:end -->

## 管理凭据能力约束

`allowedActions` 是当前资源授权、业务状态、PAT task scope 与租户边界的交集。会话保持原有能力；PAT 的读取范围不隐含写入、发布或权限管理范围。管理 scope catalog 与网关及生成命令契约共用。预演只读观察不锁定执行，写入仍重新校验授权、ETag 与业务前置条件。

## 2026-10-18 内容解释配置

format 保留五种源码语法。contentType 与 interpretation(schema/catalogId/protocolVersion) 是正文解释配置，和正文在同一基线、同一事务保存并记录修订；省略配置保持已有值。取回修订同时取回正文及解释配置。工作稿允许无效的专用类型内容；发版校验是服务端权威，json-schema 与 a2ui 的无效内容不得晋升，包括整体导入、API 与热修。普通 json 继续保留任意源码。解释配置冻结进 Bundle、Release 与 SiteSnapshot，并参与渲染/检索指纹。专用类型的错误报告包含有限字段路径和稳定校验码，外部 schema 引用不发网络请求。


## Native completion protocol

`ReleaseRelay` publishes the bindings in `ReleaseSignals` synchronously at the corresponding call-completion or entry-continuation point. Each binding carries a unique occurrence and the current root flow. It is local execution data, not a second business state. Receiving rules claim their occurrence before effects and record one response. Equal-valued later requests use distinct occurrences; another flow cannot supply this binding. A missing response fails explicitly.

These continuations use the existing synchronous Java transaction and Spring event publisher. Receiving listeners must remain synchronous: no `@Async`, after-commit listener, durable replay, or independent transaction is added. Failures propagate to the caller and retain the original rollback/refusal policy. Persistent asynchronous delivery continues through the existing outboxes.

The native implementation retains the documented ordered transactional synchronization dialect. The typed binding is emitted only at the declared request/result branch; it does not join arbitrary historical concept events.

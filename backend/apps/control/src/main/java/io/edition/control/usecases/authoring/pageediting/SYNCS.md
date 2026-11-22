# syncs: 页面创作与修订

> Authoring `pageediting` flow 的唯一 sync 规格；共享约定见 [../../SYNCS.md](../../SYNCS.md)。
> 与唯一 `PageEditingFacade`、访问投影 `PageAccess`、响应投影 `PageProjection`、
> 预览 `PageRenderer` 共置一层浅包。真实归属走组合根 `ResourceChain`；authored 可写走
> `AuthoringWrites`。

## flow: 页面创作与修订

历史修订尚无ContentProfile时，由本组合层根据不可变Page.format解释为默认内容类型；读取与revert使用相同规则，不沿用当前工作稿新增的解释配置。Revision仍保持通用Item/Content边界，不依赖Page。

创建页面携带contentType/interpretation时，配置作为Page.create初始值直接写入；空正文仍为revision=0，修订列表为空。首次实际保存正文才变为revision=1并建立首份Revision，不通过空edit初始化配置。

触发: `Requesting.listPages/viewPage/createPage/previewPage/renamePage/editPage/
listRevisions/viewRevision/diffRevisions/revertPage/setSeo/setIcon/setProperty/removeProperty/
attach/detach/viewAttachment`（列表 `?tag=` 由本 flow 读 Tag._byLabel，打标写走 tagging；
`?q=` 匹配工作集标题或地址 slug 的包含，不搜正文）

所有入口显式携带 tenantId 与 spaceId；"真实 page→space→tenant" 由组合层先核对归属，再按
`[tenant, space, page]` 链 guard。租户准入（存在、未冻结、成员/绑定）走组合根 `TenantAccess`。
工作集不含已回收页：本 flow 的 GET 与工作区写遇 `trashedAt` 一律 404 `page_not_found`。
回收/还原入口在 [deletion](../deletion/SYNCS.md)，`ResourceChain` 对已回收页仍答 found。

工作区变更在幂等首次执行内按Space→Page顺序加锁，复核当前归属、active、来源模式和trashedAt。
读取接口保持只读；原键重放仍验证身份和权限，但不重新执行生命周期前置和变更。
正文edit允许synced热修，其余工作区写要求authored。
正文保存与取回修订共用锁内Page.edit→Revision.record接力；两者保留各自幂等操作、修订说明及热修策略。回收/恢复共用锁顺序，允许读取回收状态。

```text
sync listPages
// implementation: ListPagesUseCase#listPages
when {
  Requesting/listPages: [tenant: ?tenant; space: ?space; cursor: ?cursor; limit: ?limit; status: ?status; format: ?format; tag: ?tag; q: ?q] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
  Tag/_byLabel: [label: ?tag] => [items: ?tagged]
  Page/_page: [cursor: ?cursor; limit: ?limit; status: ?status; format: ?format] => [views: ?views]
  Permission/_filter: [chains: 各 [?tenant, ?space, ?page]; subject: ?principal; op: read] => [pages: ?readable]
  Tag/_labelsOf: [items: ?readable] => [labels: ?labels]
  ?items = ?views 中满足 ?tagged、?readable 与 q 过滤的页面，附上 ?labels
  工作集不含已回收页；filter.tag 经 Tag 归一化后精确匹配（非法 → 422 validation_failed）
  filter.q 对标题或该空间 slug 大小写不敏感包含（strip 后空忽略；可选前导 `/` 不计入；不匹配正文）
}
then {
  Requesting/respond: [request: ?request; items: ?items]
}

sync viewPage
// implementation: ViewPageUseCase#viewPage
when {
  Requesting/viewPage: [tenant: ?tenant; space: ?space; page: ?page] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.page: [tenant: ?tenant; space: ?space; page: ?page]
  Page/_view: [page: ?page] => [trashedAt: none]
  guard: [chain: [?tenant, ?space, ?page]; op: read]
}
then {
  Page/_view: [page: ?page]
}

sync listRevisions
// implementation: ListRevisionsUseCase#listRevisions
when {
  Requesting/listRevisions: [tenant: ?tenant; space: ?space; page: ?page; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.page: [tenant: ?tenant; space: ?space; page: ?page]
  Page/_view: [page: ?page] => [trashedAt: none]
  guard: [chain: [?tenant, ?space, ?page]; op: read]
  Revision/_list: [item: ?page; cursor: ?cursor; limit: ?limit] => [entries: ?entries]
}
then {
  Requesting/respond: [request: ?request; entries: ?entries]
}

sync viewRevision
// implementation: ViewRevisionUseCase#viewRevision
when {
  Requesting/viewRevision: [tenant: ?tenant; space: ?space; page: ?page; n: ?n] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.page: [tenant: ?tenant; space: ?space; page: ?page]
  Page/_view: [page: ?page] => [trashedAt: none]
  guard: [chain: [?tenant, ?space, ?page]; op: read]
  Revision/_content: [item: ?page; n: ?n] => [content: ?content]
}
then {
  Requesting/respond: [request: ?request; content: ?content]
}

sync diffRevisions
// implementation: DiffRevisionsUseCase#diffRevisions
when {
  Requesting/diffRevisions: [tenant: ?tenant; space: ?space; page: ?page; from: ?from; to: ?to] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.page: [tenant: ?tenant; space: ?space; page: ?page]
  Page/_view: [page: ?page] => [trashedAt: none]
  guard: [chain: [?tenant, ?space, ?page]; op: read]
  Revision/_diff: [item: ?page; from: ?from; to: ?to] => [hunks: ?hunks]
}
then {
  Requesting/respond: [request: ?request; hunks: ?hunks]
}

sync createPage
// implementation: CreatePageUseCase#createPage
when {
  Requesting/createPage: [tenant: ?tenant; space: ?space; format: ?format; title: ?title; slug: ?slug] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
  guard: [chain: [?tenant, ?space]; op: write]
  AuthoringWrites: [space: ?space]
}
then {
  Page/create: [actor: ?actor; format: ?format; title: ?title]
}

mediator branch placeCreatedPage
when {
  Requesting/createPage: [tenant: ?tenant; space: ?space; format: ?format; title: ?title; slug: ?slug] => [request: ?request]
  Page/create: [actor: ?actor; format: ?format; title: ?title] => [page: ?page]
}
then {
  Space/place: [space: ?space; item: ?page; slug: ?slug]
}

mediator branch createPageRejected
when {
  Requesting/createPage: [tenant: ?tenant; space: ?space; format: ?format; title: ?title; slug: ?slug] => [request: ?request]
  Space/place: [space: ?space; item: ?page; slug: ?slug] => [error: SlugTaken | SlugInvalid]
}
then {
  Requesting/respond: [request: ?request; error: ?error]
}

sync previewPage
// implementation: PreviewPageUseCase#previewPage
when {
  Requesting/previewPage: [tenant: ?tenant; space: ?space; format: ?format; content: ?content] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
  guard: [chain: [?tenant, ?space]; op: read]
  输入大小合法
}
then {
  Requesting/respond: [request: ?request; html: ?html]
  // 共享 renderer+sanitizer；不保存、不产生 Revision
}

sync renamePage
// implementation: RenamePageUseCase#renamePage
when {
  Requesting/renamePage: [tenant: ?tenant; space: ?space; page: ?page; title: ?title] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.page: [tenant: ?tenant; space: ?space; page: ?page]
  Page/_view: [page: ?page] => [trashedAt: none]
  guard: [chain: [?tenant, ?space, ?page]; op: write]
  AuthoringWrites: [space: ?space]
}
then {
  Page/rename: [page: ?page; title: ?title; actor: ?actor]
}

sync editPage
// implementation: EditPageUseCase#editPage
when {
  Requesting/editPage: [tenant: ?tenant; space: ?space; page: ?page; content: ?content; ifMatch: ?base] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.page: [tenant: ?tenant; space: ?space; page: ?page]
  Page/_view: [page: ?page] => [trashedAt: none]
  guard: [chain: [?tenant, ?space, ?page]; op: write]
  AuthoringWrites: [space: ?space; allowHotfix: true]
  Space/_status: [space: ?space] => [status: active]
}
then {
  Page/edit: [page: ?page; content: ?content; base: ?base; author: ?actor]
  // synced 热修与 hotfixAutoPromote 同事务；失败整单回滚正文。create/rename/publish 仍 authored-only
}


// 共用组合规则；只由 editPage/revertPage 在已有工作区写锁与事务内调用，不是独立请求入口。
// 对应两条请求规则中的 Page/edit 与 saveRevision 接力，不额外订阅 Page 完成事件。
sync editAndRecord
// implementation: EditAndRecordOnCompletion#editAndRecord
// 输入：page、待保存 content、baseRevision、resolution、note（正文编辑为 none，取回为 restored-from:n）。
// 执行 Page/edit；成功后用返回 revision/content 调用 Revision/record 并返回 edited。
// Conflict/NotFound/ContentTooLarge 拒绝不记录修订；Revision/record 故障回滚正文与幂等记录。

mediator branch saveRevision
when {
  Requesting/editPage: [tenant: ?tenant; space: ?space; page: ?page] => [request: ?request]
  Page/edit: [page: ?page; content: ?content; base: ?base; author: ?actor] => [page: ?edited]
}
then {
  Revision/record: [item: ?page; n: ?edited.revision; content: ?content; author: ?actor]
  // 与 edit、幂等结果共享事务
}

sync hotfixAutoPromote
// implementation: HotfixAutoPromoteOnCompletion#hotfixAutoPromote
when {
  Requesting/editPage: [tenant: ?tenant; space: ?space; page: ?page] => [request: ?request]
  Page/edit: [page: ?page; content: ?content; base: ?base; author: ?actor] => [page: ?edited]
}
where {
  Space/_spaceOf: [item: ?page] => [space: ?space]
  Space/_mode: [space: ?space] => [mode: synced]
  ?ref = string(?page); ?actorId = ?actor.id
}
then {
  Release/draft: [scope: ?space; source: {kind: build; ref: ?ref; actor: ?actorId}]
}

mediator branch loadHotfixDraft
when {
  Requesting/editPage: [space: ?space; page: ?page] => [request: ?request]
  Page/edit: [page: ?page] => [page: ?edited]
  Release/draft: [scope: ?space; source: {kind: build; ref: ?ref; actor: ?actor}] => [rel: ?rel]
}
where {
  Space/_mode: [space: ?space] => [mode: synced]
  ?bundle = live 快照覆盖 ?edited 页面；无 live 是不变量失败
}
then {
  Release/load: [rel: ?rel; bundle: ?bundle]
}

mediator branch validateHotfixLoad
when {
  Requesting/editPage: [space: ?space] => [request: ?request]
  Release/load: [rel: ?rel] => [rel: ?rel]
}
then {
  Release/validate: [rel: ?rel; coverageWarnings: {}]
}

mediator branch promoteHotfixValidation
when {
  Requesting/editPage: [space: ?space] => [request: ?request]
  Release/validate: [rel: ?rel; coverageWarnings: {}] => [rel: ?rel]
}
then {
  Release/promote: [rel: ?rel]
}

mediator branch pruneHotfixPromotion
when {
  Requesting/editPage: [space: ?space] => [request: ?request]
  Release/promote: [rel: ?rel] => [rel: ?rel]
}
then {
  Release/prune: [scope: ?space]
}
// 与 Page/edit 同事务；HotfixSnapshots 直调概念，不经 releases.autoValidate。
// load invalid_bundle / validate errors / 依赖故障使整单回滚（含正文），不留 held draft；不跑 mirror。

mediator branch editConflict
when {
  Page/edit: [page: ?page; content: ?content; base: ?base; author: ?actor] => [error: Conflict]
}
then {
  Requesting/respond: [request: ?request; error: Conflict]
  // 提示合并，杜绝静默覆盖
}

sync revertPage
// implementation: RevertPageUseCase#revertPage
when {
  Requesting/revertPage: [tenant: ?tenant; space: ?space; page: ?page; n: ?n; ifMatch: ?base] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.page: [tenant: ?tenant; space: ?space; page: ?page]
  Page/_view: [page: ?page] => [trashedAt: none]
  guard: [chain: [?tenant, ?space, ?page]; op: write]
  AuthoringWrites: [space: ?space]
  Revision/_content: [item: ?page; n: ?n] => [content: ?content]
}
then {
  Page/edit: [page: ?page; content: ?content; base: ?base; author: ?actor]
}

mediator branch recordRevertedRevision
when {
  Requesting/revertPage: [tenant: ?tenant; space: ?space; page: ?page; n: ?n] => [request: ?request]
  Page/edit: [page: ?page; content: ?content; base: ?base; author: ?actor] => [page: ?edited]
}
then {
  Revision/record: [item: ?page; n: ?edited.revision; content: ?content; author: ?actor; note: "restored-from:<n>"]
  // edit+record+幂等结果共享事务；旧 If-Match 走 editConflict
}
```

### 页面元数据与附件（同 guard，不动内容基线）

以下动作只改页面自身字段：不递增 revision、不产生 Revision、不要求 If-Match，后写覆盖；
均强制 Idempotency-Key（viewAttachment 除外）并与幂等结果共享事务。

```text
sync setSeo
// implementation: SetSeoUseCase#setSeo
when {
  Requesting/setSeo: [tenant: ?tenant; space: ?space; page: ?page; seoPatch: ?patch] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.page: [tenant: ?tenant; space: ?space; page: ?page]
  Page/_view: [page: ?page] => [trashedAt: none]
  guard: [chain: [?tenant, ?space, ?page]; op: write]
  AuthoringWrites: [space: ?space]
  patch 非空且各字段合法
}
then {
  Page/setSeo: [page: ?page; patch: ?patch; actor: ?actor]
}

sync setIcon
// implementation: SetIconUseCase#setIcon
when {
  Requesting/setIcon: [tenant: ?tenant; space: ?space; page: ?page; icon: ?icon] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.page: [tenant: ?tenant; space: ?space; page: ?page]
  Page/_view: [page: ?page] => [trashedAt: none]
  guard: [chain: [?tenant, ?space, ?page]; op: write]
  AuthoringWrites: [space: ?space]
  icon 为空或合法 URL
}
then {
  Page/setIcon: [page: ?page; icon: ?icon; actor: ?actor]
}

sync setProperty
// implementation: SetPropertyUseCase#setProperty
when {
  Requesting/setProperty: [tenant: ?tenant; space: ?space; page: ?page; field: ?field; value: ?value] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.page: [tenant: ?tenant; space: ?space; page: ?page]
  Page/_view: [page: ?page] => [trashedAt: none]
  guard: [chain: [?tenant, ?space, ?page]; op: write]
  AuthoringWrites: [space: ?space]
}
then {
  Page/setProperty: [page: ?page; field: ?field; value: ?value; actor: ?actor]
  // upsert；键/值/个数越限 → validation_failed
}

sync removeProperty
// implementation: RemovePropertyUseCase#removeProperty
when {
  Requesting/removeProperty: [tenant: ?tenant; space: ?space; page: ?page; field: ?field] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.page: [tenant: ?tenant; space: ?space; page: ?page]
  Page/_view: [page: ?page] => [trashedAt: none]
  guard: [chain: [?tenant, ?space, ?page]; op: write]
  AuthoringWrites: [space: ?space]
}
then {
  Page/removeProperty: [page: ?page; field: ?field; actor: ?actor]
  // 不存在的键幂等
}

sync attach
// implementation: AttachUseCase#attach
when {
  Requesting/attach: [tenant: ?tenant; space: ?space; page: ?page; file: ?file] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.page: [tenant: ?tenant; space: ?space; page: ?page]
  Page/_view: [page: ?page] => [trashedAt: none]
  guard: [chain: [?tenant, ?space, ?page]; op: write]
  AuthoringWrites: [space: ?space]
  文件大小/嗅探类型/文件名/个数合法
}
then {
  Page/attach: [page: ?page; file: ?file; actor: ?actor]
}

mediator branch storeAttachedObject
when {
  Requesting/attach: [tenant: ?tenant; space: ?space; page: ?page; file: ?file] => [request: ?request]
  Page/attach: [page: ?page; file: ?file; actor: ?actor] => [page: ?page; attachment: ?ref]
}
then {
  ObjectStore/putIfAbsent: [key: ?ref.storageKey; bytes: ?file; contentType: ?ref.mime]
  // ObjectStore 平台概念；不可用 → 503，事务回滚。绝不留下「有 ref 无对象」
}

mediator branch attachRejected
when {
  Requesting/attach: [tenant: ?tenant; space: ?space; page: ?page; file: ?file] => [request: ?request]
  Page/attach: [page: ?page; file: ?file; actor: ?actor] => [error: FileTooLarge | FileTypeUnsupported | TooManyAttachments | Invalid]
}
then {
  Requesting/respond: [request: ?request; error: ?error]
}

sync detach
// implementation: DetachUseCase#detach
when {
  Requesting/detach: [tenant: ?tenant; space: ?space; page: ?page; ref: ?ref] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.page: [tenant: ?tenant; space: ?space; page: ?page]
  Page/_view: [page: ?page] => [trashedAt: none]
  guard: [chain: [?tenant, ?space, ?page]; op: write]
  AuthoringWrites: [space: ?space]
}
then {
  Page/detach: [page: ?page; ref: ?ref; actor: ?actor]
  // 只摘引用；对象保留（ADR-0008）
}

sync viewAttachment
// implementation: ViewAttachmentUseCase#viewAttachment
when {
  Requesting/viewAttachment: [tenant: ?tenant; space: ?space; page: ?page; ref: ?ref] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.page: [tenant: ?tenant; space: ?space; page: ?page]
  Page/_view: [page: ?page] => [trashedAt: none]
  guard: [chain: [?tenant, ?space, ?page]; op: read]
  Page/_attachment: [page: ?page; ref: ?ref] => [file: ?file]
}
then {
  Requesting/respond: [request: ?request; url: downloadAttachment; expiresAt: null; filename: ?file.filename; mime: ?file.mime; sizeBytes: ?file.sizeBytes]
  // 不签发对象存储 GET 地址
}

mediator branch attachmentMissing
when {
  Page/_attachment: [page: ?page; ref: ?ref] => []
}
then {
  Requesting/respond: [request: ?request; error: AttachmentNotFound]
}
```

错误词汇：`page_not_found` / `revision_not_found` / `space_mode_restricted` / `slug_taken` / `edit_conflict`
/ `file_too_large` / `file_type_unsupported` / `too_many_attachments` / `attachment_not_found`
与各 `validation_failed` 违反项属本 flow；`space_archived` 复用 space 的异常；
`If-Match` 缺失或格式错误（428 / 400）是 HTTP 头解析问题，异常归 gateway；multipart 超过
servlet 上限同样收口为 `file_too_large`。

本包不承接 `Revision.prune`，该动作由 [termination](../termination/SYNCS.md) 的终结级联调用。除 editPage + hotfixAutoPromote 外，本 flow 页面
mutation 均限 authored+active（create / rename / revert / seo / icon / properties / attach /
detach）。synced 仅既有页 content 热修；create/rename/publish 仍 409 `space_mode_restricted`。
edit 与 hotfixAutoPromote 同事务，不存在只改正文不发版的中间半态。
附件对象回收由 ObjectStore 平台概念的预留与引用保护处理；交付附件由独立 reader 读取投影，
不使用管理面短时签名地址。导入发版包附件走 bundleimport。

```text
sync downloadAttachment
// implementation: DownloadAttachmentUseCase#downloadAttachment
when {
  Requesting/downloadAttachment: [tenant: ?tenant; space: ?space; page: ?page; ref: ?ref] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.page: [tenant: ?tenant; space: ?space; page: ?page]
  Page/_view: [page: ?page] => [trashedAt: none]
  guard: [chain: [?tenant, ?space, ?page]; op: read]
  Page/_attachment: [page: ?page; ref: ?ref] => [file: ?file]
}
then {
  Requesting/respond: [request: ?request; stream: ?file]
  // 流式代理对象；no-store、不签发读地址；已开始的响应不追溯撤回
}
```

ADR-0023：viewAttachment使用鉴权代理，expiresAt=null。对象依赖故障仍503，缺失的被引用对象也是故障，不伪装正常空附件。

## 编辑与渲染方言

previewPage 对 Markdown 使用 `contracts/markdown-rendering.md` 的 CommonMark + 表格/任务列表/删除线约定，与独立阅读同时验收。HTML 与 Markdown 渲染结果继续过白名单；TXT/JSON/XML 保留原文，转义后放入 pre/code，再过同一白名单。预览为只读动作，不建立修订。可视化编辑仍调用原 editPage/content 保存字符串并使用原 If-Match。

前端创建旅程：成功响应是已提交事实；列表刷新、导航或后续查询失败不得改写为创建失败。

## 2026-10-22 内容快照、意图和批量读取

`viewPageContent` 在同一次 Page._view 中返回 id、format、content、revision 和解释配置；正文 ETag 仅标识该内容基线。完整详情的 ETag 标识序列化表示，兼容写端暂接受含 content revision 的旧详情标签；新客户端只使用内容快照的 ETag。元数据仍后写覆盖，不增加内容 revision。publishedAt 是废弃的未知页面级时间，保持 null；不得用 updatedAt 填充，也不代表主版本晋升或站点上线时间。

`editPage.intent` 可为 draft_only 或 hotfix。draft_only 仅 authored，保存工作内容而不晋升；hotfix 仅 synced，沿用原子热修链。省略仅供旧客户端兼容原有按 mode 分流；显式意图进入幂等指纹，并在工作区锁内再次检查 mode，拒绝不能满足的意图时不产生正文、修订或主版本效果。

`batchGetPages` 是只读查询，输入同 Space 的 1..100 个不同 Page id 和 summary/content 视图；按输入 id 返回关联结果。每页独立检查真实归属、工作集状态和当前 read 权限，不存在、其他空间与不可读统一 not_found。内容视图每项返回原子内容快照及内容基线；不承诺所有页是跨页事务快照。序列化响应上限 4MiB，超限返回 validation_failed(response,too_large)，调用方缩批或选 summary。

`listPages.ids` 支持上述同 Space 明确 id 集合的摘要过滤，最多100且无分页；与显式 limit、cursor 或其他过滤组合返回 validation_failed，不能静默忽略。

```text
sync viewPageContent
// implementation: ViewPageContentUseCase#viewPageContent
when { Requesting/viewPageContent: [tenant: ?tenant; space: ?space; page: ?page] => [request: ?request] }
where { ResourceChain.page: [tenant: ?tenant; space: ?space; page: ?page]; guard: [chain: [?tenant, ?space, ?page]; op: read] }
then { Page/_view: [page: ?page] => [content: ?content; revision: ?revision] }

sync batchGetPages
// implementation: BatchGetPagesOnCompletion#batchGetPages
when { Requesting/batchGetPages: [tenant: ?tenant; space: ?space; ids: ?ids; view: ?view] => [request: ?request] }
where { TenantAccess: [tenant: ?tenant]; ResourceChain.space: [tenant: ?tenant; space: ?space]; Permission/_filter: [chains: 各页面真实资源链; op: read] }
then { Page/_views: [pages: ?ids] => [views: ?views]; Requesting/respond: [request: ?request; items: 逐项归属和权限收窄结果] }

mediator branch requireIds
when { Requesting/batchGetPages 或 Requesting/listPages: [ids: ?ids] => [request: ?request] }
where { ?ids 不是 1..100 个不同且非空的 Page id }
then { Requesting/respond: [request: ?request; error: validation_failed; field: ids] }
```

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `AttachUseCase.attach` | `credential: String, tenant: UUID, space: UUID, page: UUID, filename: String, bytes: byte[], key: String` | `FlowResponse<PageEditingTypes.PageDetail>` |
| `BatchGetPagesOnCompletion.batchGetPages` | `binding: PageEditingSignals.BatchGetPages` | `void` |
| `BatchGetPagesOnCompletion.batchGetPages` | `credential: String, tenant: UUID, space: UUID, ids: List<UUID>, view: PageEditingTypes.ReadView` | `PageEditingTypes.BatchPages` |
| `CreatePageUseCase.createPage` | `credential: String, tenant: UUID, space: UUID, format: String, title: String, slug: String, key: String, profile: ContentProfile` | `FlowResponse<PageEditingTypes.PageDetail>` |
| `CreatePageUseCase.createPage` | `credential: String, tenant: UUID, space: UUID, format: String, title: String, slug: String, key: String` | `FlowResponse<PageEditingTypes.PageDetail>` |
| `DetachUseCase.detach` | `credential: String, tenant: UUID, space: UUID, page: UUID, ref: UUID, key: String` | `FlowResponse<PageEditingTypes.PageDetail>` |
| `DiffRevisionsUseCase.diffRevisions` | `credential: String, tenant: UUID, space: UUID, page: UUID, from: int, to: int` | `PageEditingTypes.RevisionDiff` |
| `DownloadAttachmentUseCase.downloadAttachment` | `credential: String, tenant: UUID, space: UUID, page: UUID, ref: UUID` | `PageEditingTypes.AttachmentContent` |
| `EditAndRecordOnCompletion.editAndRecord` | `binding: PageEditingSignals.EditAndRecord` | `void` |
| `EditPageUseCase.editPage` | `credential: String, tenant: UUID, space: UUID, page: UUID, content: String, baseRevision: int, key: String, profile: ContentProfile, intent: PageEditingTypes.EditIntent` | `FlowResponse<PageEditingTypes.PageDetail>` |
| `EditPageUseCase.editPage` | `credential: String, tenant: UUID, space: UUID, page: UUID, content: String, baseRevision: int, key: String, profile: ContentProfile` | `FlowResponse<PageEditingTypes.PageDetail>` |
| `EditPageUseCase.editPage` | `credential: String, tenant: UUID, space: UUID, page: UUID, content: String, baseRevision: int, key: String` | `FlowResponse<PageEditingTypes.PageDetail>` |
| `HotfixAutoPromoteOnCompletion.hotfixAutoPromote` | `binding: PageEditingSignals.HotfixAutoPromote` | `void` |
| `ListPagesUseCase.listPages` | `credential: String, tenant: UUID, space: UUID, cursor: String, limit: int, status: String, format: String, tag: String, q: String, ids: List<UUID>` | `PageEditingTypes.PagePage` |
| `ListPagesUseCase.listPages` | `credential: String, tenant: UUID, space: UUID, cursor: String, limit: int, status: String, format: String, tag: String, q: String` | `PageEditingTypes.PagePage` |
| `ListRevisionsUseCase.listRevisions` | `credential: String, tenant: UUID, space: UUID, page: UUID, cursor: String, limit: int` | `PageEditingTypes.RevisionPage` |
| `PreviewPageUseCase.previewPage` | `credential: String, tenant: UUID, space: UUID, format: String, content: String` | `PageEditingTypes.Preview` |
| `RemovePropertyUseCase.removeProperty` | `credential: String, tenant: UUID, space: UUID, page: UUID, field: String, key: String` | `FlowResponse<PageEditingTypes.PageDetail>` |
| `RenamePageUseCase.renamePage` | `credential: String, tenant: UUID, space: UUID, page: UUID, title: String, key: String` | `FlowResponse<PageEditingTypes.PageDetail>` |
| `RevertPageUseCase.revertPage` | `credential: String, tenant: UUID, space: UUID, page: UUID, targetRevision: int, baseRevision: int, key: String` | `FlowResponse<PageEditingTypes.PageDetail>` |
| `SetIconUseCase.setIcon` | `credential: String, tenant: UUID, space: UUID, page: UUID, icon: String, key: String` | `FlowResponse<PageEditingTypes.PageDetail>` |
| `SetPropertyUseCase.setProperty` | `credential: String, tenant: UUID, space: UUID, page: UUID, field: String, value: String, key: String` | `FlowResponse<PageEditingTypes.PageDetail>` |
| `SetSeoUseCase.setSeo` | `credential: String, tenant: UUID, space: UUID, page: UUID, patch: PageEditingTypes.SeoPatch, key: String` | `FlowResponse<PageEditingTypes.PageDetail>` |
| `ViewAttachmentUseCase.viewAttachment` | `credential: String, tenant: UUID, space: UUID, page: UUID, ref: UUID` | `PageEditingTypes.AttachmentLink` |
| `ViewPageContentUseCase.viewPageContent` | `credential: String, tenant: UUID, space: UUID, page: UUID` | `PageEditingTypes.ContentSnapshot` |
| `ViewPageUseCase.viewPage` | `credential: String, tenant: UUID, space: UUID, page: UUID` | `PageEditingTypes.PageDetail` |
| `ViewRevisionUseCase.viewRevision` | `credential: String, tenant: UUID, space: UUID, page: UUID, revision: int` | `PageEditingTypes.RevisionDetail` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `PageEditingSignals.BatchGetPages` | `credential: String, tenant: UUID, space: UUID, ids: List<UUID>, view: PageEditingTypes.ReadView, completion: RuleCompletion<PageEditingTypes.BatchPages>` |
| `PageEditingSignals.EditAndRecord` | `page: UUID, content: String, baseRevision: int, resolution: PrincipalResolver.Resolution, note: String, profile: ContentProfile, completion: RuleCompletion<PageApi.View>` |
| `PageEditingSignals.HotfixAutoPromote` | `tenant: UUID, space: SpaceApi.View, page: PageApi.View, actorId: UUID, completion: RuleCompletion<Void>` |
| `PageEditingTypes.Action` | `CREATE / READ / RENAME / EDIT / REVERT / RESLUG / TRANSFER / PUBLISH / UNPUBLISH` |
| `PageEditingTypes.ActorView` | `type: String, id: UUID, displayName: String, status: String` |
| `PageEditingTypes.AttachmentContent` | `stream: InputStream, filename: String, mime: String, sizeBytes: long` |
| `PageEditingTypes.AttachmentLink` | `url: String, expiresAt: Instant, filename: String, mime: String, sizeBytes: long` |
| `PageEditingTypes.Attachment` | `id: UUID, filename: String, mime: String, sizeBytes: long, contentPath: String` |
| `PageEditingTypes.BatchPage` | `id: UUID, status: PageEditingTypes.ReadStatus, page: PageEditingTypes.PageSummary, content: PageEditingTypes.ContentSnapshot` |
| `PageEditingTypes.BatchPages` | `items: List<PageEditingTypes.BatchPage>` |
| `PageEditingTypes.ContentSnapshot` | `id: UUID, format: String, content: String, revision: int, contentType: String, versionRef: String, interpretation: Map<String, Object>` |
| `PageEditingTypes.DiffHunk` | `oldStart: int, oldLines: int, newStart: int, newLines: int, lines: List<PageEditingTypes.DiffLine>` |
| `PageEditingTypes.DiffLine` | `type: String, content: String` |
| `PageEditingTypes.EditIntent` | `DRAFT_ONLY / HOTFIX` |
| `PageEditingTypes.PageDetail` | `id: UUID, title: String, slug: String, status: String, format: String, icon: String, tags: List<String>, driftFlag: boolean, updatedAt: Instant, updatedBy: UUID, publishedAt: Instant, allowedActions: Set<PageEditingTypes.Action>, content: String, revision: int, seo: PageEditingTypes.Seo, properties: Map<String, String>, attachments: List<PageEditingTypes.Attachment>, trashedAt: Instant, revisionCount: long, wordCount: long, readingTime: long, contentType: String, versionRef: String, interpretation: Map<String, Object>` |
| `PageEditingTypes.PagePage` | `items: List<PageEditingTypes.PageSummary>, nextCursor: String, total: Long, allowedActions: Set<PageEditingTypes.Action>` |
| `PageEditingTypes.PageSummary` | `id: UUID, title: String, slug: String, status: String, format: String, icon: String, tags: List<String>, driftFlag: boolean, updatedAt: Instant, updatedBy: UUID, publishedAt: Instant, allowedActions: Set<PageEditingTypes.Action>, contentType: String, versionRef: String, interpretation: Map<String, Object>` |
| `PageEditingTypes.Preview` | `html: String` |
| `PageEditingTypes.ReadStatus` | `OK / NOT_FOUND` |
| `PageEditingTypes.ReadView` | `SUMMARY / CONTENT` |
| `PageEditingTypes.RevisionDetail` | `n: int, actor: PageEditingTypes.ActorView, createdAt: Instant, note: String, sizeBytes: long, sizeDelta: long, content: String, contentType: String, versionRef: String, interpretation: Map<String, Object>` |
| `PageEditingTypes.RevisionDiff` | `from: int, to: int, hunks: List<PageEditingTypes.DiffHunk>` |
| `PageEditingTypes.RevisionEntry` | `n: int, actor: PageEditingTypes.ActorView, createdAt: Instant, note: String, sizeBytes: long, sizeDelta: long` |
| `PageEditingTypes.RevisionPage` | `items: List<PageEditingTypes.RevisionEntry>, nextCursor: String` |
| `PageEditingTypes.SeoPatch` | `title: PageApi.Patch<String>, description: PageApi.Patch<String>, keywords: PageApi.Patch<String>, ogImage: PageApi.Patch<String>, noIndex: Optional<Boolean>` |
| `PageEditingTypes.Seo` | `title: String, description: String, keywords: String, ogImage: String, noIndex: boolean` |

<!-- interface-contract:end -->

## 管理凭据能力约束

`allowedActions` 是当前资源授权、业务状态、PAT task scope 与租户边界的交集。会话保持原有能力；PAT 的读取范围不隐含写入、发布或权限管理范围。管理 scope catalog 与网关及生成命令契约共用。预演只读观察不锁定执行，写入仍重新校验授权、ETag 与业务前置条件。

## 2026-10-18 内容解释配置

format 保留五种源码语法。contentType 与 interpretation(schema/catalogId/protocolVersion) 是正文解释配置，和正文在同一基线、同一事务保存并记录修订；省略配置保持已有值。取回修订同时取回正文及解释配置。工作稿允许无效的专用类型内容；发版校验是服务端权威，json-schema 与 a2ui 的无效内容不得晋升，包括整体导入、API 与热修。普通 json 继续保留任意源码。解释配置冻结进 Bundle、Release 与 SiteSnapshot，并参与渲染/检索指纹。专用类型的错误报告包含有限字段路径和稳定校验码，外部 schema 引用不发网络请求。

恢复内容修订时仅比较历史与当前实际固定类型/版本：绑定改变须启用，同绑定可恢复正文；不合并默认配置、不查active重新解释。既有Release回滚继续使用不可变快照。


## Implementation policy ownership

`PageIds` owns `requireIds`. These names denote entry policy, refusal translation, or a read projection. They do not create completion events or persist rule identities. Protected effects retain the original transaction, lock, and tenant scope.


## Native completion protocol

`PageEditingRelay` publishes the bindings in `PageEditingSignals` synchronously at the corresponding call-completion or entry-continuation point. Each binding carries a unique occurrence and the current root flow. It is local execution data, not a second business state. Receiving rules claim their occurrence before effects and record one response. Equal-valued later requests use distinct occurrences; another flow cannot supply this binding. A missing response fails explicitly.

These continuations use the existing synchronous Java transaction and Spring event publisher. Receiving listeners must remain synchronous: no `@Async`, after-commit listener, durable replay, or independent transaction is added. Failures propagate to the caller and retain the original rollback/refusal policy. Persistent asynchronous delivery continues through the existing outboxes.

The native implementation retains the documented ordered transactional synchronization dialect. The typed binding is emitted only at the declared request/result branch; it does not join arbitrary historical concept events.

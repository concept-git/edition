# concept Page [Format]

## purpose
让一份多格式内容走完从草稿、进版到删除可反悔的编辑生命周期

## state
title: Page -> String
format: Page -> Format
content: Page -> Content
revision: Page -> Int
status: Page -> {draft, published}
seoTitle: Page -> lone String
seoDescription: Page -> lone String
seoKeywords: Page -> lone String
ogImage: Page -> lone Image
noIndex: Page -> Bool
icon: Page -> lone Image
properties: Page -> Field -> Value
attachments: Page -> Ref -> File
trashedAt: Page -> lone Time

Page 由本概念创建。create 无 initial 时 status=draft、content=""、revision=0。revision 是当前基线号，edit 成功即递增。
attachments 以 ref 为键。正文上限 2MiB，附件单文件 10MiB、每页最多 50，属性最多 50。
TXT/JSON/XML 是 UTF-8 源码文本格式，保存原文；编辑中允许暂时不完整的 JSON/XML，不做 schema 或外部实体解析。阅读与预览必须将其作为文本转义显示。

## actions
create [actor: Author; format: Format; title: String] => [page: Page]
  requires title 合法
  ensures status=draft, content="", revision=0

create [actor: Author; format: Format; title: String] => [error: InvalidTitle]
  requires title 不合法
  ensures 返回 InvalidTitle；不创建

create [actor: Author; format: Format; title: String; profile: lone ContentProfile] => [page: Page]
  requires title 合法
  ensures status=draft, content="", revision=0；解释配置是创建初始值，与空正文同次写入，不执行edit，不建立正文修订

create [actor: Author; format: Format; title: String; profile: lone ContentProfile] => [error: InvalidTitle]
  ensures 不创建

create [actor: Author; format: Format; title: String; id: Page] => [page: Page]
  requires title 合法且 id 未被占用
  ensures 使用调用方预定的 Page id 创建

create [actor: Author; format: Format; title: String; id: Page] => [error: InvalidTitle]
create [actor: Author; format: Format; title: String; id: Page] => [error: IdTaken]

create [actor: Author; format: Format; title: String; id: Page; initial: InitialContent] => [page: Page]
  requires title/content/seo/properties 全部合法且 id 未被占用
  ensures status=draft, content=initial.content, revision=1；创建、初始正文及元数据整体校验后一次写入

create [actor: Author; format: Format; title: String; id: Page; initial: InitialContent] => [error: InvalidTitle]
create [actor: Author; format: Format; title: String; id: Page; initial: InitialContent] => [error: IdTaken]
create [actor: Author; format: Format; title: String; id: Page; initial: InitialContent] => [error: ContentTooLarge]
create [actor: Author; format: Format; title: String; id: Page; initial: InitialContent] => [error: Invalid]

edit [page: Page; content: Content; base: Int; author: Author] => [page: Page]
  requires page 存在且 base = revision 且 content 未超限
  ensures content 整体替换、revision+1

edit [page: Page; content: Content; base: Int; author: Author] => [error: Conflict]
  requires page 存在且 base ≠ revision
  ensures 返回 Conflict(theirs)；状态不变

edit [page: Page; content: Content; base: Int; author: Author] => [error: ContentTooLarge]
  requires content 超限
  ensures 返回 ContentTooLarge；状态不变

edit [page: Page; content: Content; base: Int; author: Author] => [error: NotFound]
  requires page 不存在
  ensures 返回 NotFound；状态不变

rename [page: Page; title: String; actor: Author] => [page: Page]
  requires page 存在且 title 合法
  ensures 更新 title

rename [page: Page; title: String; actor: Author] => [error: InvalidTitle]
rename [page: Page; title: String; actor: Author] => [error: NotFound]

setSeo [page: Page; patch: SeoPatch; actor: Author] => [page: Page]
  requires page 存在且 patch 非空且各字段合法
  ensures merge-patch：Unchanged 保持、Clear 清空、Set 覆盖；noIndex 只有保持/覆盖

setSeo [page: Page; patch: SeoPatch; actor: Author] => [error: Invalid]
  requires 空 patch 或字段不合法
  ensures 返回 Invalid(field, code)；空 patch 的 code 为 empty_patch

setSeo [page: Page; patch: SeoPatch; actor: Author] => [error: NotFound]

setIcon [page: Page; icon: Image; actor: Author] => [page: Page]
  requires page 存在且 icon 合法或为清空
  ensures icon=null 即清空

setIcon [page: Page; icon: Image; actor: Author] => [error: Invalid]
setIcon [page: Page; icon: Image; actor: Author] => [error: NotFound]

setProperty [page: Page; field: Field; value: Value; actor: Author] => [page: Page]
setProperty [page: Page; field: Field; value: Value; actor: Author] => [error: Invalid]
setProperty [page: Page; field: Field; value: Value; actor: Author] => [error: NotFound]

replaceProperties [page: Page; values: Field -> Value; actor: Author] => [page: Page]
  requires page 存在且全部键值与数量合法
  ensures 完整替换；不递增 revision

replaceProperties [page: Page; values: Field -> Value; actor: Author] => [error: Invalid]
replaceProperties [page: Page; values: Field -> Value; actor: Author] => [error: NotFound]

removeProperty [page: Page; field: Field; actor: Author] => [page: Page]
removeProperty [page: Page; field: Field; actor: Author] => [error: Invalid]
removeProperty [page: Page; field: Field; actor: Author] => [error: NotFound]

attach [page: Page; file: FileUpload; actor: Author] => [page: Page; attachment: Attachment]
  requires page 存在且文件合法
  ensures 以 ref 登记附件
  ensures 附件创建时间统一为微秒精度；首次返回与持久化后回读一致

attach [page: Page; file: FileUpload; actor: Author] => [error: FileTooLarge]
attach [page: Page; file: FileUpload; actor: Author] => [error: FileTypeUnsupported]
attach [page: Page; file: FileUpload; actor: Author] => [error: TooManyAttachments]
attach [page: Page; file: FileUpload; actor: Author] => [error: Invalid]
attach [page: Page; file: FileUpload; actor: Author] => [error: NotFound]

detach [page: Page; ref: Ref; actor: Author] => [page: Page]
  requires page 存在
  ensures ref 不存在视为已解除，幂等

detach [page: Page; ref: Ref; actor: Author] => [error: NotFound]
detach [page: Page; ref: Ref; actor: Author] => [error: Invalid]

publish [page: Page; actor: Author] => [page: Page]
  requires page 存在
  ensures status=published；已是 published 幂等，不递增 revision。不存在则无绑定

unpublish [page: Page; actor: Author] => [page: Page]
  requires page 存在
  ensures status=draft；已是 draft 幂等。不存在则无绑定

trash [page: Page; actor: Author] => [page: Page; changed: Bool]
  requires page 存在
  ensures 仅当 trashedAt 未设时写入 now 且 changed=true；已回收不重置且 changed=false。不存在则无绑定

restore [page: Page; actor: Author] => [page: Page; changed: Bool]
  requires page 存在
  ensures 仅当 trashedAt 有值时清空且 changed=true；未回收幂等且 changed=false。不存在则无绑定

purge [page: Page; retention: Duration] => [purged: Bool]
  requires retention ≥ 0
  ensures 仅在已回收且 now − trashedAt 严格超过 retention 时清除并返回 true；未满足返回 false

terminate [page: Page] => []
  ensures 清除页面及附件引用；不存在时幂等。系统终结动作，不开放 Requesting

## operational principle
after create [actor: alice; format: markdown; title: "快速开始"] => [page: p]
after edit [page: p; content: c1; base: 0; author: alice] => [page: p]
after publish [page: p; actor: alice] => [page: p]
then _view [page: p] 的 status=published
内容走到可被下一份对外版本收录的进版状态

after 他人先保存，随后 edit [page: p; content: c2; base: 旧基线; author: bob] => [error: Conflict]
then 作者合并后以新基线重试
并发编辑不丢稿、不静默覆盖

after trash [page: p; actor: alice] => [page: p]
after restore [page: p; actor: alice] => [page: p]
then _view [page: p] 的 trashedAt 无绑定且 revision 与 trash 前相同
删除可反悔，不形成新修订

## queries
_view [page: Page] => [title: String; format: Format; content: Content; revision: Int; status: Status; seo: Seo; icon: Image; properties: Field -> Value; attachments: seq File; trashedAt: Time]
  returns 门面一次返回；无匹配为零行

_views [pages: set Page] => [views: seq View]
  returns 批量投影

_page [cursor: String; limit: Int; status?: Status; format?: Format] => [views: seq View; nextCursor: String]
  returns 工作集：trashedAt 为空；tenant scope 内按 (updatedAt, id) desc keyset

_pageAll [cursor: String; limit: Int] => [views: seq View; nextCursor: String]
  returns 当前租户所有现存页面，包含回收页；limit 1..100

_trashed [cursor: String; limit: Int] => [views: seq View; nextCursor: String]
  returns 已回收：trashedAt 非空；按 (trashedAt, id) desc

_scanAttachments [cursor: String; limit: Int; q: String; type: String] => [items: seq AttachmentEntry; scanned: Int; nextCursor: String]
  returns 未回收页面附件候选；limit 1..100。先取最多 limit 个再按文件名字面包含和 all/image/pdf 匹配。空 items 仍可续扫

_attachment [page: Page; ref: Ref] => [file: File]
  returns 零或一绑定

_referencesObject [storageKey: String] => [used: Bool]
  returns 当前租户内任何页面附件仍使用该对象

_expired [before: Time; after: Page; limit: Int] => [pages: seq Page]
  returns 已回收且 trashedAt < before 的候选，按 id 稳定扫描

_lock [page: Page] => [view: View]
  returns 与编辑/还原共同锁定状态；不存在为零行

_usage [pages: set Page] => [workingPages: Nat; trashedPages: Nat; publishedPages: Nat; workingTextBytes: Nat; trashedTextBytes: Nat; attachmentCount: Nat; attachmentBytes: Nat]
  returns 当前租户指定身份的只读逻辑用量

## notes
内容快照包含 content、revision、format 和 contentProfile，来自同一份 View；批量 `_views` 不授予权限，跨页原子选择发布由组合层的同 Space 事务实现。
进版标记不等于读者可见。author 是行为的一部分，不是审计装饰。
`_content` / `_revision` / `_status` / `_seo` / `_properties` / `_isTrashed` 不是独立方法，从 `_view` 读取。
成功 create(..., initial) 发出 Created 与 Edited，修订记录仍由组合层完成。
Java 模块不得依赖其他概念。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `PageApi.attach` | `page: PageApi.PageId, file: PageApi.FileUpload, actor: PageApi.Actor` | `PageApi.AttachResult` |
| `PageApi.attachment` | `page: PageApi.PageId, ref: UUID` | `Optional<PageApi.Attachment>` |
| `PageApi.create` | `actor: PageApi.Actor, format: PageApi.Format, title: String, id: PageApi.PageId, initial: PageApi.InitialContent` | `PageApi.CreateContentResult` |
| `PageApi.create` | `actor: PageApi.Actor, format: PageApi.Format, title: String, id: PageApi.PageId` | `PageApi.CreateResult` |
| `PageApi.create` | `actor: PageApi.Actor, format: PageApi.Format, title: String, profile: ContentProfile` | `PageApi.CreateResult` |
| `PageApi.create` | `actor: PageApi.Actor, format: PageApi.Format, title: String` | `PageApi.CreateResult` |
| `PageApi.detach` | `page: PageApi.PageId, ref: UUID, actor: PageApi.Actor` | `PageApi.MetadataResult` |
| `PageApi.edit` | `page: PageApi.PageId, content: String, baseRevision: int, actor: PageApi.Actor, profile: ContentProfile` | `PageApi.EditResult` |
| `PageApi.edit` | `page: PageApi.PageId, content: String, baseRevision: int, actor: PageApi.Actor` | `PageApi.EditResult` |
| `PageApi.expired` | `before: Instant, after: UUID, limit: int` | `List<PageApi.PageId>` |
| `PageApi.lock` | `page: PageApi.PageId` | `Optional<PageApi.View>` |
| `PageApi.pageAll` | `cursor: String, limit: int` | `PageApi.Slice` |
| `PageApi.page` | `cursor: String, limit: int, status: Optional<PageApi.Status>, format: Optional<PageApi.Format>` | `PageApi.Slice` |
| `PageApi.publish` | `page: PageApi.PageId, actor: PageApi.Actor` | `Optional<PageApi.View>` |
| `PageApi.purge` | `page: PageApi.PageId, retention: Duration` | `boolean` |
| `PageApi.referencesObject` | `key: String` | `boolean` |
| `PageApi.removeProperty` | `page: PageApi.PageId, field: String, actor: PageApi.Actor` | `PageApi.MetadataResult` |
| `PageApi.rename` | `page: PageApi.PageId, title: String, actor: PageApi.Actor` | `PageApi.MutationResult` |
| `PageApi.replaceProperties` | `page: PageApi.PageId, values: Map<String, String>, actor: PageApi.Actor` | `PageApi.MetadataResult` |
| `PageApi.restore` | `page: PageApi.PageId, actor: PageApi.Actor` | `Optional<PageApi.LifecycleChange>` |
| `PageApi.scanAttachments` | `cursor: String, limit: int, q: String, type: String` | `PageApi.AttachmentScan` |
| `PageApi.setIcon` | `page: PageApi.PageId, icon: String, actor: PageApi.Actor` | `PageApi.MetadataResult` |
| `PageApi.setProperty` | `page: PageApi.PageId, field: String, value: String, actor: PageApi.Actor` | `PageApi.MetadataResult` |
| `PageApi.setSeo` | `page: PageApi.PageId, patch: PageApi.SeoPatch, actor: PageApi.Actor` | `PageApi.MetadataResult` |
| `PageApi.terminate` | `page: PageApi.PageId` | `void` |
| `PageApi.trash` | `page: PageApi.PageId, actor: PageApi.Actor` | `Optional<PageApi.LifecycleChange>` |
| `PageApi.trashed` | `cursor: String, limit: int` | `PageApi.Slice` |
| `PageApi.unpublish` | `page: PageApi.PageId, actor: PageApi.Actor` | `Optional<PageApi.View>` |
| `PageApi.usage` | `ids: Set<UUID>` | `PageApi.Usage` |
| `PageApi.view` | `page: PageApi.PageId` | `Optional<PageApi.View>` |
| `PageApi.views` | `pages: Set<PageApi.PageId>` | `List<PageApi.View>` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `PageApi.ActorType` | `USER / API_TOKEN / SYSTEM` |
| `PageApi.Actor` | `type: PageApi.ActorType, id: UUID` |
| `PageApi.AttachResult.Attached` | `page: PageApi.View, attachment: PageApi.Attachment` |
| `PageApi.AttachResult.FileTooLarge` | `[]` |
| `PageApi.AttachResult.FileTypeUnsupported` | `[]` |
| `PageApi.AttachResult.Invalid` | `field: String, code: String` |
| `PageApi.AttachResult.NotFound` | `[]` |
| `PageApi.AttachResult.TooManyAttachments` | `[]` |
| `PageApi.AttachResult` | `PageApi.AttachResult.Attached / PageApi.AttachResult.FileTooLarge / PageApi.AttachResult.FileTypeUnsupported / PageApi.AttachResult.Invalid / PageApi.AttachResult.NotFound / PageApi.AttachResult.TooManyAttachments` |
| `PageApi.AttachmentEntry` | `ref: UUID, pageId: UUID, pageTitle: String, filename: String, mime: String, sizeBytes: long, createdAt: Instant` |
| `PageApi.AttachmentScan` | `items: List<PageApi.AttachmentEntry>, scanned: int, nextCursor: String` |
| `PageApi.Attachment` | `ref: UUID, filename: String, mime: String, sizeBytes: long, storageKey: String, createdAt: Instant` |
| `PageApi.CreateContentResult.ContentTooLarge` | `[]` |
| `PageApi.CreateContentResult.Created` | `page: PageApi.View` |
| `PageApi.CreateContentResult.IdTaken` | `[]` |
| `PageApi.CreateContentResult.InvalidTitle` | `[]` |
| `PageApi.CreateContentResult.Invalid` | `field: String, code: String` |
| `PageApi.CreateContentResult` | `PageApi.CreateContentResult.ContentTooLarge / PageApi.CreateContentResult.Created / PageApi.CreateContentResult.IdTaken / PageApi.CreateContentResult.Invalid / PageApi.CreateContentResult.InvalidTitle` |
| `PageApi.CreateResult.Created` | `page: PageApi.View` |
| `PageApi.CreateResult.IdTaken` | `[]` |
| `PageApi.CreateResult.InvalidTitle` | `[]` |
| `PageApi.CreateResult` | `PageApi.CreateResult.Created / PageApi.CreateResult.IdTaken / PageApi.CreateResult.InvalidTitle` |
| `PageApi.EditResult.Conflict` | `theirs: PageApi.View` |
| `PageApi.EditResult.ContentTooLarge` | `[]` |
| `PageApi.EditResult.Edited` | `page: PageApi.View` |
| `PageApi.EditResult.NotFound` | `[]` |
| `PageApi.EditResult` | `PageApi.EditResult.Conflict / PageApi.EditResult.ContentTooLarge / PageApi.EditResult.Edited / PageApi.EditResult.NotFound` |
| `PageApi.FileUpload` | `filename: String, bytes: byte[]` |
| `PageApi.Format` | `MARKDOWN / HTML / TXT / JSON / XML` |
| `PageApi.InitialContent` | `content: String, seo: PageApi.Seo, properties: Map<String, String>, contentProfile: ContentProfile` |
| `PageApi.LifecycleChange` | `page: PageApi.View, changed: boolean` |
| `PageApi.MetadataResult.Changed` | `page: PageApi.View` |
| `PageApi.MetadataResult.Invalid` | `field: String, code: String` |
| `PageApi.MetadataResult.NotFound` | `[]` |
| `PageApi.MetadataResult` | `PageApi.MetadataResult.Changed / PageApi.MetadataResult.Invalid / PageApi.MetadataResult.NotFound` |
| `PageApi.MutationResult.Changed` | `page: PageApi.View` |
| `PageApi.MutationResult.InvalidTitle` | `[]` |
| `PageApi.MutationResult.NotFound` | `[]` |
| `PageApi.MutationResult` | `PageApi.MutationResult.Changed / PageApi.MutationResult.InvalidTitle / PageApi.MutationResult.NotFound` |
| `PageApi.PageId` | `value: UUID` |
| `PageApi.Patch.Clear` | `[]` |
| `PageApi.Patch.Set` | `value: T` |
| `PageApi.Patch.Unchanged` | `[]` |
| `PageApi.Patch` | `PageApi.Patch.Clear / PageApi.Patch.Set / PageApi.Patch.Unchanged` |
| `PageApi.SeoPatch` | `title: PageApi.Patch<String>, description: PageApi.Patch<String>, keywords: PageApi.Patch<String>, ogImage: PageApi.Patch<String>, noIndex: Optional<Boolean>` |
| `PageApi.Seo` | `title: String, description: String, keywords: String, ogImage: String, noIndex: boolean` |
| `PageApi.Slice` | `items: List<PageApi.View>, nextCursor: String` |
| `PageApi.Status` | `DRAFT / PUBLISHED` |
| `PageApi.Usage` | `workingPages: long, trashedPages: long, publishedPages: long, workingTextBytes: long, trashedTextBytes: long, attachmentCount: long, attachmentBytes: long` |
| `PageApi.View` | `id: UUID, title: String, format: PageApi.Format, content: String, revision: int, status: PageApi.Status, seo: PageApi.Seo, icon: String, properties: Map<String, String>, attachments: List<PageApi.Attachment>, trashedAt: Instant, createdAt: Instant, createdBy: PageApi.Actor, updatedAt: Instant, updatedBy: PageApi.Actor, contentProfile: ContentProfile` |

<!-- interface-contract:end -->

## 2026-10-18 内容解释配置

format 保留五种源码语法。contentType 与 interpretation(schema/catalogId/protocolVersion) 是正文解释配置，和正文在同一基线、同一事务保存并记录修订；省略配置保持已有值。取回修订同时取回正文及解释配置。工作稿允许无效的专用类型内容；发版校验是服务端权威，json-schema 与 a2ui 的无效内容不得晋升，包括整体导入、API 与热修。普通 json 继续保留任意源码。解释配置冻结进 Bundle、Release 与 SiteSnapshot，并参与渲染/检索指纹。专用类型的错误报告包含有限字段路径和稳定校验码，外部 schema 引用不发网络请求。

内容解释配置是有界通用JSON对象，随具体versionRef和正文原子存入同一修订；版本默认切换不重解释已有内容。旧平铺配置集中兼容读取。

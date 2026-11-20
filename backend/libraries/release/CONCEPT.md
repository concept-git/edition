# concept Release [Scope, Bundle]

## purpose
让一个范围的对外内容以可预览、可整体原子切换、可回滚的不可变版本演进

## state
content: Release -> Bundle
status: Release -> {draft, flagged, validated, live, archived}
live: Scope -> lone Release
keep: Scope -> Int
label: Release -> String
notes: Release -> lone Text
source: Release -> (kind: {import, build}, ref: String, actor: Actor)
report: Release -> lone Report

keep 默认 7，范围 1..50。label 在 draft 时取本范围现存发版数 + 1 的十进制串。content 不可变。任意时刻至多一个 live。

平台构建的新 Bundle 使用 `generator=space/1.0`；导入包与既有不可变快照保留原 generator。

Bundle 的页级 slug 是规范资源相对路径，页面文件路径与站点地址的空间内部分相同；保留扩展名和层级。contentPath 只定位交换包正文，不是第二套公开路径。附件 path 是空间内资源相对路径，与页面共用命名空间；相同路径只允许共享同一字节摘要的附件。validate 拒绝非法、重复页面路径、不同内容占同附件路径及文件/目录前缀冲突。路径、正文、附件和 Toc 随完整快照一起发布与回滚。

内容准入读取构建登记的 `contracts/content-plugins.json`，只接受已登记 contentType，并校验其底层格式；按描述的 admissionPolicy 选择已实现的 source/json/json-schema/a2ui 准入策略，未知类型或未知策略拒绝准入。基础格式保留原始文本语义；json-schema 按离线 JSON Schema 2020-12 元模式校验；带内联 schema 的 JSON 校验实例；a2ui 校验固定 v0.9.1 基础 catalog、消息结构、surface 初始化顺序与组件引用。用户 schema 只允许本地片段引用，不产生远程 I/O。错误草稿可保存，validate 返回阻断问题，不能 approve 放行。单次校验限制 2 MiB、64 层、20000 节点、512 A2UI 消息、16 surface 和每 surface 2000 组件。

## actions
draft [scope: Scope; source: Source] => [rel: Release]
  ensures status=draft，记录 source，label=现存数+1

load [rel: Release; bundle: Bundle] => [rel: Release]
  requires status=draft 且尚未装载且 bundle 合契约
  ensures 装载快照。每份 draft 至多一次

load [rel: Release; bundle: Bundle] => [error: InvalidBundle]
  requires 完整读取后确认不合契约
  ensures 返回 InvalidBundle(report)；保持 draft 且不保存部分输入。同一 bundle 重复 Page 身份属于 duplicate_page_id

load [rel: Release; bundle: Bundle] => [error: NotFound]
  requires rel 不存在
  ensures 返回 NotFound；状态不变

validate [rel: Release; coverageWarnings: set Overlay] => [rel: Release]
  requires status=draft 且已装载，无阻断、coverageWarnings 为空
  ensures status=validated

validate [rel: Release; coverageWarnings: set Overlay] => [warnings: Report]
  requires status=draft 且已装载，无阻断、coverageWarnings 非空
  ensures status=flagged

validate [rel: Release; coverageWarnings: set Overlay] => [errors: Report]
  requires 存在阻断级问题
  ensures 停留 draft；写入 report.errors

validate [rel: Release; coverageWarnings: set Overlay] => [error: NotFound]

approve [rel: Release] => [rel: Release]
  requires status=flagged
  ensures status=validated

approve [rel: Release] => [error: NotFound]

promote [rel: Release] => [rel: Release]
  requires status ∈ {validated, archived}
  ensures 原 live 转 archived、本版成为 live；同范围串行

promote [rel: Release] => [error: NotFound]

discard [rel: Release] => [rel: Release]
  requires status ∈ {draft, flagged, validated}
  ensures 发版及其快照行删除

discard [rel: Release] => [error: NotFound]

setRetention [scope: Scope; n: Int] => [rel: Release]
  requires n ∈ [1, 50]
  ensures keep=n；不立刻 prune。返回当前 live View，尚无 live 时 Changed.release 为空。n 越界是编程错误

setRetention [scope: Scope; n: Int] => [error: NotFound]

setLabel [rel: Release; label: String] => [rel: Release]
  requires rel 存在；strip 后 1..32 code points 且无控制字符
  ensures 更新 label

setLabel [rel: Release; label: String] => [error: NotFound]

annotate [rel: Release; notes: Text] => [rel: Release]
  requires rel 存在
  ensures 更新 notes；空白转为无 notes

annotate [rel: Release; notes: Text] => [error: NotFound]

prune [scope: Scope] => [pruned: set Release]
  ensures 超出最近 keep 个的归档仅在无有效 pin 时回收；live 永不清理

export [rel: Release] => [bundle: Bundle]
  returns 由快照表原样再生 Bundle；不存在或不可导出为零行

pin [rel: Release; reservation: Reservation; until: Time] => [pinned: Bool]
  requires until > now
  ensures live/archived 发版在 reservation 到期前不被 prune 回收。发版不存在或不在可导出状态时返回 false

terminateScope [scope: Scope] => []
  ensures 删除本 scope 全部发版、快照与保留设置。不存在时幂等。系统终结动作

## operational principle
after draft [scope: s; source: src] => [rel: r]
after load [rel: r; bundle: bundle] => [rel: r]
after validate [rel: r; coverageWarnings: {}] => [rel: r]
after promote [rel: r] => [rel: r]
then _live [scope: s] => [rel: r]
检查没问题再变主版本，由状态机保证读者看到完整一致的新版

after validate [rel: r2; coverageWarnings: {将覆盖热修页}] => [warnings: report]
then promote 被 status=flagged 挡住；approve [rel: r2] => [rel: r2] 后方可 promote
覆盖必经人为确认

after validate [rel: r3; coverageWarnings: {}] => [errors: report]
then r3 无法 promote，_live 不变
阻断级问题不可确认放行

after promote [rel: r1] 使原 live r0 归档
after promote [rel: r0] => [rel: r0]
then _live [scope: s] => [rel: r0]
保留窗口内任一归档版可再成为 live

## queries
inspectContent [format: String; content: String; profile: ContentProfile] => [issues: seq Issue]
  returns 离线可信内容解释校验，不读写发版状态；只在2020-12声明的schema位置检查引用，外部schema引用被拒绝，const/default/examples内的实例数据不作为schema解释。工作稿可用同一结果提供诊断，晋升仍由服务端发版门禁决定。

_live [scope: Scope] => [rel: Release]
  returns 零或一绑定

_pageOf [rel: Release; page: Page] => [snapshot: PageSnapshot]
  returns 零或一绑定

_pagesOf [rel: Release] => [headers: seq PageHeader]
  returns 有序 page 快照头

_tocOf [rel: Release] => [tree: seq TocNode]
  returns 快照内目录

_scopeOf [rel: Release] => [scope: Scope]
  returns 零或一绑定

_status [rel: Release] => [status: Status]
  returns 零或一绑定

_diff [left: Release; right: Release] => [delta: Delta]
  returns 增/改/删页面集（按 page 稳定 id；改为 content_hash 不同）

_list [scope: Scope] => [rels: seq View]
  returns 该范围全部发版

_page [scopes: set Scope; status?: Status; cursor: String; limit: Int] => [rels: seq View; nextCursor: String]
  returns 多范围键集分页（createdAt desc, id desc）

_lastOf [scope: Scope; kind: SourceKind] => [rel: Release]
  returns 该来源最近一份

_keep [scope: Scope] => [n: Int]
  returns 当前保留数

_referencesPage [pageId: Page] => [used: Bool]
  returns 当前租户任何保留快照仍引用该稳定标识

_referencesObject [key: String] => [used: Bool]
  returns 当前租户任何保留快照仍引用该对象

_objectKeys [scope: Scope] => [keys: set String]
  returns 系统终结前收集本 scope 的对象引用

_usage [scope: Scope] => [releases: Nat; snapshotPages: Nat; textBytes: Nat]
  returns 保留快照逻辑正文用量

## notes
实例化 Scope=空间、Bundle=页面+编排+附件的清单化快照。从工作区收集是组合层职责。
快照保留 Markdown/HTML/TXT/JSON/XML 正文原文与格式，内容路径使用对应扩展名。
漂移判定经 coverageWarnings 传入；内禀规则从不产生 flagged。空 Bundle 合法。
三参 validate 与两参同一动作，extraBlocking 由组合层并入同页 format 变更。
对象存储/数据库不可用是系统故障，不进 InvalidBundle。
Java 模块不得依赖其他概念。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `ReleaseApi.annotate` | `rel: ReleaseApi.ReleaseId, notes: String` | `ReleaseApi.MutationResult` |
| `ReleaseApi.approve` | `rel: ReleaseApi.ReleaseId` | `ReleaseApi.MutationResult` |
| `ReleaseApi.diff` | `left: ReleaseApi.ReleaseId, right: ReleaseApi.ReleaseId` | `Optional<ReleaseApi.Delta>` |
| `ReleaseApi.discard` | `rel: ReleaseApi.ReleaseId` | `ReleaseApi.MutationResult` |
| `ReleaseApi.draft` | `scope: ReleaseApi.ScopeId, source: ReleaseApi.Source` | `ReleaseApi.View` |
| `ReleaseApi.export` | `rel: ReleaseApi.ReleaseId` | `Optional<ReleaseApi.Bundle>` |
| `ReleaseApi.inspectContent` | `format: String, content: String, profile: ContentProfile, definition: ContentTypeDefinition` | `List<ReleaseApi.Issue>` |
| `ReleaseApi.inspectContent` | `format: String, content: String, profile: ContentProfile` | `List<ReleaseApi.Issue>` |
| `ReleaseApi.inspectDefinition` | `definition: ContentTypeDefinition` | `List<ReleaseApi.Issue>` |
| `ReleaseApi.keep` | `scope: ReleaseApi.ScopeId` | `int` |
| `ReleaseApi.lastOf` | `scope: ReleaseApi.ScopeId, kind: ReleaseApi.SourceKind` | `Optional<ReleaseApi.View>` |
| `ReleaseApi.list` | `scope: ReleaseApi.ScopeId` | `List<ReleaseApi.View>` |
| `ReleaseApi.live` | `scope: ReleaseApi.ScopeId` | `Optional<ReleaseApi.View>` |
| `ReleaseApi.load` | `rel: ReleaseApi.ReleaseId, bundle: ReleaseApi.Bundle` | `ReleaseApi.LoadResult` |
| `ReleaseApi.objectKeys` | `scope: ReleaseApi.ScopeId` | `Set<String>` |
| `ReleaseApi.pageOf` | `rel: ReleaseApi.ReleaseId, page: UUID` | `Optional<ReleaseApi.PageSnapshot>` |
| `ReleaseApi.page` | `scopes: Set<ReleaseApi.ScopeId>, status: Optional<ReleaseApi.Status>, cursor: String, limit: int` | `ReleaseApi.Page` |
| `ReleaseApi.pagesOf` | `rel: ReleaseApi.ReleaseId` | `List<ReleaseApi.PageHeader>` |
| `ReleaseApi.pin` | `rel: ReleaseApi.ReleaseId, reservation: UUID, until: Instant` | `boolean` |
| `ReleaseApi.promote` | `rel: ReleaseApi.ReleaseId` | `ReleaseApi.MutationResult` |
| `ReleaseApi.prune` | `scope: ReleaseApi.ScopeId` | `Set<ReleaseApi.ReleaseId>` |
| `ReleaseApi.referencesObject` | `key: String` | `boolean` |
| `ReleaseApi.referencesPage` | `pageId: UUID` | `boolean` |
| `ReleaseApi.scopeOf` | `rel: ReleaseApi.ReleaseId` | `Optional<ReleaseApi.ScopeId>` |
| `ReleaseApi.setLabel` | `rel: ReleaseApi.ReleaseId, label: String` | `ReleaseApi.MutationResult` |
| `ReleaseApi.setRetention` | `scope: ReleaseApi.ScopeId, keep: int` | `ReleaseApi.MutationResult` |
| `ReleaseApi.status` | `rel: ReleaseApi.ReleaseId` | `Optional<ReleaseApi.Status>` |
| `ReleaseApi.terminateScope` | `scope: ReleaseApi.ScopeId` | `void` |
| `ReleaseApi.tocOf` | `rel: ReleaseApi.ReleaseId` | `List<ReleaseApi.TocNode>` |
| `ReleaseApi.usage` | `scope: ReleaseApi.ScopeId` | `ReleaseApi.Usage` |
| `ReleaseApi.validate` | `rel: ReleaseApi.ReleaseId, coverageWarnings: List<ReleaseApi.CoverageWarning>, extraBlocking: List<ReleaseApi.Issue>` | `ReleaseApi.ValidateResult` |
| `ReleaseApi.validate` | `rel: ReleaseApi.ReleaseId, coverageWarnings: List<ReleaseApi.CoverageWarning>` | `ReleaseApi.ValidateResult` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `ReleaseApi.AttachmentRef` | `path: String, storageKey: String, sha256: String` |
| `ReleaseApi.Bundle` | `bundleVersion: String, generator: String, generatedAt: Instant, pages: List<ReleaseApi.PageSnapshot>, toc: List<ReleaseApi.TocNode>, checksums: Map<String, String>` |
| `ReleaseApi.CoverageWarning` | `pageId: UUID, externalId: String` |
| `ReleaseApi.Delta` | `added: Set<UUID>, changed: Set<UUID>, removed: Set<UUID>` |
| `ReleaseApi.Format` | `MARKDOWN / HTML / TXT / JSON / XML` |
| `ReleaseApi.Issue` | `code: String, path: String, pageId: UUID, detail: String` |
| `ReleaseApi.LoadResult.InvalidBundle` | `release: ReleaseApi.View, report: ReleaseApi.Report` |
| `ReleaseApi.LoadResult.Loaded` | `release: ReleaseApi.View` |
| `ReleaseApi.LoadResult.NotFound` | `[]` |
| `ReleaseApi.LoadResult` | `ReleaseApi.LoadResult.InvalidBundle / ReleaseApi.LoadResult.Loaded / ReleaseApi.LoadResult.NotFound` |
| `ReleaseApi.MutationResult.Changed` | `release: ReleaseApi.View` |
| `ReleaseApi.MutationResult.NotFound` | `[]` |
| `ReleaseApi.MutationResult` | `ReleaseApi.MutationResult.Changed / ReleaseApi.MutationResult.NotFound` |
| `ReleaseApi.PageHeader` | `pageId: UUID, slug: String, title: String, seo: ReleaseApi.Seo, seq: int` |
| `ReleaseApi.PageSnapshot` | `pageId: UUID, slug: String, title: String, format: ReleaseApi.Format, content: String, contentPath: String, seo: ReleaseApi.Seo, icon: String, properties: Map<String, String>, externalId: String, attachments: List<ReleaseApi.AttachmentRef>, seq: int, contentProfile: ContentProfile, contentTypeDefinition: ContentTypeSnapshot` |
| `ReleaseApi.Page` | `items: List<ReleaseApi.View>, nextCursor: String` |
| `ReleaseApi.ReleaseId` | `value: UUID` |
| `ReleaseApi.Report` | `errors: List<ReleaseApi.Issue>, warnings: List<ReleaseApi.Issue>, info: List<ReleaseApi.Issue>` |
| `ReleaseApi.ScopeId` | `value: UUID` |
| `ReleaseApi.Seo` | `title: String, description: String, keywords: String, ogImage: String, noIndex: boolean` |
| `ReleaseApi.SourceKind` | `IMPORT / BUILD` |
| `ReleaseApi.Source` | `kind: ReleaseApi.SourceKind, ref: String, actor: UUID` |
| `ReleaseApi.Status` | `DRAFT / FLAGGED / VALIDATED / LIVE / ARCHIVED` |
| `ReleaseApi.TocKind` | `TARGET / GROUP / LINK` |
| `ReleaseApi.TocNode` | `label: String, kind: ReleaseApi.TocKind, ref: String, url: String, children: List<ReleaseApi.TocNode>` |
| `ReleaseApi.Usage` | `releases: long, snapshotPages: long, textBytes: long` |
| `ReleaseApi.ValidateResult.Errors` | `release: ReleaseApi.View, report: ReleaseApi.Report` |
| `ReleaseApi.ValidateResult.NotFound` | `[]` |
| `ReleaseApi.ValidateResult.Ok` | `release: ReleaseApi.View` |
| `ReleaseApi.ValidateResult.Warnings` | `release: ReleaseApi.View, report: ReleaseApi.Report` |
| `ReleaseApi.ValidateResult` | `ReleaseApi.ValidateResult.Errors / ReleaseApi.ValidateResult.NotFound / ReleaseApi.ValidateResult.Ok / ReleaseApi.ValidateResult.Warnings` |
| `ReleaseApi.View` | `id: UUID, scopeId: UUID, status: ReleaseApi.Status, label: String, notes: String, source: ReleaseApi.Source, pageCount: int, report: ReleaseApi.Report, createdAt: Instant, promotedAt: Instant` |

<!-- interface-contract:end -->

HTML 导入保留原始 href/src；validate 按 externalId 原始路径解析相对链接，允许目标 HTML 的来源路径，唯一同名附件可解析到附件清单，不改写页面内容。

## 2026-10-18 内容解释配置

format 保留五种源码语法。contentType 与 interpretation(schema/catalogId/protocolVersion) 是正文解释配置，和正文在同一基线、同一事务保存并记录修订；省略配置保持已有值。取回修订同时取回正文及解释配置。工作稿允许无效的专用类型内容；发版校验是服务端权威，json-schema 与 a2ui 的无效内容不得晋升，包括整体导入、API 与热修。普通 json 继续保留任意源码。解释配置冻结进 Bundle、Release 与 SiteSnapshot，并参与渲染/检索指纹。专用类型的错误报告包含有限字段路径和稳定校验码，外部 schema 引用不发网络请求。

PageSnapshot同时冻结可空contentTypeDefinition（versionRef、摘要、完整定义与Schema资源闭包）；旧快照null保留兼容。准入只执行固定版本声明的Schema与通用限额，不执行类型专属后端语义。

inspectDefinition [definition: ContentTypeDefinition] => [issues: seq Issue]
  returns 通用Schema资源闭包与声明的结构问题，无I/O。

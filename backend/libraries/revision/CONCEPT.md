# concept Revision [Item, Content]

## purpose
让条目的每次内容保存可追溯，并能取回任一历史内容

## state
history: Item -> seq (content: Content, author: Author, time: Time, note: lone String)

每条快照的 n 从 1 开始且必须等于当前最大保留序号 +1。同 item 的 n 唯一。

## actions
record [item: Item; n: Int; content: Content; author: Author; note?: String] => [entry: Entry]
  requires n 等于当前最大保留序号 +1
  ensures 以调用方已提交的新基线号追加快照。跳号属于前置违反，不进 error case

prune [item: Item; keep: Int] => []
  requires keep ≥ 0
  ensures 仅保留最近 keep 条；keep=0 清空历史。清空后下一次 record 从 1 开始

## operational principle
after record [item: x; n: 1; content: c1; author: alice] => [entry: e1]
after record [item: x; n: 2; content: c2; author: bob] => [entry: e2]
then _list [item: x; cursor: ""; limit: n] 展示两次变更与作者，_content [item: x; n: 1] => [content: c1]
误改后能确知改了什么并取回

after _diff [item: x; from: 1; to: 2] => [delta: d]
then 审阅者看清两版差异
追溯不止于有历史，而是可比对

## queries
_content [item: Item; n: Int] => [entry: Entry; content: Content]
  returns 门面方法名 detail；无匹配为零行

_list [item: Item; cursor: String; limit: Int] => [entries: seq Entry; nextCursor: String]
  returns 门面方法名 page；n desc 键集分页，只返回摘要，不装载正文
  每条 sizeDelta = 当前内容 UTF-8 字节数减 n-1 的保留内容字节数；前条已清除时按零计算

_diff [item: Item; from: Int; to: Int] => [from: Int; to: Int; hunks: seq DiffHunk]
  returns 稳定行级差异；缺修订为零行

_count [item: Item] => [n: Nat]
  returns 保留条数

## notes
record 仅由组合层在编辑完成的同一事务中触发。取回修订 = 读取历史后再编辑，用稳定 note `restored-from:<n>` 标明来源。
Author 实例化为有类型稳定 actor；展示名是查询投影，绝不写入历史 state。
最新基线号由仓储内部读取，不开放 `_latest`。`prune(item, 0)` 由页面终结级联调用。
Java 模块不得依赖其他概念。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `RevisionApi.count` | `item: RevisionApi.ItemId` | `long` |
| `RevisionApi.detail` | `item: RevisionApi.ItemId, n: int` | `Optional<RevisionApi.Detail>` |
| `RevisionApi.diff` | `item: RevisionApi.ItemId, from: int, to: int` | `Optional<RevisionApi.Diff>` |
| `RevisionApi.page` | `item: RevisionApi.ItemId, cursor: String, limit: int` | `RevisionApi.Page` |
| `RevisionApi.prune` | `item: RevisionApi.ItemId, keep: int` | `void` |
| `RevisionApi.record` | `item: RevisionApi.ItemId, n: int, content: String, actor: RevisionApi.Actor, note: String, profile: ContentProfile` | `RevisionApi.Entry` |
| `RevisionApi.record` | `item: RevisionApi.ItemId, n: int, content: String, actor: RevisionApi.Actor, note: String` | `RevisionApi.Entry` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `RevisionApi.ActorType` | `USER / API_TOKEN / SYSTEM` |
| `RevisionApi.Actor` | `type: RevisionApi.ActorType, id: UUID` |
| `RevisionApi.Detail` | `entry: RevisionApi.Entry, content: String, contentProfile: ContentProfile` |
| `RevisionApi.DiffHunk` | `oldStart: int, oldLines: int, newStart: int, newLines: int, lines: List<RevisionApi.DiffLine>` |
| `RevisionApi.DiffLineType` | `CONTEXT / ADD / DELETE` |
| `RevisionApi.DiffLine` | `type: RevisionApi.DiffLineType, content: String` |
| `RevisionApi.Diff` | `from: int, to: int, hunks: List<RevisionApi.DiffHunk>` |
| `RevisionApi.Entry` | `n: int, actor: RevisionApi.Actor, createdAt: Instant, note: String, sizeBytes: long, sizeDelta: long` |
| `RevisionApi.ItemId` | `value: UUID` |
| `RevisionApi.Page` | `items: List<RevisionApi.Entry>, nextCursor: String` |

<!-- interface-contract:end -->

## 2026-10-18 内容解释配置

format 保留五种源码语法。contentType 与 interpretation(schema/catalogId/protocolVersion) 是正文解释配置，和正文在同一基线、同一事务保存并记录修订；省略配置保持已有值。取回修订同时取回正文及解释配置。工作稿允许无效的专用类型内容；发版校验是服务端权威，json-schema 与 a2ui 的无效内容不得晋升，包括整体导入、API 与热修。普通 json 继续保留任意源码。解释配置冻结进 Bundle、Release 与 SiteSnapshot，并参与渲染/检索指纹。专用类型的错误报告包含有限字段路径和稳定校验码，外部 schema 引用不发网络请求。

内容解释配置是有界通用JSON对象，随具体versionRef和正文原子存入同一修订；版本默认切换不重解释已有内容。旧平铺配置集中兼容读取。

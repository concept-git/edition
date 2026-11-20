# concept Toc [Target]

## purpose
让读者按人工编排的顺序与层次浏览一组内容

## state
root: Toc -> seq Entry
children: Entry -> seq Entry
label: Entry -> String
kind: Entry -> {target, group, link}
points: Entry -> lone Target
url: Entry -> lone URL

深度 ≤ 7，根层 depth=1。kind=target 时绑定 points；kind=link 时绑定 url。

## actions
addEntry [toc: Toc; parent?: Entry; label: String; kind: Kind; target?: Target; url?: URL; pos?: Int] => [entry: Entry]
  requires 深度、位置、父节点与 kind 绑定均合法
  ensures 插入条目；受影响兄弟重写为稠密 0..n-1。parent 缺省 = 根；pos 缺省追加

addEntry [toc: Toc; parent?: Entry; label: String; kind: Kind; target?: Target; url?: URL; pos?: Int] => [error: DepthExceeded]
addEntry [toc: Toc; parent?: Entry; label: String; kind: Kind; target?: Target; url?: URL; pos?: Int] => [error: PositionInvalid]
addEntry [toc: Toc; parent?: Entry; label: String; kind: Kind; target?: Target; url?: URL; pos?: Int] => [error: ParentNotFound]
addEntry [toc: Toc; parent?: Entry; label: String; kind: Kind; target?: Target; url?: URL; pos?: Int] => [error: Invalid]

move [entry: Entry; newParent?: Entry; pos: Int] => [tree: seq View]
  requires 条目存在且新位置不超深、不成环、下标合法
  ensures 移动后返回整树

move [entry: Entry; newParent?: Entry; pos: Int] => [error: DepthExceeded]
move [entry: Entry; newParent?: Entry; pos: Int] => [error: CycleDetected]
move [entry: Entry; newParent?: Entry; pos: Int] => [error: PositionInvalid]
move [entry: Entry; newParent?: Entry; pos: Int] => [error: NotFound]

relabel [entry: Entry; label: String] => [tree: seq View]
relabel [entry: Entry; label: String] => [error: NotFound]
relabel [entry: Entry; label: String] => [error: Invalid]

remove [entry: Entry] => [tree: seq View]
  ensures 级联摘子树；不删 target 页面或外链

remove [entry: Entry] => [error: NotFound]

replace [toc: Toc; tree: seq Draft] => [tree: seq View]
  ensures 同一事务清空再装入

replace [toc: Toc; tree: seq Draft] => [error: DepthExceeded]
  ensures 失败不留半棵树

replace [toc: Toc; tree: seq Draft] => [error: Invalid]

## operational principle
after addEntry [toc: t; label: "指南"; kind: group] => [entry: g]
after addEntry [toc: t; parent: g; label: "快速开始"; kind: target; target: x] => [entry: e]
then _tree [toc: t] 按编排的顺序与层次呈现
读者获得作者设计的阅读动线

after move [entry: e; pos: 1] => [tree: tree]
then 层次即时变化而目标本身不动
编排自由不牵连内容

after replace [toc: t; tree: 超7级] => [error: DepthExceeded]
then _tree [toc: t] 仍是替换前的那一棵
整树替换失败不留下半棵树

## queries
_tree [toc: Toc] => [entries: seq View]
  returns 嵌套森林；depth 派生，根为 1

_entriesFor [target: Target] => [entries: seq View]
  returns 指向该 target 的扁平条目；供导入摘除悬挂

_depth [entry: Entry] => [n: Nat]
  returns 零或一绑定

## notes
所有被拒绝的动作均保持原状态；移动的位置按移除自身后的目标兄弟序列校验。
同父移动只重写一次受影响兄弟序列；跨父移动分别重写两侧。
每空间一棵，身份 = 空间稳定 id，无独立 Toc 头表。纯展示、零寻址职责。
target/group/link 均可拥有子树，发布与阅读投影不得因条目种类丢弃合法后代。target 保存稳定身份，不复制资源路径；group 的标签及层级不创建文件目录。移导航、改标签、摘条目不改变目标内容或地址。同一目标可被多个条目引用，未编入 Toc 的资源仍可按其地址读取；跨概念存在性、发布和权限过滤由组合层完成。
pos 合法范围 0..count。挂到 depth=7 之下 → DepthExceeded。move 看「新深度 + 子树高度 - 1」。
所有树写入在读取当前树前按 Toc 身份串行化。replace 无 HTTP 入口。
Java 模块不得依赖其他概念。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `TocApi.addEntry` | `toc: TocApi.TocId, parent: TocApi.EntryId, label: String, kind: TocApi.Kind, targetId: UUID, url: String, pos: Integer` | `TocApi.AddResult` |
| `TocApi.depth` | `entry: TocApi.EntryId` | `Optional<Integer>` |
| `TocApi.entriesFor` | `target: UUID` | `List<TocApi.View>` |
| `TocApi.move` | `entry: TocApi.EntryId, newParent: TocApi.EntryId, pos: int` | `TocApi.MoveResult` |
| `TocApi.relabel` | `entry: TocApi.EntryId, label: String` | `TocApi.RelabelResult` |
| `TocApi.remove` | `entry: TocApi.EntryId` | `TocApi.RemoveResult` |
| `TocApi.replace` | `toc: TocApi.TocId, tree: List<TocApi.Draft>` | `TocApi.ReplaceResult` |
| `TocApi.tree` | `toc: TocApi.TocId` | `List<TocApi.View>` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `TocApi.AddResult.Added` | `entry: TocApi.View` |
| `TocApi.AddResult.DepthExceeded` | `[]` |
| `TocApi.AddResult.Invalid` | `field: String, code: String` |
| `TocApi.AddResult.ParentNotFound` | `[]` |
| `TocApi.AddResult.PositionInvalid` | `[]` |
| `TocApi.AddResult` | `TocApi.AddResult.Added / TocApi.AddResult.DepthExceeded / TocApi.AddResult.Invalid / TocApi.AddResult.ParentNotFound / TocApi.AddResult.PositionInvalid` |
| `TocApi.Draft` | `label: String, kind: TocApi.Kind, targetId: UUID, url: String, children: List<TocApi.Draft>` |
| `TocApi.EntryId` | `value: UUID` |
| `TocApi.Kind` | `TARGET / GROUP / LINK` |
| `TocApi.MoveResult.CycleDetected` | `[]` |
| `TocApi.MoveResult.DepthExceeded` | `[]` |
| `TocApi.MoveResult.Moved` | `tree: List<TocApi.View>` |
| `TocApi.MoveResult.NotFound` | `[]` |
| `TocApi.MoveResult.PositionInvalid` | `[]` |
| `TocApi.MoveResult` | `TocApi.MoveResult.CycleDetected / TocApi.MoveResult.DepthExceeded / TocApi.MoveResult.Moved / TocApi.MoveResult.NotFound / TocApi.MoveResult.PositionInvalid` |
| `TocApi.RelabelResult.Invalid` | `field: String, code: String` |
| `TocApi.RelabelResult.NotFound` | `[]` |
| `TocApi.RelabelResult.Relabeled` | `tree: List<TocApi.View>` |
| `TocApi.RelabelResult` | `TocApi.RelabelResult.Invalid / TocApi.RelabelResult.NotFound / TocApi.RelabelResult.Relabeled` |
| `TocApi.RemoveResult.NotFound` | `[]` |
| `TocApi.RemoveResult.Removed` | `tree: List<TocApi.View>` |
| `TocApi.RemoveResult` | `TocApi.RemoveResult.NotFound / TocApi.RemoveResult.Removed` |
| `TocApi.ReplaceResult.DepthExceeded` | `[]` |
| `TocApi.ReplaceResult.Invalid` | `field: String, code: String` |
| `TocApi.ReplaceResult.Replaced` | `tree: List<TocApi.View>` |
| `TocApi.ReplaceResult` | `TocApi.ReplaceResult.DepthExceeded / TocApi.ReplaceResult.Invalid / TocApi.ReplaceResult.Replaced` |
| `TocApi.TocId` | `spaceId: UUID` |
| `TocApi.View` | `id: UUID, spaceId: UUID, parentId: UUID, position: int, label: String, kind: TocApi.Kind, targetId: UUID, url: String, depth: int, children: List<TocApi.View>` |

<!-- interface-contract:end -->

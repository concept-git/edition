# concept Collection [Item]

## purpose
让条目按嵌套分组组织，位置即分类

## state
tenant: Collection -> one Tenant
parent: Collection -> lone Collection
name: Collection -> String
icon: Collection -> lone IconKey
contains: Collection -> seq Item
children: Collection -> seq Collection

深度 ≤ 3，根层 depth=1。contains/children 人工序稠密 0..n-1。一 Item 只在一个分组。icon 词表 book | code | api | guide | reference。

## actions
create [tenant: Tenant; parent?: Collection; name: String; icon?: IconKey; pos?: Int] => [col: Collection]
  requires 深度、位置、父节点与名称均合法
  ensures 创建分组。parent 缺省 = 租户根；pos 缺省追加

create [tenant: Tenant; parent?: Collection; name: String; icon?: IconKey; pos?: Int] => [error: DepthExceeded]
create [tenant: Tenant; parent?: Collection; name: String; icon?: IconKey; pos?: Int] => [error: PositionInvalid]
create [tenant: Tenant; parent?: Collection; name: String; icon?: IconKey; pos?: Int] => [error: NameTaken]
create [tenant: Tenant; parent?: Collection; name: String; icon?: IconKey; pos?: Int] => [error: ParentNotFound]
create [tenant: Tenant; parent?: Collection; name: String; icon?: IconKey; pos?: Int] => [error: Invalid]

rename [col: Collection; name: String] => [tree: seq View]
rename [col: Collection; name: String] => [error: NameTaken]
rename [col: Collection; name: String] => [error: NotFound]
rename [col: Collection; name: String] => [error: Invalid]

setIcon [col: Collection; icon?: IconKey] => [tree: seq View]
setIcon [col: Collection; icon?: IconKey] => [error: NotFound]
setIcon [col: Collection; icon?: IconKey] => [error: Invalid]

move [col: Collection; newParent?: Collection; pos: Int] => [tree: seq View]
move [col: Collection; newParent?: Collection; pos: Int] => [error: DepthExceeded]
move [col: Collection; newParent?: Collection; pos: Int] => [error: CycleDetected]
move [col: Collection; newParent?: Collection; pos: Int] => [error: PositionInvalid]
move [col: Collection; newParent?: Collection; pos: Int] => [error: NameTaken]
move [col: Collection; newParent?: Collection; pos: Int] => [error: NotFound]

place [item: Item; col: Collection; pos?: Int] => [items: seq Item]
  ensures item 只在一个分组；已在本组则只改序

place [item: Item; col: Collection; pos?: Int] => [error: PositionInvalid]
place [item: Item; col: Collection; pos?: Int] => [error: NotFound]

unplace [item: Item] => []
  ensures 不在任何分组则空操作

remove [col: Collection] => [tree: seq View]
  requires 无子分组且无条目
  ensures 删除该组

remove [col: Collection] => [error: NotEmpty]
remove [col: Collection] => [error: NotFound]

## operational principle
after create [tenant: t; name: "产品文档"] => [col: c]
after place [item: s; col: c] => [items: items]
then _itemsIn [col: c] 含 s，_pathOf [item: s] => [chain: ["产品文档"]]，_collectionOf [item: s] => [col: c]
位置本身表达归类

after move [col: c; newParent: 会超深的新父; pos: 0] => [error: DepthExceeded]
then 树形不变量始终由本概念自持
组织结构不会悄悄劣化

after place [item: s; col: c] => [items: items]
after remove [col: c] => [error: NotEmpty]
then _itemsIn [col: c] 仍含 s
非空组不能删；条目生命周期不随分组走

## queries
_tree [tenant: Tenant] => [cols: seq View]
  returns 嵌套森林，不含空间叶子

_itemsIn [col: Collection] => [items: seq Item]
  returns 该组直接成员，人工序

_pathOf [item: Item] => [chain: seq String]
  returns 从根到所在组的名称链；未分组为零行

_collectionOf [item: Item] => [col: Collection]
  returns 零或一绑定

_tenantOf [col: Collection] => [tenant: Tenant]
  returns 零或一绑定

_placed [tenant: Tenant] => [items: set Item]
  returns 该租户已分组的全部 Item

## notes
所有被拒绝的动作均保持原状态；移动的位置按移除自身后的目标兄弟序列校验。
同父移动只重写一次受影响兄弟序列；跨父移动分别重写两侧。
实例化 Item=空间。仅组织用途：不承载权限、地址或生命周期。
根层 depth=1，最深 3。name strip 后 1..200 code point；同一父节点下名称唯一、大小写敏感。
本概念不核对该 Item 是否存在。Java 模块不得依赖其他概念。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `CollectionApi.collectionOf` | `item: UUID` | `Optional<UUID>` |
| `CollectionApi.create` | `tenant: UUID, parent: CollectionApi.CollectionId, name: String, icon: CollectionApi.IconKey, pos: Integer` | `CollectionApi.CreateResult` |
| `CollectionApi.itemsIn` | `col: CollectionApi.CollectionId` | `List<UUID>` |
| `CollectionApi.move` | `col: CollectionApi.CollectionId, newParent: CollectionApi.CollectionId, pos: int` | `CollectionApi.MoveResult` |
| `CollectionApi.pathOf` | `item: UUID` | `List<String>` |
| `CollectionApi.place` | `item: UUID, col: CollectionApi.CollectionId, pos: Integer` | `CollectionApi.PlaceResult` |
| `CollectionApi.placed` | `tenant: UUID` | `Set<UUID>` |
| `CollectionApi.remove` | `col: CollectionApi.CollectionId` | `CollectionApi.RemoveResult` |
| `CollectionApi.rename` | `col: CollectionApi.CollectionId, name: String` | `CollectionApi.RenameResult` |
| `CollectionApi.setIcon` | `col: CollectionApi.CollectionId, icon: CollectionApi.IconKey` | `CollectionApi.SetIconResult` |
| `CollectionApi.tenantOf` | `col: CollectionApi.CollectionId` | `Optional<UUID>` |
| `CollectionApi.tree` | `tenant: UUID` | `List<CollectionApi.View>` |
| `CollectionApi.unplace` | `item: UUID` | `CollectionApi.UnplaceResult` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `CollectionApi.CollectionId` | `value: UUID` |
| `CollectionApi.CreateResult.Created` | `collection: CollectionApi.View` |
| `CollectionApi.CreateResult.DepthExceeded` | `[]` |
| `CollectionApi.CreateResult.Invalid` | `field: String, code: String` |
| `CollectionApi.CreateResult.NameTaken` | `[]` |
| `CollectionApi.CreateResult.ParentNotFound` | `[]` |
| `CollectionApi.CreateResult.PositionInvalid` | `[]` |
| `CollectionApi.CreateResult` | `CollectionApi.CreateResult.Created / CollectionApi.CreateResult.DepthExceeded / CollectionApi.CreateResult.Invalid / CollectionApi.CreateResult.NameTaken / CollectionApi.CreateResult.ParentNotFound / CollectionApi.CreateResult.PositionInvalid` |
| `CollectionApi.IconKey` | `BOOK / CODE / API / GUIDE / REFERENCE` |
| `CollectionApi.MoveResult.CycleDetected` | `[]` |
| `CollectionApi.MoveResult.DepthExceeded` | `[]` |
| `CollectionApi.MoveResult.Moved` | `tree: List<CollectionApi.View>` |
| `CollectionApi.MoveResult.NameTaken` | `[]` |
| `CollectionApi.MoveResult.NotFound` | `[]` |
| `CollectionApi.MoveResult.PositionInvalid` | `[]` |
| `CollectionApi.MoveResult` | `CollectionApi.MoveResult.CycleDetected / CollectionApi.MoveResult.DepthExceeded / CollectionApi.MoveResult.Moved / CollectionApi.MoveResult.NameTaken / CollectionApi.MoveResult.NotFound / CollectionApi.MoveResult.PositionInvalid` |
| `CollectionApi.PlaceResult.NotFound` | `[]` |
| `CollectionApi.PlaceResult.Placed` | `items: List<UUID>` |
| `CollectionApi.PlaceResult.PositionInvalid` | `[]` |
| `CollectionApi.PlaceResult` | `CollectionApi.PlaceResult.NotFound / CollectionApi.PlaceResult.Placed / CollectionApi.PlaceResult.PositionInvalid` |
| `CollectionApi.RemoveResult.NotEmpty` | `[]` |
| `CollectionApi.RemoveResult.NotFound` | `[]` |
| `CollectionApi.RemoveResult.Removed` | `tree: List<CollectionApi.View>` |
| `CollectionApi.RemoveResult` | `CollectionApi.RemoveResult.NotEmpty / CollectionApi.RemoveResult.NotFound / CollectionApi.RemoveResult.Removed` |
| `CollectionApi.RenameResult.Invalid` | `field: String, code: String` |
| `CollectionApi.RenameResult.NameTaken` | `[]` |
| `CollectionApi.RenameResult.NotFound` | `[]` |
| `CollectionApi.RenameResult.Renamed` | `tree: List<CollectionApi.View>` |
| `CollectionApi.RenameResult` | `CollectionApi.RenameResult.Invalid / CollectionApi.RenameResult.NameTaken / CollectionApi.RenameResult.NotFound / CollectionApi.RenameResult.Renamed` |
| `CollectionApi.SetIconResult.Changed` | `tree: List<CollectionApi.View>` |
| `CollectionApi.SetIconResult.Invalid` | `field: String, code: String` |
| `CollectionApi.SetIconResult.NotFound` | `[]` |
| `CollectionApi.SetIconResult` | `CollectionApi.SetIconResult.Changed / CollectionApi.SetIconResult.Invalid / CollectionApi.SetIconResult.NotFound` |
| `CollectionApi.UnplaceResult.Unplaced` | `[]` |
| `CollectionApi.UnplaceResult` | `CollectionApi.UnplaceResult.Unplaced` |
| `CollectionApi.View` | `id: UUID, tenantId: UUID, parentId: UUID, position: int, name: String, icon: CollectionApi.IconKey, depth: int, children: List<CollectionApi.View>` |

<!-- interface-contract:end -->

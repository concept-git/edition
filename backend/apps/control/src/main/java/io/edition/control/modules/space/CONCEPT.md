# concept Space [Item]

## purpose
让一组条目共享同一个家：同属、同迁、同灭

## state
tenant: Space -> one Tenant
name: Space -> String
icon: Space -> lone SpaceIconKey
description: Space -> lone String
mode: Space -> {authored, synced}
status: Space -> {active, archived}
autoRelease: Space -> Bool
member: Item -> lone Space
slugs: Space -> RelativePath -> lone Item

Space 由本概念创建。初态集合为空。Tenant 是身份类型，不是概念依赖。
每 Space 恰有一个 tenant/name/mode/status/autoRelease。icon 词表为 book | code | api | guide | reference。
authored 默认 autoRelease=true；synced 投影为不适用。member/slugs 由本概念私有 placement 表拥有：一 item 只属一个 Space，资源相对路径在空间内唯一。既有接口字段 slug 承载这一规范路径，不另存独立网页地址名。
RelativePath：保留文件名、大小写、扩展名与层级，不做小写化或 kebab 改写；非空 UTF-8 相对路径，最多2048字符，每段最多255字节。拒绝空段、`.`、`..`、反斜杠、控制字符；路径重复及文件/目录前缀冲突属于 SlugTaken。站点挂载的单段 Slug 不受本规则影响。
实现直接使用共享ResourcePath校验与冲突判定，不另建空间Slug包装；既有slug字段和SlugInvalid/SlugTaken结果名保持兼容。

## actions
create [actor: ActorId; tenant: Tenant; name: String; mode: Mode] => [space: Space]
  ensures 创建 active 空间。名称不合法是编程错误，不进本动作 error case

rename [actor: ActorId; space: Space; name: String] => [space: Space]
  requires space 存在且 status=active
  ensures 更新 name

rename [actor: ActorId; space: Space; name: String] => [error: NotFound]
  requires space 不存在
  ensures 返回 NotFound；状态不变

rename [actor: ActorId; space: Space; name: String] => [error: Archived]
  requires status=archived
  ensures 返回 Archived；状态不变

describe [actor: ActorId; space: Space; icon: Patch; description: Patch] => [space: Space]
  requires space 存在且 status=active
  ensures 按 patch 更新 icon/description

describe [actor: ActorId; space: Space; icon: Patch; description: Patch] => [error: NotFound]
  requires space 不存在
  ensures 返回 NotFound；状态不变

describe [actor: ActorId; space: Space; icon: Patch; description: Patch] => [error: Archived]
  requires status=archived
  ensures 返回 Archived；状态不变

convert [actor: ActorId; space: Space; toMode: Mode] => [space: Space]
  requires space 存在且 status=active
  ensures mode=toMode；synced→authored 时 autoRelease=true；同模式幂等

convert [actor: ActorId; space: Space; toMode: Mode] => [error: NotFound]
  requires space 不存在
  ensures 返回 NotFound；状态不变

convert [actor: ActorId; space: Space; toMode: Mode] => [error: Archived]
  requires status=archived
  ensures 返回 Archived；状态不变

setAutoRelease [actor: ActorId; space: Space; on: Bool] => [space: Space]
  requires space 存在且 status=active
  ensures autoRelease=on；同值幂等。synced 空间的 HTTP 写由组合层拒绝

setAutoRelease [actor: ActorId; space: Space; on: Bool] => [error: NotFound]
  requires space 不存在
  ensures 返回 NotFound；状态不变

setAutoRelease [actor: ActorId; space: Space; on: Bool] => [error: Archived]
  requires status=archived
  ensures 返回 Archived；状态不变

archive [actor: ActorId; space: Space] => [space: Space]
  requires space 存在
  ensures status=archived；已是 archived 幂等

archive [actor: ActorId; space: Space] => [error: NotFound]
  requires space 不存在
  ensures 返回 NotFound；状态不变

restore [actor: ActorId; space: Space] => [space: Space]
  requires space 存在
  ensures status=active；已是 active 幂等

restore [actor: ActorId; space: Space] => [error: NotFound]
  requires space 不存在
  ensures 返回 NotFound；状态不变

place [space: Space; item: Item; slug: RelativePath] => [placement: Placement]
  requires space 存在且 active，slug 合法且未被占用，item 尚未归属
  ensures item 唯一归属本空间并获得地址名

place [space: Space; item: Item; slug: RelativePath] => [error: SpaceNotFound]
place [space: Space; item: Item; slug: RelativePath] => [error: SpaceArchived]
place [space: Space; item: Item; slug: RelativePath] => [error: SlugInvalid]
place [space: Space; item: Item; slug: RelativePath] => [error: SlugTaken]
place [space: Space; item: Item; slug: RelativePath] => [error: ItemAlreadyPlaced]
  ensures 对应拒绝；状态不变。ItemAlreadyPlaced 带回现有 placement

reslug [space: Space; item: Item; slug: RelativePath] => [placement: Placement]
  requires item 已在该空间，slug 合法且未被占用（同 slug 幂等）
  ensures 仅新 slug 可寻址；旧 slug 即刻释放

reslug [space: Space; item: Item; slug: RelativePath] => [error: SpaceNotFound]
reslug [space: Space; item: Item; slug: RelativePath] => [error: SpaceArchived]
reslug [space: Space; item: Item; slug: RelativePath] => [error: SlugInvalid]
reslug [space: Space; item: Item; slug: RelativePath] => [error: SlugTaken]
reslug [space: Space; item: Item; slug: RelativePath] => [error: ItemNotInSpace]
  ensures 对应拒绝；状态不变

transfer [item: Item; toSpace: Space; slug: RelativePath] => [from: Placement; to: Placement]
  requires item 已归属某空间且 toSpace ≠ 当前空间；toSpace 为 active；slug 合法且未被占用
  ensures 原子换绑归属与地址名，原空间 slug 即刻释放

transfer [item: Item; toSpace: Space; slug: RelativePath] => [error: SpaceNotFound]
transfer [item: Item; toSpace: Space; slug: RelativePath] => [error: SpaceArchived]
transfer [item: Item; toSpace: Space; slug: RelativePath] => [error: SlugInvalid]
transfer [item: Item; toSpace: Space; slug: RelativePath] => [error: SlugTaken]
transfer [item: Item; toSpace: Space; slug: RelativePath] => [error: ItemNotPlaced]
transfer [item: Item; toSpace: Space; slug: RelativePath] => [error: SameSpace]
  ensures 对应拒绝；状态不变

delete [space: Space] => [deleted: Bool]
  ensures 仅当 status=archived 时删除并返回 true；否则返回 false 且不改状态。级联清理由组合层执行

unplace [item: Item] => []
  ensures 条目归属与 slug 解除；未归属时幂等。系统终结用，不开放 Requesting

## operational principle
after create [actor: a; tenant: t; name: "API 文档"; mode: synced] => [space: s]
after place [space: s; item: x; slug: "quickstart"] => [placement: p]
then _itemAt [space: s; slug: "quickstart"] => [item: x]，_spaceOf [item: x] => [space: s]
条目以空间为家

after place [space: s; item: x; slug: "a"] => [placement: p1]
after reslug [space: s; item: x; slug: "b"] => [placement: p2]
then _itemAt [space: s; slug: "b"] => [item: x]，_itemAt [space: s; slug: "a"] 为零行且 _spaceOf [item: x] 仍为 s
改址不换家

after archive [actor: a; space: s] => [space: s]
after place [space: s; item: y; slug: "new"] => [error: SpaceArchived]
after restore [actor: a; space: s] => [space: s]
then _status [space: s] => [status: active] 且 place 可再成功
整体进入只读、整体恢复；条目命运跟空间走

after convert [actor: a; space: s; toMode: authored] => [space: s]
then _mode [space: s] => [mode: authored] 且 _spaceOf [item: x] 不变
改喂入方式不拆开这个整体

## queries
_view [space: Space] => [name: String; icon: IconKey; description: String; mode: Mode; status: Status; autoRelease: Bool; createdAt: Time; updatedAt: Time]
  returns 零或一绑定

_listByTenant [tenant: Tenant] => [spaces: seq View]
  returns 该租户全部空间

_pageByTenant [tenant: Tenant; cursor: String; limit: Int; status?: Status; mode?: Mode] => [spaces: seq View; nextCursor: String]
  returns 过滤后的键集页

_tenantOf [space: Space] => [tenant: Tenant]
  returns 零或一绑定

_status [space: Space] => [status: Status]
  returns 零或一绑定

_mode [space: Space] => [mode: Mode]
  returns 零或一绑定

_spaceOf [item: Item] => [space: Space]
  returns 零或一绑定；transfer 后即为目标空间

_itemAt [space: Space; slug: RelativePath] => [item: Item]
  returns 零或一绑定

_itemsOf [space: Space] => [placements: seq Placement]
  returns 该空间全部挂载

_placementsOf [items: set Item] => [placements: seq Placement]
  returns 组合层分页投影的批量归属查询

_lock [space: Space] => [view: View]
  returns 锁定后的当前状态；不存在为零行

## notes
唯一约束拒绝只撤销本次动作，调用方共享事务中的先前事实保留且仍可继续读写；流程是否整体回滚由组合层决定。
Item 实例化为页面。本概念只守护归属与地址名；创作、授权判定、发版切换不是本概念的动作。
authored→synced 的前置（已有 live 快照）由组合层 where 判定。
条目在空间内扁平存放；阅读层次归 Toc，空间分组归 Collection。
delete 只终结已归档空间根；组合层负责原子级联与后台对象回收。
ActorId 只给约定层审计，不进业务 state。名称/图标非法在 sync 映射为 validation，不进本概念 sealed 结果。
Java 模块不得依赖其他概念；Tenant/Item/ActorId 是不透明实例化值。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `SpaceApi.archive` | `actor: SpaceApi.ActorId, space: SpaceApi.SpaceId` | `SpaceApi.LookupResult` |
| `SpaceApi.convert` | `actor: SpaceApi.ActorId, space: SpaceApi.SpaceId, toMode: SpaceApi.Mode` | `SpaceApi.MutationResult` |
| `SpaceApi.create` | `actor: SpaceApi.ActorId, tenantId: UUID, name: String, mode: SpaceApi.Mode` | `SpaceApi.View` |
| `SpaceApi.delete` | `space: SpaceApi.SpaceId` | `boolean` |
| `SpaceApi.describe` | `actor: SpaceApi.ActorId, space: SpaceApi.SpaceId, icon: SpaceApi.Patch<SpaceApi.IconKey>, description: SpaceApi.Patch<String>` | `SpaceApi.MutationResult` |
| `SpaceApi.itemAt` | `space: SpaceApi.SpaceId, slug: String` | `Optional<UUID>` |
| `SpaceApi.itemsOf` | `space: SpaceApi.SpaceId` | `List<SpaceApi.Placement>` |
| `SpaceApi.listByTenant` | `tenantId: UUID` | `List<SpaceApi.View>` |
| `SpaceApi.lock` | `space: SpaceApi.SpaceId` | `Optional<SpaceApi.View>` |
| `SpaceApi.mode` | `space: SpaceApi.SpaceId` | `Optional<SpaceApi.Mode>` |
| `SpaceApi.pageByTenant` | `tenantId: UUID, cursor: String, limit: int, status: Optional<SpaceApi.Status>, mode: Optional<SpaceApi.Mode>` | `SpaceApi.Page` |
| `SpaceApi.place` | `space: SpaceApi.SpaceId, item: UUID, slug: String` | `SpaceApi.PlacementResult` |
| `SpaceApi.placementsOf` | `items: Set<UUID>` | `List<SpaceApi.Placement>` |
| `SpaceApi.rename` | `actor: SpaceApi.ActorId, space: SpaceApi.SpaceId, name: String` | `SpaceApi.MutationResult` |
| `SpaceApi.reslug` | `space: SpaceApi.SpaceId, item: UUID, newSlug: String` | `SpaceApi.PlacementResult` |
| `SpaceApi.restore` | `actor: SpaceApi.ActorId, space: SpaceApi.SpaceId` | `SpaceApi.LookupResult` |
| `SpaceApi.setAutoRelease` | `actor: SpaceApi.ActorId, space: SpaceApi.SpaceId, on: boolean` | `SpaceApi.MutationResult` |
| `SpaceApi.spaceOf` | `item: UUID` | `Optional<SpaceApi.SpaceId>` |
| `SpaceApi.status` | `space: SpaceApi.SpaceId` | `Optional<SpaceApi.Status>` |
| `SpaceApi.tenantOf` | `space: SpaceApi.SpaceId` | `Optional<UUID>` |
| `SpaceApi.transfer` | `item: UUID, toSpace: SpaceApi.SpaceId, slug: String` | `SpaceApi.TransferResult` |
| `SpaceApi.unplace` | `item: UUID` | `void` |
| `SpaceApi.view` | `space: SpaceApi.SpaceId` | `Optional<SpaceApi.View>` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `SpaceApi.ActorId` | `value: UUID` |
| `SpaceApi.IconKey` | `BOOK / CODE / API / GUIDE / REFERENCE` |
| `SpaceApi.LookupResult.Found` | `space: SpaceApi.View` |
| `SpaceApi.LookupResult.NotFound` | `[]` |
| `SpaceApi.LookupResult` | `SpaceApi.LookupResult.Found / SpaceApi.LookupResult.NotFound` |
| `SpaceApi.Mode` | `AUTHORED / SYNCED` |
| `SpaceApi.MutationResult.Archived` | `[]` |
| `SpaceApi.MutationResult.Changed` | `space: SpaceApi.View` |
| `SpaceApi.MutationResult.NotFound` | `[]` |
| `SpaceApi.MutationResult` | `SpaceApi.MutationResult.Archived / SpaceApi.MutationResult.Changed / SpaceApi.MutationResult.NotFound` |
| `SpaceApi.Page` | `items: List<SpaceApi.View>, nextCursor: String` |
| `SpaceApi.Patch.Clear` | `[]` |
| `SpaceApi.Patch.Set` | `value: T` |
| `SpaceApi.Patch.Unchanged` | `[]` |
| `SpaceApi.Patch` | `SpaceApi.Patch.Clear / SpaceApi.Patch.Set / SpaceApi.Patch.Unchanged` |
| `SpaceApi.PlacementResult.ItemAlreadyPlaced` | `placement: SpaceApi.Placement` |
| `SpaceApi.PlacementResult.ItemNotInSpace` | `[]` |
| `SpaceApi.PlacementResult.Placed` | `placement: SpaceApi.Placement` |
| `SpaceApi.PlacementResult.SlugInvalid` | `[]` |
| `SpaceApi.PlacementResult.SlugTaken` | `[]` |
| `SpaceApi.PlacementResult.SpaceArchived` | `[]` |
| `SpaceApi.PlacementResult.SpaceNotFound` | `[]` |
| `SpaceApi.PlacementResult` | `SpaceApi.PlacementResult.ItemAlreadyPlaced / SpaceApi.PlacementResult.ItemNotInSpace / SpaceApi.PlacementResult.Placed / SpaceApi.PlacementResult.SlugInvalid / SpaceApi.PlacementResult.SlugTaken / SpaceApi.PlacementResult.SpaceArchived / SpaceApi.PlacementResult.SpaceNotFound` |
| `SpaceApi.Placement` | `space: SpaceApi.SpaceId, item: UUID, slug: String` |
| `SpaceApi.SpaceId` | `value: UUID` |
| `SpaceApi.Status` | `ACTIVE / ARCHIVED` |
| `SpaceApi.TransferResult.ItemNotPlaced` | `[]` |
| `SpaceApi.TransferResult.SameSpace` | `[]` |
| `SpaceApi.TransferResult.SlugInvalid` | `[]` |
| `SpaceApi.TransferResult.SlugTaken` | `[]` |
| `SpaceApi.TransferResult.SpaceArchived` | `[]` |
| `SpaceApi.TransferResult.SpaceNotFound` | `[]` |
| `SpaceApi.TransferResult.Transferred` | `from: SpaceApi.Placement, to: SpaceApi.Placement` |
| `SpaceApi.TransferResult` | `SpaceApi.TransferResult.ItemNotPlaced / SpaceApi.TransferResult.SameSpace / SpaceApi.TransferResult.SlugInvalid / SpaceApi.TransferResult.SlugTaken / SpaceApi.TransferResult.SpaceArchived / SpaceApi.TransferResult.SpaceNotFound / SpaceApi.TransferResult.Transferred` |
| `SpaceApi.View` | `id: UUID, tenantId: UUID, name: String, icon: SpaceApi.IconKey, description: String, mode: SpaceApi.Mode, status: SpaceApi.Status, autoRelease: boolean, createdAt: Instant, createdBy: UUID, updatedAt: Instant, updatedBy: UUID` |

<!-- interface-contract:end -->

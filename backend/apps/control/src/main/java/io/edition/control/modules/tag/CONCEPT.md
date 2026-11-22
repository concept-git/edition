# concept Tag [Item]

## purpose
让条目跨越所在位置被自由词汇横向聚合

## state
labels: Item -> set Label

单页最多 50 个不同 label。Label 在 domain 归一化：NFKC、strip、内部空白压成单个 U+0020、Locale.ROOT 小写；1..64 个 code point；禁止 C0/C1/DEL 与 `/` `\`。

## actions
tag [item: Item; label: Label] => []
  requires label 合法且该 item 尚未达到上限
  ensures 加入该词；已有则幂等

tag [item: Item; label: Label] => [error: TooMany]
  requires 已达 50 个不同 label
  ensures 返回 TooMany；状态不变

tag [item: Item; label: Label] => [error: Invalid]
  requires label 不合法
  ensures 返回 Invalid；状态不变

untag [item: Item; label: Label] => []
  requires label 合法
  ensures 移除该词；不存在的词幂等

untag [item: Item; label: Label] => [error: Invalid]
  requires label 不合法
  ensures 返回 Invalid；状态不变

rename [from: Label; to: Label] => []
  requires from 存在且 to 合法
  ensures 全量迁移到新词；目标已存在则合并（并集）；与源词/目标词上的并发写入串行，合并不因唯一约束竞争失败

rename [from: Label; to: Label] => [error: NotFound]
  requires from 不存在
  ensures 返回 NotFound；状态不变

rename [from: Label; to: Label] => [error: Invalid]
  requires to 不合法
  ensures 返回 Invalid；状态不变

## operational principle
after tag [item: x1; label: "beta"] => []
after tag [item: x7; label: "beta"] => []
then _byLabel [label: "beta"] 同时返回两者
一次检查捞出散落各处的同类条目

after tag [item: x1; label: "beta"] => []
after tag [item: x7; label: "beta"] => []
after rename [from: "beta"; to: "ga"] => []
then _byLabel [label: "ga"] 同时返回 x1 与 x7，_byLabel [label: "beta"] 为空

after tag [item: x1; label: "beta"] => []
after tag [item: x1; label: "ga"] => []
after rename [from: "beta"; to: "ga"] => []
then _labelsOf [item: x1] 只含 "ga"
合并不产生重复

## queries
_byLabel [label: Label] => [items: set Item]
  returns 带该词的条目；非法或无匹配为空集

_labelsOf [item: Item] => [labels: seq Label]
  returns 该条目的词

_labelsOf [items: set Item] => [labels: Item -> seq Label]
  returns 列表投影批量查询

_popular [n: Int] => [labels: seq Label]
  returns 按出现次数降序、label 升序取前 n

_matching [prefix: String] => [matches: seq (label: Label, items: seq Item)]
  returns 同一套归一化后的前缀匹配；空 prefix 返回全部词；非法 prefix 返回空

## notes
实例化 Item=页面。组合层 rename / _byLabel / _popular / _matching 只见当前租户事务内的 Item。
所有标签写入先取得当前隔离作用域的词汇锁，覆盖合并与条目 50 词上限；同一事务跨多个条目/词的导入也不会因锁序反转而相互死锁。不存在的词改为同名仍返回 NotFound。
概念本身无租户维度。Java 模块不得依赖其他概念。
条目终结时，组合层先以 _labelsOf 查询并逐项 untag，再删除条目；不得借外键级联绕过本概念动作。失败时与条目终结一起回滚。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `TagApi.byLabel` | `label: String` | `Set<UUID>` |
| `TagApi.labelsOf` | `item: TagApi.ItemId` | `List<String>` |
| `TagApi.labelsOf` | `items: Set<UUID>` | `Map<UUID, List<String>>` |
| `TagApi.matching` | `prefix: String` | `List<TagApi.Match>` |
| `TagApi.popular` | `n: int` | `List<String>` |
| `TagApi.rename` | `from: String, to: String` | `TagApi.RenameResult` |
| `TagApi.tag` | `item: TagApi.ItemId, label: String` | `TagApi.TagResult` |
| `TagApi.untag` | `item: TagApi.ItemId, label: String` | `TagApi.UntagResult` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `TagApi.ItemId` | `value: UUID` |
| `TagApi.Match` | `label: String, items: List<UUID>` |
| `TagApi.RenameResult.Invalid` | `[]` |
| `TagApi.RenameResult.NotFound` | `[]` |
| `TagApi.RenameResult.Renamed` | `[]` |
| `TagApi.RenameResult` | `TagApi.RenameResult.Invalid / TagApi.RenameResult.NotFound / TagApi.RenameResult.Renamed` |
| `TagApi.TagResult.Invalid` | `[]` |
| `TagApi.TagResult.Tagged` | `[]` |
| `TagApi.TagResult.TooMany` | `[]` |
| `TagApi.TagResult` | `TagApi.TagResult.Invalid / TagApi.TagResult.Tagged / TagApi.TagResult.TooMany` |
| `TagApi.UntagResult.Invalid` | `[]` |
| `TagApi.UntagResult.Untagged` | `[]` |
| `TagApi.UntagResult` | `TagApi.UntagResult.Invalid / TagApi.UntagResult.Untagged` |

<!-- interface-contract:end -->

# concept Team [Scope]

## purpose
让一个作用域内的群体拥有可命名、可终结的稳定身份

## state
scope: Team -> Scope
name: Team -> String
createdAt: Team -> Time
updatedAt: Team -> Time

Team 由本概念创建。初态集合为空；每 Team 恰有一个 scope/name/createdAt/updatedAt。
名称 NFKC+strip，长度 1..120 个 Java 字符；比较键 lowercase(ROOT)，同 scope 内唯一，不同 scope 可重名。

## actions
create [scope: Scope; name: String] => [team: Team]
  requires 名称合法且同 scope 内未被占用
  ensures 创建新 Team

create [scope: Scope; name: String] => [error: InvalidName]
  requires 名称不合法
  ensures 返回 InvalidName；状态不变

create [scope: Scope; name: String] => [error: NameTaken]
  requires 同 scope 内规范化名已被占用
  ensures 返回 NameTaken；状态不变

rename [team: Team; name: String] => [team: Team]
  requires team 存在、名称合法且同 scope 内未被占用
  ensures 更新 name 与 updatedAt

rename [team: Team; name: String] => [error: NotFound]
  requires team 不存在
  ensures 返回 NotFound；状态不变

rename [team: Team; name: String] => [error: InvalidName]
  requires 名称不合法
  ensures 返回 InvalidName；状态不变

rename [team: Team; name: String] => [error: NameTaken]
  requires 同 scope 内规范化名已被占用
  ensures 返回 NameTaken；状态不变

delete [team: Team] => [team: Team]
  requires team 存在
  ensures 删除该身份

delete [team: Team] => [error: NotFound]
  requires team 不存在
  ensures 返回 NotFound；状态不变

## operational principle
after create [scope: s; name: "Platform"] => [team: t]
then _view [team: t] 的 name="Platform" 且 scope=s
群体身份稳定且不串作用域

after create [scope: s; name: "Platform"] => [team: t]
after rename [team: t; name: "Docs"] => [team: t]
then _view [team: t] 的 name="Docs" 且 t 不变
改名不改授权锚点

after delete [team: t] => [team: t]
then _view [team: t] 为零行
终结后不再可作为活跃群体引用

## queries
_view [team: Team] => [id: Team; scope: Scope; name: String; createdAt: Time; updatedAt: Time]
  returns 零或一绑定

_lock [team: Team] => [id: Team; scope: Scope; name: String; createdAt: Time; updatedAt: Time]
  returns 与 _view 相同的投影；跨概念终结/邀请协调的串行 seam；不改抽象状态

_list [scope: Scope; cursor: String; limit: Int] => [teams: seq View; nextCursor: String]
  returns createdAt/id 倒序 keyset，limit 1..100

## notes
唯一约束拒绝只撤销本次动作，调用方共享事务中的先前事实保留且仍可继续读写；流程是否整体回滚由组合层决定。
Scope 实例化为 Tenant。Team 在应用组合中同时是 Membership 的 Group、Permission 的 Principal 与 Team 管理链的 Resource。
本概念只拥有 Team 身份与名称；成员、邀请、owner 不变量仍由 Membership 拥有，删除级联由 sync 在共享事务中组合。
Java 模块不得依赖其他概念；Scope 是不透明实例化值。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `TeamApi.create` | `scope: UUID, name: String` | `TeamApi.CreateResult` |
| `TeamApi.delete` | `team: TeamApi.TeamId` | `TeamApi.DeleteResult` |
| `TeamApi.list` | `scope: UUID, cursor: String, limit: int` | `TeamApi.Page` |
| `TeamApi.lock` | `team: TeamApi.TeamId` | `Optional<TeamApi.View>` |
| `TeamApi.rename` | `team: TeamApi.TeamId, name: String` | `TeamApi.RenameResult` |
| `TeamApi.view` | `team: TeamApi.TeamId` | `Optional<TeamApi.View>` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `TeamApi.CreateResult.Created` | `team: TeamApi.View` |
| `TeamApi.CreateResult.InvalidName` | `[]` |
| `TeamApi.CreateResult.NameTaken` | `[]` |
| `TeamApi.CreateResult` | `TeamApi.CreateResult.Created / TeamApi.CreateResult.InvalidName / TeamApi.CreateResult.NameTaken` |
| `TeamApi.DeleteResult.Deleted` | `team: TeamApi.TeamId` |
| `TeamApi.DeleteResult.NotFound` | `[]` |
| `TeamApi.DeleteResult` | `TeamApi.DeleteResult.Deleted / TeamApi.DeleteResult.NotFound` |
| `TeamApi.Page` | `teams: List<TeamApi.View>, nextCursor: String` |
| `TeamApi.RenameResult.InvalidName` | `[]` |
| `TeamApi.RenameResult.NameTaken` | `[]` |
| `TeamApi.RenameResult.NotFound` | `[]` |
| `TeamApi.RenameResult.Renamed` | `team: TeamApi.View` |
| `TeamApi.RenameResult` | `TeamApi.RenameResult.InvalidName / TeamApi.RenameResult.NameTaken / TeamApi.RenameResult.NotFound / TeamApi.RenameResult.Renamed` |
| `TeamApi.TeamId` | `value: UUID` |
| `TeamApi.View` | `id: TeamApi.TeamId, scope: UUID, name: String, createdAt: Instant, updatedAt: Instant` |

<!-- interface-contract:end -->

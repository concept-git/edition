# concept Redirect [Scope, Target]

## purpose
让旧地址在内容重组后仍能到达目标

## state
rules: Scope -> Path -> Target
origin: (Scope, Path) -> {auto, manual}

登记的目标是稳定 id，不是新路径字符串。

## actions
register [scope: Scope; path: Path; targetType: TargetType; targetId: Target; origin: Origin] => [rule: Rule]
  requires path 形态合法
  ensures 同路径重复登记则覆盖为最新（origin 一并覆盖）

register [scope: Scope; path: Path; targetType: TargetType; targetId: Target; origin: Origin] => [error: PathInvalid]
  requires path 不合法
  ensures 返回 PathInvalid；状态不变

retire [scope: Scope; path: Path] => []
  ensures 缺失路径幂等成功

## operational principle
after register [scope: s; path: "/api/quickstart"; targetType: page; targetId: x; origin: auto] => [rule: r]
then _lookup [scope: s; path: "/api/quickstart"] => [rule: r]
访客循旧链接仍达目标现址

after register [scope: s; path: "/api/quickstart"; targetType: page; targetId: x; origin: auto] => [rule: r1]
after register [scope: s; path: "/api/quickstart"; targetType: page; targetId: y; origin: auto] => [rule: r2]
then _lookup [scope: s; path: "/api/quickstart"] 的 target 为 y
同路径覆盖为最新目标 id，不靠路径级联

after register [scope: s; path: "/api/*"; targetType: space; targetId: x; origin: auto] => [rule: r]
then _lookup [scope: s; path: "/api/quickstart"] => [rule: r]
前缀规则承接整棵旧挂载树；精确规则仍优先

## queries
_lookup [scope: Scope; path: Path] => [rule: Rule]
  returns 未登记则为零行。先精确匹配；未命中则在以 `/*` 结尾的登记中选最长前缀。前缀按字面路径匹配

_get [scope: Scope; path: Path] => [rule: Rule]
  returns 精确路径的登记；无匹配为零行

_list [scope: Scope; origin?: Origin; cursor: String; limit: Int] => [rules: seq Rule; nextCursor: String]
  returns 管理列表页

## notes
实例化 Scope=站点、Target=(space | page) 稳定 id。auto 规则由重组 sync 登记；manual 供运营维护。
Path 以 `/` 开头、不以 `/` 结尾（`/*` 除外）、≤512 code points、不含空白与 `?#`。
Java 模块不得依赖其他概念。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `RedirectApi.get` | `scope: RedirectApi.ScopeId, path: String` | `Optional<RedirectApi.Rule>` |
| `RedirectApi.list` | `scope: RedirectApi.ScopeId, origin: Optional<RedirectApi.Origin>, cursor: String, limit: int` | `RedirectApi.Page` |
| `RedirectApi.lookup` | `scope: RedirectApi.ScopeId, path: String` | `Optional<RedirectApi.Rule>` |
| `RedirectApi.register` | `scope: RedirectApi.ScopeId, path: String, targetType: RedirectApi.TargetType, targetId: UUID, origin: RedirectApi.Origin` | `RedirectApi.RegisterResult` |
| `RedirectApi.retire` | `scope: RedirectApi.ScopeId, path: String` | `void` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `RedirectApi.Origin` | `AUTO / MANUAL` |
| `RedirectApi.Page` | `items: List<RedirectApi.Rule>, nextCursor: String` |
| `RedirectApi.RegisterResult.PathInvalid` | `[]` |
| `RedirectApi.RegisterResult.Registered` | `rule: RedirectApi.Rule` |
| `RedirectApi.RegisterResult` | `RedirectApi.RegisterResult.PathInvalid / RedirectApi.RegisterResult.Registered` |
| `RedirectApi.Rule` | `scopeId: UUID, path: String, targetType: RedirectApi.TargetType, targetId: UUID, origin: RedirectApi.Origin, createdAt: Instant` |
| `RedirectApi.ScopeId` | `value: UUID` |
| `RedirectApi.TargetType` | `SPACE / PAGE` |

<!-- interface-contract:end -->

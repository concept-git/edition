# concept Search [Scope]

## purpose
让运营者为每个范围确定检索字段的优先顺序，并以版本标识触发重新构建

## state
searchableOrder: Scope -> (fields: seq Field, revision: Nat)

默认字段序 title > headings > body，revision=0。只拥有期望配置，不持有索引或运行中的构建作业。

## actions
configureBoost [scope: Scope; fields: seq Field] => [fields: seq Field; revision: Nat]
  requires fields 是 title/headings/body 的完整无重复排列
  ensures 持久保存并递增 revision（同顺序重复配置亦递增）

terminateScope [scope: Scope] => []
  ensures 同事务清除本 scope 的排序配置；不存在时幂等

## operational principle
after configureBoost [scope: s; fields: [body, title, headings]] => [fields: f; revision: r]
then _configuredBoost [scope: s] => [fields: f; revision: r]
运营者取得已保存的期望配置，可依据版本区分后续构建结果

after configureBoost [scope: s; fields: f] => [fields: f; revision: r]
after configureBoost [scope: s; fields: f] => [fields: f; revision: r+1]
同顺序再次配置也能明确表达重新构建意图

after terminateScope [scope: s] => []
then _configuredBoost [scope: s] 返回默认顺序与 revision=0，其他范围不变

## queries
_configuredBoost [scope: Scope] => [fields: seq Field; revision: Nat]
  returns 未配置则为 title/headings/body、revision=0

## notes
实例化 Scope=站点。唯一持有的业务表为 hosting.search_settings。
Java 模块不得依赖其他概念。
terminateScope 是系统终结动作，不开放 HTTP；组合层在目标身份删除前调用，确保隔离作用域仍可解析，并与目标删除共同提交或回滚。
配置动作不执行外部 I/O。索引构建、查询与物理回收不属于本模块；提交后的配置投递由组合层处理。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `SearchApi.configureBoost` | `scope: SearchApi.ScopeId, fields: List<String>` | `SearchApi.Boost` |
| `SearchApi.configuredBoost` | `scope: SearchApi.ScopeId` | `SearchApi.Boost` |
| `SearchApi.terminateScope` | `scope: SearchApi.ScopeId` | `void` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `SearchApi.Boost` | `fields: List<String>, revision: long` |
| `SearchApi.ScopeId` | `value: UUID` |

<!-- interface-contract:end -->

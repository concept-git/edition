# concept ContentType

## purpose
让租户以明确、不可变的版本定义内容的解释、Schema约束和可信编辑/呈现绑定。

## state
entries: TypeId -> (enabled: Bool, activeVersionRef: String, revision: Int)
versions: VersionRef -> (definition: ContentTypeDefinition, digest: String, createdAt: Instant)
未物化的内置模板是 revision 0 的只读初始值；查询不写库。租户首次管理动作在事务中物化身份，已有停用记录不会回退模板。定义版本不可更新。

## actions
registerVersion [contentType: String, baseRevision: Int, definition: ContentTypeDefinition] => [version: Version]
  requires 当前身份基线一致；定义与Schema资源有界；引用仅限构建登记的可信贡献。
  effects 新增不可变版本，身份 revision 加一；首次登记同时启用并选择该版本，后续登记不切换默认。

activate [contentType: String, baseRevision: Int, versionRef: String] => [state: State]
  requires 版本属于该类型，基线一致。
  effects 选择版本、启用类型并增加 revision。

deactivate [contentType: String, baseRevision: Int] => [state: State]
  requires 类型存在且基线一致。
  effects 停用并增加 revision；不改写已有内容或历史快照。

## operational principle
作者读取目录和版本，租户根管理员登记、启停与切换，授权及幂等由同步层组合。内容修订绑定具体版本，null版本固定兼容内置模板，永不依据当前默认版本重解释。发布时冻结实际定义、Schema闭包和摘要，Reader无需访问本概念。服务端只执行声明Schema和通用资源限制，专业语义属于插件诊断。生产不热安装用户源码。

## queries
list [] => [entries: seq State]
state [contentType: String] => [state: lone State]
versions [contentType: String] => [versions: seq VersionSummary]
version [versionRef: String] => [version: lone Version]
resolve [contentType: String, versionRef: lone String, requireEnabled: Bool] => [snapshot: ContentTypeSnapshot]
implementations [] => [entries: seq Implementation]
formatOf [contentType: String] => [format: lone String]

matching [contentType: String, digest: String] => [version: lone Version]
  returns 本租户已登记或固定内置的精确摘要版本，供导入重绑定，绝不接受外部定义直接成为可信版本。

## notes
类型身份与可执行实现分离，同一类型可引用多个可信编辑/呈现贡献。Schema资源只在版本登记时保存并校验，生产不安装开发候选。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `ContentTypeApi.activate` | `contentType: String, baseRevision: int, versionRef: String` | `ContentTypeApi.State` |
| `ContentTypeApi.deactivate` | `contentType: String, baseRevision: int` | `ContentTypeApi.State` |
| `ContentTypeApi.formatOf` | `contentType: String` | `Optional<String>` |
| `ContentTypeApi.implementations` | `` | `List<ContentTypeApi.Implementation>` |
| `ContentTypeApi.list` | `` | `List<ContentTypeApi.State>` |
| `ContentTypeApi.matching` | `contentType: String, digest: String` | `Optional<ContentTypeApi.Version>` |
| `ContentTypeApi.registerVersion` | `contentType: String, baseRevision: int, definition: ContentTypeDefinition` | `ContentTypeApi.Version` |
| `ContentTypeApi.resolve` | `contentType: String, versionRef: String, requireEnabled: boolean` | `ContentTypeSnapshot` |
| `ContentTypeApi.state` | `contentType: String` | `Optional<ContentTypeApi.State>` |
| `ContentTypeApi.version` | `versionRef: String` | `Optional<ContentTypeApi.Version>` |
| `ContentTypeApi.versions` | `contentType: String` | `List<ContentTypeApi.VersionSummary>` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `ContentTypeApi.Implementation` | `id: String, name: String, version: String, contentTypes: List<String>, formats: List<String>, capabilities: List<String>, trusted: boolean` |
| `ContentTypeApi.State` | `contentType: String, enabled: boolean, revision: int, activeVersionRef: String, label: String, format: String, mediaType: String, builtin: boolean` |
| `ContentTypeApi.VersionSummary` | `versionRef: String, contentType: String, version: String, digest: String, createdAt: Instant` |
| `ContentTypeApi.Version` | `versionRef: String, digest: String, definition: ContentTypeDefinition, createdAt: Instant` |

<!-- interface-contract:end -->

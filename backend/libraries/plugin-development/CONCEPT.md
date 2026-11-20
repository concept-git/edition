# concept PluginDevelopment

## purpose
让租户管理员保存插件开发源码并捕获可重复验证的不可变候选构件。

## state
workspaces: DevelopmentId -> (tenant: TenantId, name: String, contentType: String, revision: Int, source: Source, sourceDigest: String, createdAt: Time, updatedAt: Time, deletedAt: lone Time)
candidates: CandidateId -> (tenant: TenantId, developmentId: DevelopmentId, sourceRevision: Int, sourceDigest: String, bundleDigest: String, entryPoint: String, bundle: String, environment: String, source: Source, createdAt: Time)
Source 包含有界 files、manifest、configuration、fixtures、dependencyLock 与 baselineRef。Source 与浏览器构件各上限 8MiB，以覆盖完整内置编辑器克隆；文件数最多100。源码摘要由服务端对稳定文件顺序序列化计算。初态无工作稿；create 基线为 1。

## actions
create [name: String; contentType: String; source: Source] => [development: Development]
create [name: String; contentType: String; source: Source] => [error: Invalid]
  ensures 无效或超界输入不产生工作稿。
save [id: DevelopmentId; baseRevision: Int; name: String; contentType: String; source: Source] => [development: Development]
  requires baseRevision 匹配；ensures 整体保存，revision+1。
save [id: DevelopmentId; baseRevision: Int; name: String; contentType: String; source: Source] => [error: Conflict | Missing | Invalid]
  ensures 拒绝时不改工作稿。
delete [id: DevelopmentId; baseRevision: Int] => []
  requires 基线匹配；ensures 归档可编辑工作稿，保留候选。
delete [id: DevelopmentId; baseRevision: Int] => [error: Conflict | Missing]
  ensures 拒绝时保持工作稿与候选。
compile [id: DevelopmentId; baseRevision: Int; sourceDigest: String; entryPoint: String; bundle: String; environment: String] => [candidate: Candidate]
  requires 基线和服务端源码摘要匹配、入口存在、环境为 browser-es2022-v1、构件有界；ensures 服务端复算构件摘要，捕获完整源码与构件后永不改写。浏览器实际编译，服务端不执行未受信程序。
compile [id: DevelopmentId; baseRevision: Int; sourceDigest: String; entryPoint: String; bundle: String; environment: String] => [error: Conflict | Missing | Invalid]
  ensures 拒绝时不产生候选，也不修改工作稿。

## operational principle
after create 得到 revision=1，save(baseRevision=1) 得到 revision=2，再保存旧基线返回 Conflict；原文和摘要保持当前状态。
after compile 捕获候选，再修改工作稿；candidate 仍返回原源码、原样例和原构件摘要。换租户后 find 返回无匹配，写入也不可定位目标。

## queries
find [id: DevelopmentId] => [development: lone Development]
list [] => [developments: seq DevelopmentSummary]
candidates [id: DevelopmentId] => [candidates: seq CandidateSummary]
candidate [developmentId: DevelopmentId; id: CandidateId] => [candidate: lone Candidate]
  returns 当前租户的有限记录。列表仅返回标识、版本、摘要及时间等元数据；SQL只投影元数据，不读取源码或构件。完整内容通过find/candidate单项查询读取；列表最多100项。

## notes
本概念独占工作稿和候选表；源码可编辑事实与不可变候选分开。manifest、configuration、fixtures、dependencyLock必须各为一个完整JSON值，拒绝后随额外JSON值；代码文件可以尚未编译通过。租户授权及幂等由组合层完成。候选不是正式生产安装。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `PluginDevelopmentApi.candidate` | `developmentId: UUID, id: UUID` | `Optional<PluginDevelopmentApi.Candidate>` |
| `PluginDevelopmentApi.candidates` | `id: UUID` | `List<PluginDevelopmentApi.CandidateSummary>` |
| `PluginDevelopmentApi.compile` | `id: UUID, baseRevision: int, sourceDigest: String, entryPoint: String, bundle: String, environment: String` | `PluginDevelopmentApi.Candidate` |
| `PluginDevelopmentApi.create` | `name: String, contentType: String, source: PluginDevelopmentApi.Source` | `PluginDevelopmentApi.Development` |
| `PluginDevelopmentApi.delete` | `id: UUID, baseRevision: int` | `void` |
| `PluginDevelopmentApi.find` | `id: UUID` | `Optional<PluginDevelopmentApi.Development>` |
| `PluginDevelopmentApi.list` | `` | `List<PluginDevelopmentApi.DevelopmentSummary>` |
| `PluginDevelopmentApi.save` | `id: UUID, baseRevision: int, name: String, contentType: String, source: PluginDevelopmentApi.Source` | `PluginDevelopmentApi.Development` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `PluginDevelopmentApi.CandidateSummary` | `id: UUID, developmentId: UUID, sourceRevision: int, sourceDigest: String, bundleDigest: String, entryPoint: String, environment: String, createdAt: Instant` |
| `PluginDevelopmentApi.Candidate` | `id: UUID, developmentId: UUID, sourceRevision: int, sourceDigest: String, bundleDigest: String, entryPoint: String, bundle: String, environment: String, source: PluginDevelopmentApi.Source, createdAt: Instant` |
| `PluginDevelopmentApi.DevelopmentSummary` | `id: UUID, name: String, contentType: String, revision: int, sourceDigest: String, createdAt: Instant, updatedAt: Instant` |
| `PluginDevelopmentApi.Development` | `id: UUID, name: String, contentType: String, revision: int, source: PluginDevelopmentApi.Source, sourceDigest: String, createdAt: Instant, updatedAt: Instant` |
| `PluginDevelopmentApi.Source` | `files: Map<String, String>, manifest: String, configuration: String, fixtures: String, dependencyLock: String, baselineRef: String` |

<!-- interface-contract:end -->

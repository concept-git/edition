# syncs: 内容插件开发与验证

目录及读取先租户准入；开发/验证写要求租户根 admin 与管理凭据任务范围。任何写入经幂等执行器进入同一事务；查询结果均由租户RLS过滤。浏览器构件仅用于开发验证，永不直接加入生产目录。

sync pluginCatalog
// implementation: PluginCatalogUseCase#pluginCatalog
when {
  Requesting/pluginCatalog => [request: r]
}
where {
  租户准入；当前租户成员可读
}
then {
  ContentType.implementations返回构建登记的可信实现；根据实际租户根admin授权投影canDevelop；productionLoading为build-time-only
}

sync listPluginDevelopments
// implementation: ListPluginDevelopmentsUseCase#listPluginDevelopments
when {
  Requesting/listPluginDevelopments => [request: r]
}
where {
  租户准入；当前租户成员可读
}
then {
  PluginDevelopment.list通过SQL元数据投影返回当前租户最近100个未归档工作稿摘要，不读取或传输源码；单项查询读取完整源码
}

sync viewPluginDevelopment
// implementation: ViewPluginDevelopmentUseCase#viewPluginDevelopment
when {
  Requesting/viewPluginDevelopment => [request: r]
}
where {
  租户准入；当前租户成员可读
}
then {
  PluginDevelopment.find只返回当前租户未归档工作稿；不可见或未匹配目标返回not-found
}

sync createPluginDevelopment
// implementation: CreatePluginDevelopmentUseCase#createPluginDevelopment
when {
  Requesting/createPluginDevelopment => [request: r]
}
where {
  租户准入；租户根 admin，Idempotency-Key 有效
}
then {
  PluginDevelopment.create整体保存源码，初始revision=1，服务端计算sourceDigest；幂等重放相同结果，无效输入不写入
}

sync savePluginDevelopment
// implementation: SavePluginDevelopmentUseCase#savePluginDevelopment
when {
  Requesting/savePluginDevelopment => [request: r]
}
where {
  租户准入；租户根 admin，Idempotency-Key 有效
}
then {
  PluginDevelopment.save在行锁内核对baseRevision后整体保存源码并增加revision；旧基线冲突不写入，幂等请求重放原结果
}

sync deletePluginDevelopment
// implementation: DeletePluginDevelopmentUseCase#deletePluginDevelopment
when {
  Requesting/deletePluginDevelopment => [request: r]
}
where {
  租户准入；租户根 admin，Idempotency-Key 有效
}
then {
  PluginDevelopment.delete核对baseRevision后归档工作稿，保留候选与报告；基线冲突不归档，幂等请求重放原结果
}

sync compilePluginCandidate
// implementation: CompilePluginCandidateUseCase#compilePluginCandidate
when {
  Requesting/compilePluginCandidate => [request: r]
}
where {
  租户准入；租户根 admin，Idempotency-Key 有效
}
then {
  PluginDevelopment.compile核对源码基线、摘要和环境，固定浏览器构件与完整源码，服务端复算bundleDigest；不在服务器执行代码，不安装到生产目录
}

sync listPluginCandidates
// implementation: ListPluginCandidatesUseCase#listPluginCandidates
when {
  Requesting/listPluginCandidates => [request: r]
}
where {
  租户准入；当前租户成员可读
}
then {
  PluginDevelopment.candidates通过SQL元数据投影返回当前租户工作稿最近100个不可变候选摘要，不读取或传输源码/构件；单项查询返回完整内容，不可见工作稿返回not-found
}

sync viewPluginCandidate
// implementation: ViewPluginCandidateUseCase#viewPluginCandidate
when {
  Requesting/viewPluginCandidate => [request: r]
}
where {
  租户准入；当前租户成员可读
}
then {
  PluginDevelopment.candidate根据developmentId与candidateId返回当前租户固定源码、构件和摘要；不可见或未匹配目标返回not-found
}

sync verifyPluginCandidate
// implementation: VerifyPluginCandidateUseCase#verifyPluginCandidate
when {
  Requesting/verifyPluginCandidate => [request: r]
}
where {
  租户准入；租户根 admin，Idempotency-Key 有效
}
then {
  读取PluginDevelopment固定候选，核对fixtureDigest与environment；检查SDK声明和有界样例，每个样例在视图循环前按明确的versionRef或ContentType当时的默认引用只解析一次不可变定义；该样例的全部视图共享实际版本引用与定义摘要，各视图仍独立合并贡献/源码/样例配置并以固定定义的format与Schema调用Release.inspectContent，不额外补入默认配置；每项内容检查message固定实际版本引用与定义摘要，无法解析则记录请求引用和失败；PluginVerification.record分开保存浏览器证据与服务端检查，productionEligible恒为false，幂等重放原报告
}

sync listPluginVerifications
// implementation: ListPluginVerificationsUseCase#listPluginVerifications
when {
  Requesting/listPluginVerifications => [request: r]
}
where {
  租户准入；当前租户成员可读
}
then {
  PluginVerification.list通过SQL元数据投影返回当前租户最近100个不可变报告摘要，只含两方passed汇总，不读取或传输checks，可按developmentId筛选
}

sync viewPluginVerification
// implementation: ViewPluginVerificationUseCase#viewPluginVerification
when {
  Requesting/viewPluginVerification => [request: r]
}
where {
  租户准入；当前租户成员可读
}
then {
  PluginVerification.find返回当前租户固定候选/样例/环境摘要及分别记录的证据；不可见或未匹配目标返回not-found
}

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `CompilePluginCandidateUseCase.compilePluginCandidate` | `credential: String, tenant: UUID, id: UUID, base: int, digest: String, entry: String, bundle: String, environment: String, key: String` | `FlowResponse<PluginManagementTypes.Candidate>` |
| `CreatePluginDevelopmentUseCase.createPluginDevelopment` | `credential: String, tenant: UUID, name: String, type: String, source: PluginManagementTypes.Source, key: String` | `FlowResponse<PluginManagementTypes.Development>` |
| `DeletePluginDevelopmentUseCase.deletePluginDevelopment` | `credential: String, tenant: UUID, id: UUID, base: int, key: String` | `FlowResponse<PluginManagementTypes.Removed>` |
| `ListPluginCandidatesUseCase.listPluginCandidates` | `credential: String, tenant: UUID, id: UUID` | `PluginManagementTypes.CandidateList` |
| `ListPluginDevelopmentsUseCase.listPluginDevelopments` | `credential: String, tenant: UUID` | `PluginManagementTypes.DevelopmentList` |
| `ListPluginVerificationsUseCase.listPluginVerifications` | `credential: String, tenant: UUID, id: UUID` | `PluginManagementTypes.VerificationList` |
| `PluginCatalogUseCase.pluginCatalog` | `credential: String, tenant: UUID` | `PluginManagementTypes.Catalog` |
| `SavePluginDevelopmentUseCase.savePluginDevelopment` | `credential: String, tenant: UUID, id: UUID, base: int, name: String, type: String, source: PluginManagementTypes.Source, key: String` | `FlowResponse<PluginManagementTypes.Development>` |
| `VerifyPluginCandidateUseCase.verifyPluginCandidate` | `credential: String, tenant: UUID, developmentId: UUID, candidateId: UUID, fixtureDigest: String, environment: String, browser: PluginManagementTypes.Evidence, key: String` | `FlowResponse<PluginManagementTypes.Verification>` |
| `ViewPluginCandidateUseCase.viewPluginCandidate` | `credential: String, tenant: UUID, id: UUID, candidateId: UUID` | `PluginManagementTypes.Candidate` |
| `ViewPluginDevelopmentUseCase.viewPluginDevelopment` | `credential: String, tenant: UUID, id: UUID` | `PluginManagementTypes.Development` |
| `ViewPluginVerificationUseCase.viewPluginVerification` | `credential: String, tenant: UUID, id: UUID` | `PluginManagementTypes.Verification` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `PluginManagementTypes.CandidateList` | `items: List<PluginManagementTypes.CandidateSummary>` |
| `PluginManagementTypes.CandidateSummary` | `id: UUID, developmentId: UUID, sourceRevision: int, sourceDigest: String, bundleDigest: String, entryPoint: String, environment: String, createdAt: Instant` |
| `PluginManagementTypes.Candidate` | `id: UUID, developmentId: UUID, sourceRevision: int, sourceDigest: String, bundleDigest: String, entryPoint: String, bundle: String, environment: String, source: PluginManagementTypes.Source, createdAt: Instant` |
| `PluginManagementTypes.Catalog` | `items: List<PluginManagementTypes.Descriptor>, productionLoading: String, canDevelop: boolean` |
| `PluginManagementTypes.Check` | `name: String, passed: boolean, message: String` |
| `PluginManagementTypes.Descriptor` | `id: String, name: String, version: String, contentTypes: List<String>, formats: List<String>, capabilities: List<String>, trusted: boolean` |
| `PluginManagementTypes.DevelopmentList` | `items: List<PluginManagementTypes.DevelopmentSummary>` |
| `PluginManagementTypes.DevelopmentSummary` | `id: UUID, name: String, contentType: String, revision: int, sourceDigest: String, createdAt: Instant, updatedAt: Instant` |
| `PluginManagementTypes.Development` | `id: UUID, name: String, contentType: String, revision: int, source: PluginManagementTypes.Source, sourceDigest: String, createdAt: Instant, updatedAt: Instant` |
| `PluginManagementTypes.Evidence` | `passed: boolean, checks: List<PluginManagementTypes.Check>` |
| `PluginManagementTypes.Removed` | `id: UUID` |
| `PluginManagementTypes.Source` | `files: Map<String, String>, manifest: String, configuration: String, fixtures: String, dependencyLock: String, baselineRef: String` |
| `PluginManagementTypes.VerificationList` | `items: List<PluginManagementTypes.VerificationSummary>` |
| `PluginManagementTypes.VerificationSummary` | `id: UUID, developmentId: UUID, candidateId: UUID, sourceDigest: String, bundleDigest: String, fixtureDigest: String, environment: String, browserPassed: boolean, serverPassed: boolean, productionEligible: boolean, createdAt: Instant` |
| `PluginManagementTypes.Verification` | `id: UUID, developmentId: UUID, candidateId: UUID, sourceDigest: String, bundleDigest: String, fixtureDigest: String, environment: String, browserEvidence: PluginManagementTypes.Evidence, serverValidation: PluginManagementTypes.Evidence, productionEligible: boolean, createdAt: Instant` |

<!-- interface-contract:end -->

ContentType 的实现发现为构建只读查询；独立类型登记同步负责租户根管理员授权、乐观锁和幂等，首次管理动作物化模板。验证固定样例通过 ContentType.resolve 取得具体定义，再调用 Release.inspectContent 通用Schema检查，不让概念直接依赖。

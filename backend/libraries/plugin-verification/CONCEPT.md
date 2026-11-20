# concept PluginVerification

## purpose
让发起者取得绑定固定候选、样例与环境的可追溯验证证据，并分辨证据权威来源。

## state
reports: VerificationId -> (tenant: TenantId, developmentId: DevelopmentId, candidateId: CandidateId, sourceDigest: String, bundleDigest: String, fixtureDigest: String, environment: String, browserEvidence: Evidence, serverValidation: Evidence, productionEligible: Bool, createdAt: Time)
初态无报告。已记录证据不可改写。Evidence 是 passed 与有界 checks；browserEvidence最多500项，每项name最多200字符、message最多1000字符；browserEvidence 来自客户端，serverValidation 来自服务端执行的检查，productionEligible 恒为 false。

## actions
record [input: Input; serverChecks: seq Check] => [verification: Verification]
  requires 调用方已核对固定候选、样例摘要与环境；ensures 新报告固定所有摘要，serverValidation.passed 仅由 serverChecks 计算；浏览器 passed 不可覆盖此结果，不使候选成为生产可信实现。

## operational principle
after 浏览器报告 passed=true 而服务端 checks 含失败，record 返回 browserEvidence.passed=true、serverValidation.passed=false、productionEligible=false。再次验证得到新报告，历史报告不变；工作稿后续修改不改变绑定候选。

## queries
find [id: VerificationId] => [verification: lone Verification]
list [developmentId: lone DevelopmentId] => [verifications: seq VerificationSummary]
  returns 当前租户最近100份不可变证据摘要，包含各方汇总passed标记，不包含checks。SQL只投影元数据和汇总布尔值；完整证据仅通过find单项读取。

## notes
校验工作由组合层读取固定输入并调用可信内容校验门面；本概念不读取其他概念的表，也不执行用户提供的程序。每次允许1..50个固定样例，每族编辑/预览贡献最多50项，最多验证500个样例/视图组合；样例id和label最多200字符、contentType最多128字符。每个匹配视图按贡献config、源码configuration、样例config顺序浅合并，后者覆盖前者，与浏览器运行输入一致。报告明确区分浏览器交互证据与服务端结构/内容验证；不把二者等同为软件供应链批准。

样例只接受SDK定义的config配置入口；出现未定义的interpretation别名时报告结构失败，避免与浏览器实际输入产生歧义。样例可声明非空、最多256字符的versionRef；省略时选ContentType当前默认版本。每个样例只解析一次不可变定义，全部匹配视图共用实际版本，各视图配置仍独立合并与校验；并发切换默认版本不改变该样例后续视图的定义。校验读取解析后不可变定义的底层格式与Schema，不再按当前默认格式解释明确指定的旧版本，也不补入定义默认配置。每项内容检查的不可变message记录实际versionRef与定义digest；无法解析时只记录请求引用并明确失败，不声称已使用某个版本。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `PluginVerificationApi.find` | `id: UUID` | `Optional<PluginVerificationApi.Verification>` |
| `PluginVerificationApi.list` | `developmentId: UUID` | `List<PluginVerificationApi.VerificationSummary>` |
| `PluginVerificationApi.record` | `input: PluginVerificationApi.Input, serverChecks: List<PluginVerificationApi.Check>` | `PluginVerificationApi.Verification` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `PluginVerificationApi.Check` | `name: String, passed: boolean, message: String` |
| `PluginVerificationApi.Evidence` | `passed: boolean, checks: List<PluginVerificationApi.Check>` |
| `PluginVerificationApi.Input` | `developmentId: UUID, candidateId: UUID, sourceDigest: String, bundleDigest: String, fixtureDigest: String, environment: String, browserEvidence: PluginVerificationApi.Evidence` |
| `PluginVerificationApi.VerificationSummary` | `id: UUID, developmentId: UUID, candidateId: UUID, sourceDigest: String, bundleDigest: String, fixtureDigest: String, environment: String, browserPassed: boolean, serverPassed: boolean, productionEligible: boolean, createdAt: Instant` |
| `PluginVerificationApi.Verification` | `id: UUID, developmentId: UUID, candidateId: UUID, sourceDigest: String, bundleDigest: String, fixtureDigest: String, environment: String, browserEvidence: PluginVerificationApi.Evidence, serverValidation: PluginVerificationApi.Evidence, productionEligible: boolean, createdAt: Instant` |

<!-- interface-contract:end -->

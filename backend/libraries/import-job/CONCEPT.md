# concept ImportJob

## purpose

让发起者能观察并恢复一次异步导入，同时保留其有限的进度与问题报告。

## state

jobs: JobId -> (tenant: TenantId, space: SpaceId, release: ReleaseId, zipKey: Key, status: Status, phase: String, attempt: Nat, progressDone: optional Nat, progressTotal: optional Nat, report: Report, nextRunAt: optional Time, outcome: optional String, adapterId: optional String)

初态为空。每次 enqueue 创建新的作业身份；status 为 queued/running/retrying/completed/failed。Report 的 errors/info 各最多 100 项，超出时末项为 issues_truncated；问题只含 code/path/detail，不依赖适配器类型。终态保留最后 phase，重试保留身份与原包键。

## actions

enqueue [tenantId: TenantId; spaceId: SpaceId; releaseId: ReleaseId; zipSha256: String; zipKey: Key; traceId: String; sourceUrl: optional String] => [view: View]
  ensures 保存导入意图与源包引用；sourceUrl 只供视图回显
enqueue [tenantId: TenantId; spaceId: SpaceId; releaseId: ReleaseId; zipSha256: String; zipKey: Key; traceId: String] => [view: View]
  ensures 等同于 sourceUrl=null 的完整入口
saveReport [job: JobId; report: Report] => []
  ensures 保存有界报告；不更改作业身份
markRunning [jobId: JobId; phase: String] => [view: View]
  ensures 在可运行状态增加 attempt 并清除上一轮报告
markProgress [jobId: JobId; phase: String; progressDone: optional Int; progressTotal: optional Int] => []
  ensures 保存当前阶段与进度
complete [jobId: JobId; status: String; outcome: String; adapterId: String] => [view: View]
  ensures 保存终态、实际识别格式与最后 phase；promoted 时 done=total
retrying [jobId: JobId; error: String; nextRunAt: Time] => [view: View]
retrying [job: JobId; error: String; nextRunAt: Time; attempt: Int] => []
  ensures 仅当前尝试安排下一次运行
fail [jobId: JobId; outcome: String; error: String] => [view: View]
fail [job: JobId; outcome: String; error: String; attempt: Int] => []
  ensures 仅当前尝试可记失败终态
retryFailed [job: JobId] => [accepted: Bool]
  ensures 可恢复时沿用原作业身份与包，不新建作业
terminateSpace [space: SpaceId] => []
  ensures 终结该空间未完成的导入意图
advisoryLock [spaceId: SpaceId] => []
tryAdvisoryLock [space: SpaceId] => [acquired: Bool]
  ensures 使用同空间锁裁决串行导入

## operational principle

after enqueue [tenantId: t; spaceId: s; releaseId: r; zipSha256: h; zipKey: k; traceId: tr] => [view: j]
then markRunning [jobId: j.id; phase: adapting] => [view: running]，saveReport [job: j.id; report: p] => []，complete [jobId: j.id; status: completed; outcome: promoted; adapterId: a] => [view: done]；
发起者查询 j.id 可看到原包、阶段、有限问题及终态；失败后 retryFailed 不改变 j.id。

## queries

queueDepth [] => [count: Long]
  returns queued/retrying 数，不输出租户身份或载荷
view [jobId: JobId] => [view: optional View]
viewBySpace [spaceId: SpaceId; jobId: JobId] => [view: optional View]
  returns 无匹配为 empty
hasUnfinished [spaceId: SpaceId] => [unfinished: Bool]
referencesObject [key: Key] => [referenced: Bool]
pending [limit: Int] => [jobs: seq Pending]
list [before: JobId; space: SpaceId; status: String; limit: Int] => [jobs: seq View]
count [space: SpaceId; status: String] => [count: Long]
  returns 与 list 同过滤但忽略 before 游标
outcomes [space: SpaceId; from: Time; to: Time] => [counts: Map<String, Long>]

## notes

本概念独占 `shared.jobs` 中 `type=import` 的行和报告。`adapterId` 仅是适配结果的稳定字符串，作业模块不读取 ImportFormat 的状态或类型；格式结果转为本概念的 `Issue` 由 sync 完成。

进度与报告在独立短事务提交，避免主事务持有作业行锁时阻塞状态写入。作业查询仍由调用方核验租户与空间权限。`queueDepth` 使用只返回总数的窄函数。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `ImportJobApi.advisoryLock` | `spaceId: UUID` | `void` |
| `ImportJobApi.complete` | `jobId: UUID, status: String, outcome: String, adapterId: String` | `ImportJobApi.View` |
| `ImportJobApi.count` | `space: UUID, status: String` | `long` |
| `ImportJobApi.enqueue` | `tenantId: UUID, spaceId: UUID, releaseId: UUID, zipSha256: String, zipKey: String, traceId: String, sourceUrl: String` | `ImportJobApi.View` |
| `ImportJobApi.enqueue` | `tenantId: UUID, spaceId: UUID, releaseId: UUID, zipSha256: String, zipKey: String, traceId: String` | `ImportJobApi.View` |
| `ImportJobApi.fail` | `job: UUID, outcome: String, error: String, attempt: int` | `void` |
| `ImportJobApi.fail` | `jobId: UUID, outcome: String, error: String` | `ImportJobApi.View` |
| `ImportJobApi.hasUnfinished` | `spaceId: UUID` | `boolean` |
| `ImportJobApi.list` | `before: UUID, space: UUID, status: String, limit: int` | `List<ImportJobApi.View>` |
| `ImportJobApi.markProgress` | `jobId: UUID, phase: String, progressDone: Integer, progressTotal: Integer` | `void` |
| `ImportJobApi.markRunning` | `jobId: UUID, phase: String` | `ImportJobApi.View` |
| `ImportJobApi.outcomes` | `space: UUID, from: Instant, to: Instant` | `Map<String, Long>` |
| `ImportJobApi.pending` | `limit: int` | `List<ImportJobApi.Pending>` |
| `ImportJobApi.queueDepth` | `` | `long` |
| `ImportJobApi.referencesObject` | `key: String` | `boolean` |
| `ImportJobApi.retryFailed` | `job: UUID` | `boolean` |
| `ImportJobApi.retrying` | `job: UUID, error: String, nextRunAt: Instant, attempt: int` | `void` |
| `ImportJobApi.retrying` | `jobId: UUID, error: String, nextRunAt: Instant` | `ImportJobApi.View` |
| `ImportJobApi.saveReport` | `job: UUID, report: ImportJobApi.Report` | `void` |
| `ImportJobApi.terminateSpace` | `space: UUID` | `void` |
| `ImportJobApi.tryAdvisoryLock` | `space: UUID` | `boolean` |
| `ImportJobApi.viewBySpace` | `spaceId: UUID, jobId: UUID` | `Optional<ImportJobApi.View>` |
| `ImportJobApi.view` | `jobId: UUID` | `Optional<ImportJobApi.View>` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `ImportJobApi.Issue` | `code: String, path: String, detail: String` |
| `ImportJobApi.Pending` | `tenantId: UUID, jobId: UUID` |
| `ImportJobApi.Report` | `errors: List<ImportJobApi.Issue>, info: List<ImportJobApi.Issue>` |
| `ImportJobApi.View` | `id: UUID, tenantId: UUID, spaceId: UUID, status: String, phase: String, progressDone: Integer, progressTotal: Integer, attempt: int, nextRunAt: Instant, outcome: String, releaseId: UUID, zipSha256: String, zipKey: String, adapterId: String, traceId: String, createdAt: Instant, sourceUrl: String, report: ImportJobApi.Report` |

<!-- interface-contract:end -->

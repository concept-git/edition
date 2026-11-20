# syncs: 持续导入与发版流水线（synced 空间）

> 本包是 live 导入 flow，与唯一 `BundleImportFacade` 共置。
> authored 共享流水线（loadRejected / autoValidate / skipNoChange / autoRelease /
> holdOnErrors / retention）留在 [../release/SYNCS.md](../release/SYNCS.md)；导入**不得**调用
> `autoValidate(rel, {})`。格式嗅探与适配走平台概念 `platform.importformat`（见 ADR-0020）；
> gateway 与其他概念模块看不见它。不暴露 HTTP。

## flow: 持续导入与发版流水线（synced 空间）

触发: `Requesting/import` / `Requesting/startImportUpload` / `Requesting/viewImportJob` /
`Requesting/viewDrift` / `Requesting/listPreviewPages` / `Requesting/previewRelease` / `Requesting/approve`

前缀 `{spaceBase}` = `/api/v1/tenants/{tenantId}/spaces/{spaceId}`。链 `[tenant, space]`，无 Site。
写强制 Idempotency-Key。仅 **synced + active** 接受整体导入。

实现层：受理事务提交后，worker 在独立线程执行（HTTP 202 不等待流水线结束）；
worker 持 `space_id` PG advisory lock 仅覆盖运行期；同一空间导入串行。
作业 type=`import`，状态 `queued/running/retrying/failed/completed`。导入阻断校验的
终态是 **status=completed + outcome=held**（held 是 outcome，不是 job status）。
不交付通用 `/ops/jobs`。
helper / worker / 锁 / 进度 / 适配调用**不得**写成 `BundleImportFacade` 的方法（含 private）：
`SyncSpecParityTest` 把全部声明方法都当成 sync。

### 入站与 202

1. CI：`POST …/releases:import`，`application/zip` 或仅该路由的 multipart `file`，独立 500 MiB
   filter；边收边 sha256 边流式写入对象存储，收完 202。
2. 浏览器大包：`POST …/releases:import-uploads` → 预签名 PUT（15 min）+ `uploadKey`；直传对象存储；
   再 `POST …/releases:import` body `{uploadKey}`。
3. 远程地址：`POST …/releases:import` body `{url}`；服务端在受理事务内同步拉取（与 1 同构，sha256
   受理时算出）。仅 `https`；DNS 解析后拒 loopback / 私网 / link-local / 元数据地址；最多 5 跳，
   **每跳重验**（GitHub 302 → codeload）；不带凭据；远程上限 **100 MiB**（边下边截，不信 Content-Length）；
   连接 10 s / 总时长 60 s；服务端出流量并发 ≤4。配置 `io.space.import.remote.allowed-hosts`
   精确命中的主机视为运维信任来源，**仅对用户直接给出的首跳**跳过 https 与私网检查（e2e 测试栈 MinIO、自建 GitLab）；跳转目标一律按公网规则。平台不存 PAT、不 clone、不记忆地址（ADR-0020）。
   job `payload.sourceUrl` 记录地址并在 202 / `viewImportJob` 回显。
   远端 404 / DNS 失败 / 超时 → 422 `import_source_unreachable`；非 https / 私网 / 跳数超限 / 非法 URL →
   422 `import_source_forbidden`；拉到非 zip → 4xx `invalid_bundle`；超 100 MiB → 422 `file_too_large`；
   出流量并发满 → 503 `dependency_unavailable`（我方容量）。

zip 合计超过 500 MiB（远程 100 MiB）→ 422 `file_too_large`；入站尚不是合法 zip → 4xx `invalid_bundle`。
**以上都不建 job、不建 Release**（不是 worker 终态）。

受理时即 `Release/draft(source.kind=import, ref=zipSha256)`。202 信封：

```text
{ job: { id, status, phase, progress: {done, total}, attempt, nextRunAt, traceId, outcome?, sourceUrl?, adapterId? },
  release: { id, … } | null }
```

`adapterId` 是嗅探命中的格式约定 id（`bundle-v1 / hwcloud-docs / okf-v0.1 / file-tree`），worker 完成
adapt 后写入作业行并在 `viewImportJob` 回显，供界面显示「识别为 X」；无适配器命中或 zip 本身损坏时为 null。
格式**不是**用户输入——识别是确定性、有优先级的嗅探，界面不提供格式选择（`platform.importformat/CONCEPT.md`）。

`uploading` 是前端本地相位（job 在上传完成、受理事务提交后才存在）。受理后 `queued`。
worker 相位：`inspecting → adapting → storing → loading → validating → promoting → mirroring`。
终态由 `status=completed/failed` + `outcome` 表达，不把 `completed` 写成 phase。
成功镜像完成时 `done=total`；失败或非法包不虚报已完成数量。终态界面保留计数，不再显示进行中的相位文案。
作业视图附带 report.errors/info（code/path/detail），拒绝或 skipped 后也可查询；前端显示具体问题及容错说明。
`progress.total` 仅 adapting/storing/mirroring 有计数，其余 null。无 websocket；前端受理后只轮询 job。

幂等：import 指纹 = `spaceId + zipSha256`（流式算完再封存）；远程地址来源指纹 = `spaceId + url`，拉取在幂等动作内进行，同键重放不再产生出流量；同键同指纹重放同一 202；
同键异指纹 409 `idempotency_key_reused`。approve 指纹 = `releaseId + flagged`。

### worker 流水线（散文；下列名字不是 sync）

`inspect → adapt → store attachments → Release/load → Release/validate(coverageWarnings) →`
`skip | flagged | held | auto promote → mirror → prune`。
promote / mirror / prune 同事务；mirror 用内存中的 Bundle，不读 prune 产物。

每次 worker 尝试用单调时钟记录 inspecting/adapting/loading/validating/comparing/promoting/mirroring/completing
各阶段耗时；adapting 包含流式对象存储写入。日志总耗时不包含受理、排队及事务提交，失败尝试也保留已运行阶段，
不把阶段耗时当作成功结果。快照每批最多 64 页写入；工作区存在性查询同样分批并清理事务查询缓存，避免保留整份旧正文。

sniff以中央目录为主，OKF可有界读取index.md前2KiB确认；不将完整ZIP解压到内存。`ImportFormatRegistry` 按 order 取第一个
命中：`bundle-v1` → `hwcloud-docs` → `okf-v0.1` → `file-tree`（兜底：任意 md/html/txt/json/xml 即成页，
目录即 Toc）；零命中 = 未知格式 = **包内没有任何可成页文件**。适配成功后核心只
`Release/load(Bundle v1)`。

覆盖清单：组合层算 `Release/_live` 相对 组合层选出的最近已晋升 import 基线
`Release/_lastOf(kind=import)` 中、即将被本 Bundle 按 **externalId**
覆盖的热修页；传入 `Release/validate`。内禀规则从不 flagged。**禁止**调用 releases
`autoValidate(rel, {})`。

- 校验通过、相对 `Release/_live` 有 diff、覆盖清单空 → **自动 promote → mirror → prune**。
- 零变化（页面 `_diff` 为空且完整 PageSnapshot 与 Toc 均与 live 相等） → discard draft，job completed `outcome=skipped`，live 不动。
- 阻断校验 → job completed `outcome=held`，Release 留 draft + report，live 不动。
- 将覆盖热修 → `flaggedForApproval`；确认前线上保持热修版。
- 非法包 / 未知格式：适配 errors 和 info 保存到作业 report；POST **已经 202**；job completed `outcome=invalid_bundle`；Release discard。
  **不是**这次 POST 的 422（入站阶段失败、job 未建的除外）。
- 对象存储 / DB 瞬态：job `retrying`，Release **保持 draft**，不得标 held、不得 discard。
- 重试耗尽：job `failed` / `dependency_failed`，draft 保留，人工 discard。

pageId 映射：`Release/_lastOf(kind=import)` 快照 `(externalId → pageId)`；无 last import 则回退当前 `Release/_live`。
命中 → edit / rename / 附件 / 进版标记；未命中 → `Page/create`（预分配 id + 初始正文/SEO/属性，一次写入 revision=1）+ `Space/place`；
快照有、bundle 无 → `Page/trash`。slug 变了调用 `Space/reslug`（无管理面 HTTP）。format 变更 →
该页阻断错误，不重建 id。属性经 `Page/replaceProperties` 整体校验并替换，失败回滚同一导入事务；
已相同的属性不重复写入。不把 `externalId` 升进 Page 概念。不导入标签。

```text
sync continuousImport
// implementation: ContinuousImportUseCase#continuousImport
when {
  Requesting/import: [tenant: ?tenant; space: ?space; zip|uploadKey|url: ?source] => [request: ?request]
}
where {
  ResourceChain.space: [tenant: ?tenant; space: ?space]
  guard: [chain: [?tenant, ?space]; op: publish]
  Space/_status: [space: ?space] => [status: active]
  Space/_mode: [space: ?space] => [mode: synced]
}
then {
  流式写入对象存储并算 sha256（url 先经 RemoteZipFetcher 拉取）
  Release/draft: [scope: ?space; source: {kind: import; ref: zipSha256; actor: ?actor}] => [rel: ?rel]
  入队 import 作业（url 记入 payload.sourceUrl）
  Requesting/respond: [request: ?request; job: ?job; release: ?rel]
}
// 指纹 = spaceId+zipSha256；url 来源指纹 = spaceId+url（拉取发生在幂等动作内，同键重放不再下载）；同键同指纹重放同一 202
// url来源在幂等首次执行内取得import/Space锁后预检import_blocked/import_in_progress，下载期间持锁，
// 并发的第二个受理立刻 409 import_in_progress——任何被拒绝的受理都不产生出流量
// 远端正文中途断流 → 422 import_source_unreachable(read_failed)，不是 500
// 202 在受理事务提交后立即返回，worker 异步跑 inspect→mirror
// uploadKey 不在对象存储 → 404 resource_not_found；对象存储不可用 → 503；二者都不建 job
// url 不可达 → 422 import_source_unreachable；url 非 https/私网/跳数超限 → 422 import_source_forbidden；
// 拉到非 zip → 4xx invalid_bundle；超 100 MiB → 422 file_too_large；均不建 job

mediator branch importModeRejected
when {
  Requesting/import: [tenant: ?tenant; space: ?space; zip|uploadKey|url: ?source] => [request: ?request]
}
where {
  Space/_mode: [space: ?space] 不是 synced（含 authored）
}
then {
  Requesting/respond: [request: ?request; error: SpaceModeRestricted]
  不建 job、不建 Release
}

mediator branch importBlocked
when {
  Requesting/import: [tenant: ?tenant; space: ?space; zip|uploadKey|url: ?source] => [request: ?request]
}
where {
  存在 flagged 且未 discard 的 import Release
}
then {
  Requesting/respond: [request: ?request; error: ImportBlocked]
  不建新 job、不建新 Release
}

mediator branch importInProgress
when {
  Requesting/import: [tenant: ?tenant; space: ?space; zip|uploadKey|url: ?source] => [request: ?request]
}
where {
  本空间已有未终态作业（queued/running/retrying）且非同键重放
}
then {
  Requesting/respond: [request: ?request; error: ImportInProgress]
  不建新 job
}

sync startImportUpload
// implementation: StartImportUploadUseCase#startImportUpload
when {
  Requesting/startImportUpload: [tenant: ?tenant; space: ?space] => [request: ?request]
}
where {
  ResourceChain.space: [tenant: ?tenant; space: ?space]
  guard: [chain: [?tenant, ?space]; op: publish]
  Space/_status: [space: ?space] => [status: active]
  Space/_mode: [space: ?space] => [mode: synced]
}
then {
  预签名 PUT（15min）
  Requesting/respond: [request: ?request; putUrl: ?putUrl; expiresAt: ?expiresAt; uploadKey: ?uploadKey]
}
// 非 synced → 409 space_mode_restricted（与 importModeRejected 同码）
// 对象存储不可用 → 503

sync viewImportJob
// implementation: ViewImportJobUseCase#viewImportJob
when {
  Requesting/viewImportJob: [tenant: ?tenant; space: ?space; jobId: ?jobId] => [request: ?request]
}
where {
  ResourceChain.space: [tenant: ?tenant; space: ?space]
  guard: [chain: [?tenant, ?space]; op: read]
}
then {
  返回该 import 作业投影；不存在或不属本空间 → 404 import_job_not_found
}

sync viewDrift
// implementation: ViewDriftUseCase#viewDrift
when {
  Requesting/viewDrift: [tenant: ?tenant; space: ?space] => [request: ?request]
}
where {
  ResourceChain.space: [tenant: ?tenant; space: ?space]
  guard: [chain: [?tenant, ?space]; op: read]
}
then {
  看板 = Release/_live vs Release/_lastOf: [scope: ?space; kind: import]
  尚无 import → driftCount=0
}

sync listPreviewPages
// implementation: ListPreviewPagesUseCase#listPreviewPages
when {
  Requesting/listPreviewPages: [tenant: ?tenant; space: ?space; releaseId: ?releaseId] => [request: ?request]
}
where {
  ResourceChain.space: [tenant: ?tenant; space: ?space]
  guard: [chain: [?tenant, ?space]; op: publish]
  Release/_scopeOf: [rel: ?releaseId] => [scope: ?space]
  Release/_status: [rel: ?releaseId] => [status: draft | flagged | validated | archived]
}
then {
  Release/_pagesOf: [rel: ?releaseId] => [pages: ?pages]
  Requesting/respond: [request: ?request; pages: ?pages]
}
// 只返回快照页面标题与地址供选择；空快照返回空列表，权限与状态边界同 previewRelease。

sync previewRelease
// implementation: PreviewReleaseUseCase#previewRelease
when {
  Requesting/previewRelease: [tenant: ?tenant; space: ?space; releaseId: ?releaseId; slug: ?slug] => [request: ?request]
}
where {
  ResourceChain.space: [tenant: ?tenant; space: ?space]
  guard: [chain: [?tenant, ?space]; op: publish]
  Release/_scopeOf: [rel: ?releaseId] => [scope: ?space]
  Release/_status: [rel: ?releaseId] => [status: draft | flagged | validated | archived]
}
then {
  sanitizer 自快照渲染 HTML
  Requesting/respond: [request: ?request; html: ?html; title: ?title; slug: ?slug; format: ?format]
}
// slug 不在快照 → 404；不是公开 serve；不新增 GET …/report

mediator branch flaggedForApproval
when {
  Release/validate: [rel: ?rel; coverageWarnings: ?coverage] => [warnings: ?report]
}
where {
  rel 的 source.kind=import
}
then {
  Release 进入 flagged
  job completed outcome=flagged
  Release/_live 不变
}

sync approveRelease
// implementation: ApproveReleaseUseCase#approveRelease
when {
  Requesting/approve: [tenant: ?tenant; space: ?space; releaseId: ?releaseId] => [request: ?request]
}
where {
  ResourceChain.space: [tenant: ?tenant; space: ?space]
  guard: [chain: [?tenant, ?space]; op: publish]
  Space/_status: [space: ?space] => [status: active]
  Release/_scopeOf: [rel: ?releaseId] => [scope: ?space]
  Release/_status: [rel: ?releaseId] => [status: flagged]
  rel 的 source.kind=import
  否则 409 release_not_flagged
}
then {
  Release/approve: [rel: ?releaseId] => [rel: ?rel]
  promoteOnApprove
  mirrorWorkingSetOnImport
}
// 同事务内联：approve → promote+prune → mirror；指纹 = releaseId+flagged；200 {outcome:promoted, release}
// 原键重放先返回已保存响应，只有首次执行才检查 flagged；晋升前捕获最近已晋升 import 的页面集合，
// mirror 的 trash = 旧集合 - 当前包集合，不能在晋升后重新查询这个旧基线。

sync promoteOnApprove
// implementation: PromoteOnApprove#promoteOnApprove
when {
  Release/approve: [rel: ?rel] => [rel: ?rel]
}
where {
  Release/_scopeOf: [rel: ?rel] => [scope: ?space]
  Space/_status: [space: ?space] => [status: active]
}
then {
  Release/promote: [rel: ?rel]
  Release/prune: [scope: ?space]
}

mediator branch mirrorWorkingSetOnImport
when {
  本导入 worker 完成或 approveRelease 接力中的 Release/promote: [rel: ?rel] 成功
}
where {
  Release/_scopeOf: [rel: ?rel] => [scope: ?space]
  rel 的 source.kind=import
  Space/_status: [space: ?space] => [status: active]
  Space/_mode: [space: ?space] => [mode: synced]
}
then {
  Page/create（预分配 id）/ Page/edit / Page/rename / Page/attach / Page/detach / Page/publish / Page/trash
  Space/reslug
  Toc/replace
  Revision/record: [author: system]
}
// 不导入标签；热修 build 的 promote 不匹配本 sync（不跑 mirror）
// worker 路径：promote → mirror → prune；approve 路径：approve → promote → prune → mirror
// prune 与 mirror 同事务，互不依赖对方产物
```

归档空间导入 → 409 `space_archived`。synced 空间级权限投影含 `import`，flagged import 条目
含 `approve`+`discard`，**无** `build`。热修页只 `edit`（见 pageediting）。

排除动作：`reindexOnPromote`、webhook 投递、通用 `/ops/jobs`。
`planned` 不是 sync。

远程响应头后停止发送正文也受同一总截止时间保护；到期主动关闭读取流并归还出流量额度，返回timeout，不会无限占用四个并发槽。

所有入站来源遵守幂等记录→import互斥锁→Space行锁→source-object锁的顺序。
上传/预上传对象先只读到临时文件并计算指纹，进入幂等首次执行后再保留对象、起草和入队；远程来源按URL指纹进入同一锁序后才拉取。
这样原键重放不重复存储，新键竞争返回import_in_progress，不会在相同ZIP的对象锁与空间锁之间互等。

## ADR-0023 恢复增量

远程受理的业务预检在幂等首次执行范围内、下载之前完成：同键重放即使有后续导入正在运行，
仍返回原202且不下载；新键须先获得空间互斥锁、复核active/synced与无待处理导入/审批。

受理与删除共享5秒上限空间锁并锁后重验状态。后台周期扫描已提交的queued/retrying及崩溃遗留running；执行事务用PG advisory try-lock作为数据库连接所有权租约，连接终止即释放。进度在独立租户事务可见；attempt单调递增，失败回调按attempt CAS且不得改写终态。阻断、非法包与系统故障维持既有outcome区分。共享源对象由上传预留与事务锁保护。

解析异常的迟到收尾与业务执行共用空间 advisory lock，重新检查 running 状态及 attempt；仅匹配当前尝试时在同一事务丢弃草稿并完成 invalid_bundle。失去锁或已被恢复/删除的旧回调无副作用。

恢复发现缺失releaseId/zipKey的不完整作业记录时，标为failed/unexpected_error并发出不含载荷的告警，不在running中无限循环；重试入口不能重排缺失恢复信息的记录。

导出回环比较：正文 diff 之外，skip 还要求 PageSnapshot 全部元数据（标题、slug、format、SEO、icon、properties、externalId、附件、顺序）及 Toc 完全相同。只改变元数据仍 promote/mirror；不把附件/图标更新误当正文未变而丢弃。


规范资源路径：adapted page.slug 是完整相对文件路径；装载、晋升及镜像均保留这一值。contentPath 仅定位包载荷。Toc 使用稳定 externalId/pageId 引用，不从其标签推导地址。Bundle 的 txt 原文不抽取 frontmatter 或改写相对引用；路径和内容一起进入不可变 Release。

### 受理前置组合的实现规则

以下两条规则集中远程与上传来源共有的锁和复检策略；只在幂等首次执行内运行。
内部 owner 由空间锁内读取；不是请求方提供的事实。已完成幂等请求重放不调用这两条规则。

```text
guard lockImportableSpace
when {
  Requesting/continuousImport: [tenant: ?tenant; space: ?space; firstExecution: true]
}
then {
  ImportJob/tryAdvisoryLock: [space: ?space] => [acquired: ?acquired]
  // 未取得锁立即拒绝 ImportInProgress；取得锁后锁定并读取该租户空间，再执行 requireImportable
}

guard requireImportable
when {
  Requesting/continuousImport: [space: ?space; lockedOwner: ?owner; firstExecution: true]
}
where {
  ?owner.status = ACTIVE
  ?owner.mode = SYNCED
  Drift/hasFlaggedImport: [space: ?space] => [flagged: false]
  ImportJob/hasUnfinished: [space: ?space] => [unfinished: false]
}
then {
  // 允许当前锁内空间进入存储、起草与入队；不释放空间事务锁
}
```

前置拒绝顺序保持为 active → synced → 无待审批导入 → 无未终结作业，分别使用
SpaceArchived、SpaceModeRestricted、ImportBlocked、ImportInProgress；数据库及依赖故障向上传播。
对象落库后入队的复核仍先检查未终结作业，再取得有界空间锁，再按相同前置顺序确认状态。
格式校验后的 flagged 完成与工作区镜像由 BundleImportJobRunner 直接调用实际拥有者，
上文的同名 mediator branch 记录该阶段的行为，不再要求入口维护纯转发方法。

## 2026-10-22 可查询作业终态

ImportJob 的 status/outcome/phase 使用当前 wire 值的枚举合同；terminal 仅当 status=completed/failed，successful 仅当 completed 且 outcome=promoted/skipped。completed+held/flagged/invalid_bundle 表示处理结束但业务目标仍受阻，不得当成成功。failed+dependency_failed 为依赖重试耗尽。successful 也不代表站点交付或搜索已就绪。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `ApproveReleaseUseCase.approveRelease` | `credential: String, tenant: UUID, space: UUID, releaseId: UUID, key: String` | `FlowResponse<BundleImportTypes.ApproveResult>` |
| `ContinuousImportUseCase.continuousImport` | `credential: String, tenant: UUID, space: UUID, source: BundleImportTypes.ImportSource, key: String` | `FlowResponse<BundleImportTypes.ImportAccepted>` |
| `ListPreviewPagesUseCase.listPreviewPages` | `credential: String, tenant: UUID, space: UUID, releaseId: UUID` | `List<BundleImportTypes.PreviewPage>` |
| `PreviewReleaseUseCase.previewRelease` | `credential: String, tenant: UUID, space: UUID, releaseId: UUID, slug: String` | `BundleImportTypes.SnapshotPreview` |
| `PromoteOnApprove.promoteOnApprove` | `binding: BundleImportSignals.PromoteOnApprove` | `void` |
| `StartImportUploadUseCase.startImportUpload` | `credential: String, tenant: UUID, space: UUID` | `BundleImportTypes.ImportUpload` |
| `ViewDriftUseCase.viewDrift` | `credential: String, tenant: UUID, space: UUID` | `BundleImportTypes.DriftBoard` |
| `ViewImportJobUseCase.viewImportJob` | `credential: String, tenant: UUID, space: UUID, jobId: UUID` | `BundleImportTypes.JobView` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `BundleImportSignals.PromoteOnApprove` | `rel: ReleaseApi.ReleaseId, completion: RuleCompletion<Void>` |
| `BundleImportTypes.ApproveResult` | `outcome: String, release: ReleaseTypes.ReleaseDetail` |
| `BundleImportTypes.DriftBoard` | `driftCount: int, items: List<BundleImportTypes.DriftItem>` |
| `BundleImportTypes.DriftItem` | `pageId: UUID, slug: String, title: String, externalId: String` |
| `BundleImportTypes.ImportAccepted` | `job: BundleImportTypes.JobView, release: ReleaseTypes.ReleaseDetail` |
| `BundleImportTypes.ImportIssue` | `code: String, path: String, detail: String` |
| `BundleImportTypes.ImportReport` | `errors: List<BundleImportTypes.ImportIssue>, info: List<BundleImportTypes.ImportIssue>` |
| `BundleImportTypes.ImportSource.RemoteZip` | `url: String` |
| `BundleImportTypes.ImportSource.StoredUpload` | `uploadKey: String` |
| `BundleImportTypes.ImportSource.ZipStream` | `body: InputStream, declaredSize: long` |
| `BundleImportTypes.ImportSource` | `BundleImportTypes.ImportSource.RemoteZip / BundleImportTypes.ImportSource.StoredUpload / BundleImportTypes.ImportSource.ZipStream` |
| `BundleImportTypes.ImportUpload` | `putUrl: String, expiresAt: Instant, uploadKey: String` |
| `BundleImportTypes.JobView` | `id: UUID, status: String, phase: String, progressDone: Integer, progressTotal: Integer, attempt: int, nextRunAt: Instant, traceId: String, outcome: String, releaseId: UUID, sourceUrl: String, adapterId: String, report: BundleImportTypes.ImportReport` |
| `BundleImportTypes.PreviewPage` | `slug: String, title: String` |
| `BundleImportTypes.SnapshotPreview` | `html: String, title: String, slug: String, format: String, content: String, contentType: String, versionRef: String, interpretation: Map<String, Object>, contentTypeDefinition: ContentTypeSnapshot` |

<!-- interface-contract:end -->

导入 ZIP 的下载流与临时文件由同一资源作用域管理：文件创建、复制或解包失败均关闭流并清理文件；清理故障仅记录，不覆盖原始故障分类或已完成作业结果。

## 2026-10-18 内容解释配置

format 保留五种源码语法。contentType 与 interpretation(schema/catalogId/protocolVersion) 是正文解释配置，和正文在同一基线、同一事务保存并记录修订；省略配置保持已有值。取回修订同时取回正文及解释配置。工作稿允许无效的专用类型内容；发版校验是服务端权威，json-schema 与 a2ui 的无效内容不得晋升，包括整体导入、API 与热修。普通 json 继续保留任意源码。解释配置冻结进 Bundle、Release 与 SiteSnapshot，并参与渲染/检索指纹。专用类型的错误报告包含有限字段路径和稳定校验码，外部 schema 引用不发网络请求。


## Implementation policy ownership

`ImportEligibility` owns `lockImportableSpace`, `requireImportable`. These names denote entry policy, refusal translation, or a read projection. They do not create completion events or persist rule identities. Protected effects retain the original transaction, lock, and tenant scope.


## Native completion protocol

`BundleImportRelay` publishes the bindings in `BundleImportSignals` synchronously at the corresponding call-completion or entry-continuation point. Each binding carries a unique occurrence and the current root flow. It is local execution data, not a second business state. Receiving rules claim their occurrence before effects and record one response. Equal-valued later requests use distinct occurrences; another flow cannot supply this binding. A missing response fails explicitly.

These continuations use the existing synchronous Java transaction and Spring event publisher. Receiving listeners must remain synchronous: no `@Async`, after-commit listener, durable replay, or independent transaction is added. Failures propagate to the caller and retain the original rollback/refusal policy. Persistent asynchronous delivery continues through the existing outboxes.

The native implementation retains the documented ordered transactional synchronization dialect. The typed binding is emitted only at the declared request/result branch; it does not join arbitrary historical concept events.

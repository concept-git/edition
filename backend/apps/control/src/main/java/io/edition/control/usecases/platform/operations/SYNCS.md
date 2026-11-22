# syncs: 运维证据与恢复

ADR-0023。租户根admin看本租户审计，平台仅看平台审计；空间admin看其作业列表，publish可重试。平台可看全局最小作业元数据，不返回客户正文、zip键、载荷或秘密。

```text
sync listAudit
// implementation: ListAuditUseCase#listAudit
when {
  Requesting/listAudit: [tenant: ?tenant; filter: ?filter; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  // tenant admin 看本租户；无 tenant 只平台记录
  ?tenant 非空 ⇒ TenantAccess: [tenant: ?tenant; principal: ?actor]
                 guard: [chain: [?tenant]; op: admin]
  ?tenant 空 ⇒ PlatformOperatorGuard.require
}
then {
  Requesting/respond: [request: ?request]
}

sync listJobs
// implementation: ListJobsUseCase#listJobs
when {
  Requesting/listJobs: [tenant: ?tenant; space: ?space; status: ?status; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  ?tenant 非空 ⇒ TenantAccess: [tenant: ?tenant; principal: ?actor]
                 ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
                 guard: [chain: [?tenant, ?space]; op: admin]
  ?tenant 空 ⇒ PlatformOperatorGuard.require
}
then {
  Requesting/respond: [request: ?request]
  // import 作业最小投影与 allowedActions；租户作用域附 total，平台全局跨租户拼接不给 total
}

sync retryJob
// implementation: RetryJobUseCase#retryJob
when {
  Requesting/retryJob: [tenant: ?tenant; job: ?job] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
  guard: [chain: [?tenant, ?space]; op: publish]
  Space/_status: [space: ?space] => [status: active]
  Space/_mode: [space: ?space] => [mode: synced]
  Release/_live: [scope: ?space] => [rel: ?rel]
  // draft 仍在、failed 且不是 resource_deleted、无其他未完成导入
}
then {
  ImportJob.retry: [job: ?job]
  Operations.retry: [job: ?job]
}

sync purgeTrash
// implementation: PurgeTrashUseCase#purgeTrash
when {
  Requesting/purgeTrash: [tenant: ?tenant] => [request: ?request]
}
where {
  PlatformOperatorGuard.require
}
then {
  purgeExpired
  Operations.purge
}
```

错误继承真实资源404、权限403、space_archived/space_mode_restricted/resource_busy409、查询游标invalid_cursor400。依赖故障不伪装空集合。

```text
sync capabilities
// implementation: CapabilitiesUseCase#capabilities
when {
  Requesting/operationsCapabilities: [tenant: ?tenant] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  Permission/_filter: [chains: Space/_listByTenant ∪ Site/_listByTenant; subject: ?actor; op: admin] => [managed: ?choices]
}
then {
  Requesting/respond: [request: ?request; managed: ?choices]
}
```

```text
sync exportAudit
// implementation: ExportAuditUseCase#exportAudit
when {
  Requesting/exportAudit: [tenant: ?tenant; filters: ?filters] => [request: ?request]
}
where {
  ?tenant 非空 ⇒ TenantAccess: [tenant: ?tenant; principal: ?actor]
                 guard: [chain: [?tenant]; op: admin]
  ?tenant 空 ⇒ PlatformOperatorGuard.require
}
then {
  Audit.export: [tenant: ?tenant; filters: ?filters]
  Requesting/respond: [request: ?request]
}

sync viewAuditExport
// implementation: ViewAuditExportUseCase#viewAuditExport
when {
  Requesting/viewAuditExport: [tenant: ?tenant; id: ?id] => [request: ?request]
}
where {
  // 同查询审计权限，记录真实归属且未过 1 小时
  ?tenant 非空 ⇒ TenantAccess: [tenant: ?tenant; principal: ?actor]
                 guard: [chain: [?tenant]; op: admin]
  ?tenant 空 ⇒ PlatformOperatorGuard.require
}
then {
  Requesting/respond: [request: ?request]
}

sync downloadAuditExport
// implementation: DownloadAuditExportUseCase#downloadAuditExport
when {
  Requesting/downloadAuditExport: [tenant: ?tenant; id: ?id] => [request: ?request]
}
where {
  // 重新判权、记录归属、completed 且未过期
  ?tenant 非空 ⇒ TenantAccess: [tenant: ?tenant; principal: ?actor]
                 guard: [chain: [?tenant]; op: admin]
  ?tenant 空 ⇒ PlatformOperatorGuard.require
}
then {
  Requesting/stream: [request: ?request]
}
```

后台导出在repeatable-read快照中按固定截止点扫描全部过滤结果；流式CSV防公式注入；逐批续租、完成回执CAS；User.erase使尚可下载的导出失效，迟到worker不能恢复。

retryJob 的 platform=true 路径只允许平台运营员，授权恢复持久作业但不返回客户载荷；普通路径要求当前空间 publish。两者都抢占同一空间锁，忙时拒绝，不无界等待；删除、非活动空间和非draft发版不可重试。

```
sync storageUsage
// implementation: StorageUsageUseCase#storageUsage
when {
  Requesting/storageUsage: [] => [request: ?request]
}
where {
  PlatformOperatorGuard.require
}
then {
  Requesting/respond: [request: ?request]
}
```
物理容量属于平台全局基础设施，不按租户重复归属，不等同逻辑内容量；源对象桶与管理数据库分别列示，不包含交付副本和搜索索引。首次盘点未完成为未知，带采样时间。

```
sync retryStorage
// implementation: RetryStorageUseCase#retryStorage
when {
  Requesting/retryStorage: [] => [request: ?request]
}
where {
  PlatformOperatorGuard.require
}
then {
  ObjectReservations.resetFailedBudget
  Operations.retry
}
```
只重排已耗尽失败预算的对象，仍走原引用/租约保护，不立即删除。涵盖没有业务删除记录的上传回滚孤儿对象。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `CapabilitiesUseCase.capabilities` | `credential: String, tenant: UUID` | `OperationsTypes.Capabilities` |
| `DownloadAuditExportUseCase.downloadAuditExport` | `credential: String, tenant: UUID, id: UUID` | `OperationsTypes.ExportContent` |
| `ExportAuditUseCase.exportAudit` | `credential: String, tenant: UUID, filter: OperationsTypes.AuditFilter, key: String` | `FlowResponse<OperationsTypes.ExportStatus>` |
| `ListAuditUseCase.listAudit` | `credential: String, tenant: UUID, filter: OperationsTypes.AuditFilter, limit: int` | `OperationsTypes.AuditPage` |
| `ListJobsUseCase.listJobs` | `credential: String, tenant: UUID, space: UUID, status: String, cursor: UUID, limit: int` | `OperationsTypes.JobPage` |
| `PurgeTrashUseCase.purgeTrash` | `credential: String, tenant: UUID, key: String` | `FlowResponse<TerminationTypes.PurgeReport>` |
| `RetryJobUseCase.retryJob` | `credential: String, tenant: UUID, id: UUID, key: String, platform: boolean` | `void` |
| `RetryStorageUseCase.retryStorage` | `credential: String, key: String` | `FlowResponse<OperationsTypes.StorageRetry>` |
| `StorageUsageUseCase.storageUsage` | `credential: String` | `OperationsTypes.StorageUsage` |
| `ViewAuditExportUseCase.viewAuditExport` | `credential: String, tenant: UUID, id: UUID` | `OperationsTypes.ExportStatus` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `OperationsTypes.AuditFilter` | `actor: UUID, action: String, target: UUID, outcome: String, from: Instant, to: Instant, cursor: Long` |
| `OperationsTypes.AuditItem` | `id: long, eventId: UUID, rootId: UUID, time: Instant, kind: String, actorType: String, actorId: UUID, actorName: String, action: String, targetType: String, targetId: UUID, outcome: String, ip: String, requestId: String, credentialId: UUID` |
| `OperationsTypes.AuditPage` | `items: List<OperationsTypes.AuditItem>, nextCursor: Long, total: Long` |
| `OperationsTypes.Capabilities` | `audit: boolean, webhooks: boolean, tenantStats: boolean, spaces: List<OperationsTypes.Choice>, sites: List<OperationsTypes.Choice>` |
| `OperationsTypes.Choice` | `id: UUID, name: String` |
| `OperationsTypes.ExportContent` | `stream: InputStream, filename: String` |
| `OperationsTypes.ExportStatus` | `id: UUID, status: String, error: String, expiresAt: Instant` |
| `OperationsTypes.JobPage` | `items: List<OperationsTypes.Job>, nextCursor: UUID, total: Long` |
| `OperationsTypes.Job` | `id: UUID, tenantId: UUID, spaceId: UUID, type: String, status: String, phase: String, done: Integer, total: Integer, attempt: int, nextRunAt: Instant, outcome: String, traceId: String, allowedActions: Set<String>` |
| `OperationsTypes.StorageRetry` | `retriedObjects: int` |
| `OperationsTypes.StorageUsage` | `sourceObjects: Long, sourceBytes: Long, measuredAt: Instant, databaseBytes: long, failedSourceObjects: long` |

<!-- interface-contract:end -->

## 管理凭据能力约束

`allowedActions` 是当前资源授权、业务状态、PAT task scope 与租户边界的交集。会话保持原有能力；PAT 的读取范围不隐含写入、发布或权限管理范围。管理 scope catalog 与网关及生成命令契约共用。预演只读观察不锁定执行，写入仍重新校验授权、ETag 与业务前置条件。

# flow: portable Bundle export

新导出包的 `generator` 为 `space`，标识生成平台；Bundle v1 格式不变。

```text
sync requestExport
// implementation: RequestExportUseCase#requestExport
when {
  Requesting/export: [tenant: ?tenant; space: ?space; release: ?release] => [request: ?request]
}
where {
  ResourceChain.space: [tenant: ?tenant; space: ?space]
  当前空间 publish 且包内每页按当前真实归属 read
  Release/_scopeOf: [rel: ?release] => [scope: ?space]
  Release/_status: [rel: ?release] => [status: live | archived]
}
then {
  取得共享 space-termination lock，复核来源与权限
  幂等捕获选定不可变内容与元数据
  Release/pin: [rel: ?release; reservation: ?id; until: ?until]
  保护附件
  入队 RLS export 作业
  Requesting/respond: [request: ?request; job: ?job]
}

sync viewExport
// implementation: ViewExportUseCase#viewExport
when {
  Requesting/viewExport: [tenant: ?tenant; space: ?space; id: ?id] => [request: ?request]
}
where {
  ResourceChain.space: [tenant: ?tenant; space: ?space]
  当前空间 publish 且 task 属于本 space
}
then {
  返回 state、retry count、expiry 与脱敏 failure trace，不含正文或 storage keys
}

sync listExports
// implementation: ListExportsUseCase#listExports
when {
  Requesting/listExports: [tenant: ?tenant; space: ?space; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  ResourceChain.space: [tenant: ?tenant; space: ?space]
  当前空间 publish
}
then {
  返回键集分页的 task 元数据
}

sync retryExport
// implementation: RetryExportUseCase#retryExport
when {
  Requesting/retryExport: [tenant: ?tenant; space: ?space; id: ?id] => [request: ?request]
}
where {
  ResourceChain.space: [tenant: ?tenant; space: ?space]
  当前空间 publish 且已捕获各页按当前归属 read
  task 仍保留且未过期
}
then {
  幂等重排队同一失败快照；active/completed 任务不重置预算
}

sync downloadExport
// implementation: DownloadExportUseCase#downloadExport
when {
  Requesting/downloadExport: [tenant: ?tenant; space: ?space; id: ?id] => [request: ?request]
}
where {
  完整且未过期的 task
  当前空间 publish
  历史包内每页有确认的当前归属且当前 read
}
then {
  保护并流式输出完整 ZIP，no-store
  从不返回可复用的预签名 URL 以绕过再鉴权
}
```

## Boundaries and failure semantics

Historical page checks use current placements, including transfers into another space. Any unresolved owner, explicit none, restriction miss or token binding miss rejects the entire export. Legacy JSON uses the same `BundleExportAccess`. Draft/flagged/validated releases cannot be exported.

Release retention and export pins share a scope lock. Pins preserve the selected snapshot and source dependencies through the configurable file lifetime (24 hours by default, at most seven days). The worker serializes a deterministic Bundle v1 manifest/content/attachment ZIP, verifies source bytes against checksums and publishes only the complete object. ZIPs respect the existing import limits (500 MiB archive, 2 MiB manifest/content, 10 MiB attachment). Content, TOC, SEO, properties, icon and externalId are retained; no working drafts, revision history, ACL, site configuration or Tag expansion is added.

Two-minute reclaimable leases, heartbeat and token-fenced completion allow restart recovery. Dependency failures retry the original intent at most eight times; permanent source/format failures remain failed. Failed temporary files are removed and never exposed. Explicit retry preserves job identity; expired exports require a new request, a still-retained source release and fresh authorization. Expiry/space termination release export references so source/ZIP GC may proceed. Already-started downloads cannot be recalled.

Errors: permission_denied, release_not_found, export_not_found, export_not_ready (409), export_expired (410), invalid_cursor; dependency failures preserve task identity and expose a trace identifier.

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `DownloadExportUseCase.downloadExport` | `credential: String, tenant: UUID, space: UUID, id: UUID` | `BundleExportTypes.Download` |
| `ListExportsUseCase.listExports` | `credential: String, tenant: UUID, space: UUID, release: UUID, cursor: String, limit: int` | `BundleExportTypes.Jobs` |
| `RequestExportUseCase.requestExport` | `credential: String, tenant: UUID, space: UUID, release: UUID, key: String` | `FlowResponse<BundleExportTypes.Job>` |
| `RetryExportUseCase.retryExport` | `credential: String, tenant: UUID, space: UUID, id: UUID, key: String` | `FlowResponse<BundleExportTypes.Job>` |
| `ViewExportUseCase.viewExport` | `credential: String, tenant: UUID, space: UUID, id: UUID` | `BundleExportTypes.Job` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `BundleExportTypes.Download` | `stream: InputStream, bytes: long, sha256: String, filename: String` |
| `BundleExportTypes.Job` | `id: UUID, releaseId: UUID, status: String, attempts: int, error: String, traceId: String, createdAt: Instant, expiresAt: Instant, bytes: Long` |
| `BundleExportTypes.Jobs` | `items: List<BundleExportTypes.Job>, nextCursor: String` |

<!-- interface-contract:end -->

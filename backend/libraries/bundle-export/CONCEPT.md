# concept BundleExport

## purpose

让已捕获的内容快照能够可靠地导出为完整的 Bundle v1 ZIP。

## state

jobs: ExportId -> (tenant: TenantId, space: SpaceId, release: ReleaseId, snapshot: ExportSnapshot, status: Status, attempts: Nat, lease: lone Token, expiresAt: Time, outputKey: lone Key)

初态为空。snapshot 一经 enqueue 不变；租约与尝试有界；只有完整序列化的 ZIP 可成为 outputKey。

## actions

enqueue [id: ExportId; tenant: TenantId; space: SpaceId; release: ReleaseId; snapshot: ExportSnapshot; expiresAt: Time; trace: String] => [view: View]
  ensures 保存一条不可变导出意图
claim [id: ExportId] => [lease: optional Lease]
  ensures 仅可处理作业取得租约；不可领取返回 empty
heartbeat [lease: Lease] => [renewed: Bool]
  ensures 仅当前租约可续期
complete [lease: Lease; output: Key; bytes: Long] => []
  ensures 仅当前租约可发布完整对象
fail [lease: Lease; error: String; retry: Bool] => []
  ensures 仅当前租约记录失败，自动尝试不超过八次
retry [space: SpaceId; id: ExportId] => [accepted: Bool]
  ensures 可恢复时沿用原 id 与 snapshot
outputMissing [space: SpaceId; id: ExportId; expectedKey: Key] => []
  ensures 仅匹配预期对象键时标记缺失
terminateSpace [space: SpaceId] => []
  ensures 取消该空间意图
expire [] => []
  ensures 释放到期意图的源和产物引用
write [snapshot: ExportSnapshot; output: OutputStream; attachments: Attachments] => []
  requires 路径、校验和及附件均有效；ensures 写完整 Bundle v1 ZIP；拒绝冲突、缺失或不匹配输入
  附件保留规范资源相对路径，不要求 attachments/ 前缀

## operational principle

after enqueue [id: i; tenant: t; space: s; release: r; snapshot: x; expiresAt: e; trace: tr] => [view: v]
then claim [id: i] => [lease: l]，write [snapshot: x; output: o; attachments: a] => []，complete [lease: l; output: k; bytes: n] => []；
可查询的产物只含 x 的完整内容，失败重试仍使用 x。

## queries

find [space: SpaceId; id: ExportId] => [stored: optional Stored]
view [space: SpaceId; id: ExportId] => [view: optional View]
list [space: SpaceId; release: ReleaseId; cursor: String; limit: Int] => [page: Page]
pending [limit: Int] => [items: seq Pending]
referencesObject [key: Key] => [referenced: Bool]

## notes

平台类概念；与产品概念采用相同规格形式。以下保留实现边界与运维约束。

Platform concept owning durable export intentions, bounded leases, private artifact metadata and pure Bundle v1 ZIP serialization. Only sync composes Release/Space/Permission with object I/O; gateway sees sync views and authenticated streams. Payloads are RLS tenant scoped and never appear in operational list responses.

`Snapshot` is a passive captured input. Serializer reads content and verified attachment streams, writes a deterministic complete ZIP, never fetches external URLs, and rejects path collisions/checksum mismatches. Failed files are not published. Jobs retry the same captured input at most eight times; explicit retry retains job identity. Expiry releases source and artifact references. Space termination cancels intentions.

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `BundleExportJobs.claim` | `id: UUID` | `Optional<BundleExportJobs.Lease>` |
| `BundleExportJobs.complete` | `lease: BundleExportJobs.Lease, output: String, bytes: long` | `void` |
| `BundleExportJobs.enqueue` | `id: UUID, tenant: UUID, space: UUID, release: UUID, snapshot: ExportSnapshot, expiresAt: Instant, trace: String` | `BundleExportJobs.View` |
| `BundleExportJobs.expire` | `` | `void` |
| `BundleExportJobs.fail` | `lease: BundleExportJobs.Lease, error: String, retry: boolean` | `void` |
| `BundleExportJobs.find` | `space: UUID, id: UUID` | `Optional<BundleExportJobs.Stored>` |
| `BundleExportJobs.heartbeat` | `lease: BundleExportJobs.Lease` | `boolean` |
| `BundleExportJobs.list` | `space: UUID, release: UUID, cursor: String, limit: int` | `BundleExportJobs.Page` |
| `BundleExportJobs.outputMissing` | `space: UUID, id: UUID, expectedKey: String` | `void` |
| `BundleExportJobs.pending` | `limit: int` | `List<BundleExportJobs.Pending>` |
| `BundleExportJobs.referencesObject` | `key: String` | `boolean` |
| `BundleExportJobs.retry` | `space: UUID, id: UUID` | `boolean` |
| `BundleExportJobs.terminateSpace` | `space: UUID` | `void` |
| `BundleExportJobs.view` | `space: UUID, id: UUID` | `Optional<BundleExportJobs.View>` |
| `BundleZipWriter.write` | `snapshot: ExportSnapshot, output: OutputStream, attachments: BundleZipWriter.Attachments, heartbeat: Runnable` | `void` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `BundleExportJobs.Lease` | `id: UUID, tenant: UUID, token: UUID, attempts: int, snapshot: ExportSnapshot, expiresAt: Instant` |
| `BundleExportJobs.Page` | `items: List<BundleExportJobs.View>, nextCursor: String` |
| `BundleExportJobs.Pending` | `tenant: UUID, id: UUID` |
| `BundleExportJobs.Stored` | `view: BundleExportJobs.View, pageIds: Set<UUID>, outputKey: String` |
| `BundleExportJobs.View` | `id: UUID, spaceId: UUID, releaseId: UUID, status: String, attempts: int, error: String, traceId: String, createdAt: Instant, expiresAt: Instant, bytes: Long` |

<!-- interface-contract:end -->

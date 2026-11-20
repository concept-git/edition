# concept DeletionRecovery

## purpose

让业务资源终结后的回收过程可追踪、可重试，且重复触发不产生第二条记录。

## state

deletions: TargetId -> lone (tenant: TenantId, resourceType: String, actor: ActorId, objects: set Key, sites: set SiteId, status: Status, error: lone Code)

初态为空。状态为 queued/running/retrying/failed/completed；同 target 的重放沿用原记录。记录不保存已删除资源名称或正文。

## actions

deleted [tenant: TenantId; type: String; target: TargetId; actor: ActorId; objects: set Key; sites: set SiteId] => [deletion: Deletion]
  ensures 建立或返回 target 的唯一回收记录
finish [target: TargetId; status: String; error: String] => []
  ensures 保存终态或重试状态与有限错误码
retry [target: TargetId] => []
  ensures 重排原失败记录，不新建记录

## operational principle

after deleted [tenant: t; type: k; target: x; actor: a; objects: o; sites: s] => [deletion: d]
then finish [target: x; status: completed; error: null] => []；再次 deleted 使用同一 d，运营者可按 x 查询回收结果。

## queries

deletion [target: TargetId] => [deletion: optional Deletion]
deletions [before: TargetId; limit: Int] => [deletions: seq Deletion]

## notes

平台类概念；与产品概念采用相同规格形式。以下保留实现边界与运维约束。

`DeletionRecoveryApi.boundLockWait/lockSpace` 是数据库锁机制，用于回收与导入互斥，不是 DeletionRecovery 的独立动作；`databaseBytes` 已归 ServiceHealth 查询。

拥有 shared.deletion_records，记录业务资源终结后的回收状态、相关站点和候选对象。不保存已删除资源名称/正文。只由sync调用；gateway不可见。原子锁与import同键，等待5秒上限。状态queued/running/retrying/failed/completed，失败保留稳定code；重放不创建第二记录。对象GC必须经sync核对全租户工作区、发版、交付意图引用。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `DeletionRecoveryApi.boundLockWait` | `` | `void` |
| `DeletionRecoveryApi.deleted` | `tenant: UUID, type: String, target: UUID, actor: UUID, objects: Set<String>, sites: Set<UUID>` | `DeletionRecoveryApi.Deletion` |
| `DeletionRecoveryApi.deletion` | `target: UUID` | `Optional<DeletionRecoveryApi.Deletion>` |
| `DeletionRecoveryApi.deletions` | `before: UUID, limit: int` | `List<DeletionRecoveryApi.Deletion>` |
| `DeletionRecoveryApi.finish` | `target: UUID, status: String, error: String` | `void` |
| `DeletionRecoveryApi.lockSpace` | `space: UUID` | `void` |
| `DeletionRecoveryApi.retry` | `target: UUID` | `void` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `DeletionRecoveryApi.Deletion` | `id: UUID, tenantId: UUID, resourceType: String, resourceId: UUID, actorId: UUID, status: String, error: String, objects: Set<String>, sites: Set<UUID>, createdAt: Instant` |

<!-- interface-contract:end -->

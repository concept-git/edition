# syncs: 终结与受保护清除

ADR-0023。所有决定性级联在一个管理事务内，交付安全屏障在提交前；对象回收记录同事务保存。无权隐藏，有权但前置不足禁用。强制Idempotency-Key与confirmationName；重放在已认证租户准入后、资源存在检查前，删除后仍可重放原回执。

```text
sync deleteSpace
// implementation: DeleteSpaceUseCase#deleteSpace
when {
  Requesting/deleteSpace: [tenant: ?tenant; space: ?space; confirmationName: ?name] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
  guard: [chain: [?tenant, ?space]; op: admin]
  import 共同锁等待 ≤ 5s
  Space/_status: [space: ?space] => [status: archived]
  Space/_view: [space: ?space] => [name: ?name]
}
then {
  Site/unmount: [site: ?site; slug: ?slug]
  ImportJob/terminateSpace: [space: ?space]
  ApiToken/revoke: [token: ?token]
  Permission/clearPrincipal: [principal: ?token]
  Redirect/retire: [scope: ?site; path: ?path]
  Toc/replace: [toc: ?space; tree: []]
  Release/terminateScope: [scope: ?space]
  Revision/prune: [item: ?page; keep: 0]
  Tag/_labelsOf: [item: ?page] => [labels: ?labels]
  Tag/untag: [item: ?page; label: ?label] // 逐项清除 labels
  Permission/clearResource: [resource: ?page]
  Space/unplace: [item: ?page]
  Page/terminate: [page: ?page]
  Collection/unplace: [item: ?space]
  Permission/clearResource: [resource: ?space]
  Space/delete: [space: ?space]
  // 保存删除记录
}

sync deleteSite
// implementation: DeleteSiteUseCase#deleteSite
when {
  Requesting/deleteSite: [tenant: ?tenant; site: ?site; confirmationName: ?name] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
  guard: [chain: [?tenant, ?site]; op: admin]
  Site/_view: [site: ?site] => [mounts: []; name: ?name]
}
then {
  CustomDomain/unbind: [host: ?host]
  Redirect/retire: [scope: ?site; path: ?path]
  Permission/clearResource: [resource: ?site]
  Search/terminateScope: [scope: ?site]
  Site/delete: [actor: ?actor; site: ?site]
  // 保存删除记录
}

sync purgeExpired
// implementation: PurgeExpiredUseCase#purgeExpired
when {
  Scheduler/tick: [] => [tenant: ?tenant]
}
where {
  Page/_expired: [before: now − 30d; after: ?after; limit: 100] => [pages: ?candidates]
  逐空间/页加锁；无保留发版或交付意图引用
}
then {
  Toc/_entriesFor: [target: ?page] => [entries: ?entries]
  Toc/remove: [entry: ?entry]
  Revision/prune: [item: ?page; keep: 0]
  Tag/_labelsOf: [item: ?page] => [labels: ?labels]
  Tag/untag: [item: ?page; label: ?label] // 逐项清除 labels
  Permission/clearResource: [resource: ?page]
  Space/unplace: [item: ?page]
  Page/purge: [page: ?page; retention: 30d]
  // 记录候选对象
}

sync listDeletions
// implementation: ListDeletionsUseCase#listDeletions
when {
  Requesting/listDeletions: [tenant: ?tenant; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  tenant admin 看全部、原操作者只看自己的
}
then {
  Requesting/respond: [request: ?request; items: ?deletions]
  // 不要求源资源仍存在
}

sync retryDeletion
// implementation: RetryDeletionUseCase#retryDeletion
when {
  Requesting/retryDeletion: [tenant: ?tenant; target: ?target] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  与 listDeletions 相同可见性；记录 status ∈ {failed, retrying}
}
then {
  // 重试原记录及相关站点交付意图，不创建第二份删除事实
}
```

错误：space_not_archived / site_not_empty / deletion_confirmation_invalid / resource_busy 为409；不存在或错租户404；无权403；瞬态依赖503/504，不伪造成功。purge不绕过保留期；业务资源已终结不意味着对象清理完成。

所有跨概念清理由各概念动作执行，外键只阻止悬空引用，不通过 CASCADE 改写另一概念。
Tag 逐项清理、Search 排序配置清理均与资源删除同事务；任一步失败整体回滚。
Page/purge 若拒绝候选，前序清理也必须回滚。Search 配置清理发生在 Site/delete 前；读侧索引撤销与回收由交付终结意图驱动。

回收对象自动删除最多8次有界退避，耗尽使记录失败；retryDeletion恢复该记录对象的失败预算，引用保护与保留期不变。

锁超时的SQL异常先穿过tenant作用域清理，再在终结flow边界映射busy；不得在作用域内部转成业务异常后继续对已aborted事务执行GUC恢复SQL。

前端以已确认响应为操作完成边界；后续列表刷新或导航失败单独恢复，不重发已成功的变更。资源删除后保持完成状态，再返回列表。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `DeleteSiteUseCase.deleteSite` | `credential: String, tenant: UUID, site: UUID, name: String, key: String` | `FlowResponse<TerminationTypes.Deletion>` |
| `DeleteSpaceUseCase.deleteSpace` | `credential: String, tenant: UUID, space: UUID, name: String, key: String` | `FlowResponse<TerminationTypes.Deletion>` |
| `ListDeletionsUseCase.listDeletions` | `credential: String, tenant: UUID, before: UUID, limit: int` | `TerminationTypes.DeletionPage` |
| `PlanSiteTerminationUseCase.planSiteTermination` | `credential: String, tenant: UUID, site: UUID, name: String` | `TerminationTypes.TerminationPlan` |
| `PlanSpaceTerminationUseCase.planSpaceTermination` | `credential: String, tenant: UUID, space: UUID, name: String` | `TerminationTypes.TerminationPlan` |
| `PurgeExpiredUseCase.purgeExpired` | `tenant: UUID` | `TerminationTypes.PurgeReport` |
| `RetryDeletionUseCase.retryDeletion` | `credential: String, tenant: UUID, target: UUID, key: String` | `void` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `TerminationTypes.DeletionPage` | `items: List<TerminationTypes.Deletion>, nextCursor: UUID` |
| `TerminationTypes.Deletion` | `id: UUID, resourceType: String, resourceId: UUID, status: String, error: String, createdAt: Instant` |
| `TerminationTypes.PurgeReport` | `scanned: int, purged: int, protectedCount: int` |
| `TerminationTypes.TerminationPlan` | `resourceType: String, resourceId: UUID, validationLevel: String, observedAt: Instant, counts: Map<String, Long>, effects: List<String>, unknowns: List<String>` |

<!-- interface-contract:end -->

## 只读终结预演

```text
sync planSpaceTermination
// implementation: PlanSpaceTerminationUseCase#planSpaceTermination
when {
  Requesting/planSpaceTermination: [tenant: ?tenant; space: ?space; confirmationName: ?name] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  guard: [chain: [?tenant, ?space]; op: admin]
  Space/_view: [space: ?space] => [status: archived; name: ?name]
}
then {
  Requesting/respond: [request: ?request; plan: ?plan]
}

sync planSiteTermination
// implementation: PlanSiteTerminationUseCase#planSiteTermination
when {
  Requesting/planSiteTermination: [tenant: ?tenant; site: ?site; confirmationName: ?name] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  guard: [chain: [?tenant, ?site]; op: admin]
  Site/_view: [site: ?site] => [mounts: []; name: ?name]
}
then {
  Requesting/respond: [request: ?request; plan: ?plan]
}
```

预演与执行复用 TerminalResources 的名称、资源归属、archived/empty 前置判定；不加业务写锁、不变更业务数据或任务。响应提供明确级联类别、当前页/挂载/域名计数与观察时间，`server-validated` 仅覆盖声明的终结前置。预演不保留事务或授权；执行加锁后重新验证。管理 scope 与删除一致：content:write / hosting:write。

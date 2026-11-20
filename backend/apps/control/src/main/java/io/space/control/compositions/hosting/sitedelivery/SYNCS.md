# syncs: 独立站点交付

```
event publication triggers (synchronous helpers)
 when 站点、已验证域名、挂载、地址或主版本变更
 then 提交时按站点捕获 delivery.completed；同一事务生效，可见性由主库安全视图判定

sync deliveryStatus
// implementation: DeliveryStatusUseCase#deliveryStatus
when {
  Requesting/deliveryStatus: [tenant: ?tenant; site: ?site] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
  guard: [chain: [?tenant, ?site]; op: read]
}
then {
  Requesting/respond: [request: ?request]
  // desired 与 current 同次读取当前主版本；已核验域名决定 current.readable
  // terminal/successful 只表示正文交付；搜索索引独立报告。当前版本与访问规则在事务提交时一并生效
  // readerHref 由已核验域名和部署 scheme/port 生成，不信任请求 Host
  // 稳定错误码及按 site admin 计算的 canRetry；不得暴露实现异常类名
}

sync retryDelivery
// implementation: RetryDeliveryUseCase#retryDelivery
when {
  Requesting/retryDelivery: [tenant: ?tenant; site: ?site] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
  guard: [chain: [?tenant, ?site]; op: admin]
}
then {
  publication_v1.retry_search: [site: ?site]
}
```

删除事件携带删除前归属。内容回滚选择同版 Release 路径和 TOC，域名、挂载和授权读取当前事实。
附件使用空间内路径，Reader 文件路径和阅读地址的空间内部分一致。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `DeliveryStatusUseCase.deliveryStatus` | `credential: String, tenant: UUID, site: UUID` | `SiteDeliveryTypes.Status` |
| `RetryDeliveryUseCase.retryDelivery` | `credential: String, tenant: UUID, site: UUID, key: String` | `void` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `SiteDeliveryTypes.Current` | `epoch: long, primaryHost: String, readerHref: String, spaces: List<SiteDeliveryTypes.OnlineSpace>, readable: boolean, searchStatus: String` |
| `SiteDeliveryTypes.Desired` | `epoch: long, spaces: List<SiteDeliveryTypes.OnlineSpace>` |
| `SiteDeliveryTypes.OnlineSpace` | `spaceId: UUID, slug: String, releaseId: UUID, readerHref: String` |
| `SiteDeliveryTypes.State` | `disabled / queued / running / retrying / failed / completed / access_pending` |
| `SiteDeliveryTypes.Status` | `enabled: boolean, status: SiteDeliveryTypes.State, targetEpoch: long, onlineEpoch: Long, primaryHost: String, spaces: List<SiteDeliveryTypes.OnlineSpace>, error: String, canRetry: boolean, searchStatus: String, desired: SiteDeliveryTypes.Desired, current: SiteDeliveryTypes.Current, terminal: boolean, successful: boolean, nextPollAfterSeconds: int` |

<!-- interface-contract:end -->

管理 PAT 的 `canRetry` 还须具有 hosting:write；只读凭据不能展示重试能力。

CLI 等待固定显式目标 epoch 或首次读取的目标。超过时间/次数预算返回未完成；目标被替代时明确 superseded，不能跟随最新版本后宣称原目标已完成。`nextPollAfterSeconds` 是建议间隔，终态为 0；搜索可仍在更新。
`current.readable` 仅表示当前站点具有已核验的主域；读者请求仍核对当前权限和已发布版本。等待成功不替代指定读者身份的实际 URL 验证，也不证明匿名权限。

共享主库默认拓扑中，交付状态读取当前站点、已验证域名、live Release 和独立搜索作业。内容与权限在提交时已可读取，索引按当前来源键单独报告，重试只重新排队失败的搜索作业。

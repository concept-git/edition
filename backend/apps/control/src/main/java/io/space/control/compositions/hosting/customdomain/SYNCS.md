# syncs: 域名管理

目的：站点 admin 绑定自定义域名、凭 TXT 核验所有权、设主域名、解绑。
`_resolve` 供 ask 与后续 serve 使用。TLS 证书、读者面 HTML、非主域名 301 不在本 flow。

入口：`Requesting.bindDomain / viewDomain / verifyDomain / setPrimaryDomain / unbindDomain /
listDomains / allowDomain`。

共同前置：

- Session User 必须是当前 Tenant member；TOKEN 一律 403。
- bind/verify/setPrimary/unbind 与带 token 的 GET 详情为 `[tenant, site]/admin`。
  站点投影 `domains[]`（无 token）仍随站点详情给 `[tenant, site]/read`；
  租户级 `listDomains` 只列可读站点的域名，同样不含 token。
- host 必须属于该站 `_hostsOf`（含未核验），否则 404 `domain_not_found`。
- 路径 tenant 与站点不符 → 404 `site_not_found`。
- 变更经 ADR-0016 执行器。

```text
sync bindDomain
// implementation: BindDomainUseCase#bindDomain
when {
  Requesting/bindDomain: [tenant: ?tenant; site: ?site; host: ?host] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
  guard: [chain: [?tenant, ?site]; op: admin]
}
then {
  // 惰性回收该 host 上过期未核验行
  CustomDomain/bind: [host: ?host; target: ?site] => [domain: ?domain]
}

mediator branch bindTaken
when {
  Requesting/bindDomain: [tenant: ?tenant; site: ?site; host: ?host] => [request: ?request]
  CustomDomain/bind: [host: ?host; target: ?site] => [error: Taken]
}
then {
  Requesting/respond: [request: ?request; error: DomainTaken]
}

sync viewDomain
// implementation: ViewDomainUseCase#viewDomain
when {
  Requesting/viewDomain: [tenant: ?tenant; site: ?site; host: ?host] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
  guard: [chain: [?tenant, ?site]; op: admin]
  CustomDomain/_activeHostsOf: [target: ?site] => [hosts: ?hosts]
  ?host ∈ ?hosts
}
then {
  Requesting/respond: [request: ?request; host: ?host; verified: ?verified; isPrimary: ?primary; dnsToken: ?token]
}

sync verifyDomain
// implementation: VerifyDomainUseCase#verifyDomain
when {
  Requesting/verifyDomain: [tenant: ?tenant; site: ?site; host: ?host] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
  guard: [chain: [?tenant, ?site]; op: admin]
  CustomDomain/_activeHostsOf: [target: ?site] => [hosts: ?hosts]
  ?host ∈ ?hosts
}
then {
  // 已 verified 则幂等成功；否则查 TXT `_space-challenge.<host>`
  CustomDomain/verify: [host: ?host; dnsToken: ?token] => [domain: ?domain]
  // 该站尚无主域名则 CustomDomain/setPrimary
  CustomDomain/_primaryOf: [target: ?site] => []
  CustomDomain/setPrimary: [host: ?host]
}

mediator branch verifyFailed
when {
  Requesting/verifyDomain: [tenant: ?tenant; site: ?site; host: ?host] => [request: ?request]
}
where {
  // 权威答案已取得但证明不成立
}
then {
  Requesting/respond: [request: ?request; error: NotProven]
}

sync setPrimaryDomain
// implementation: SetPrimaryDomainUseCase#setPrimaryDomain
when {
  Requesting/setPrimaryDomain: [tenant: ?tenant; site: ?site; host: ?host] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
  guard: [chain: [?tenant, ?site]; op: admin]
  CustomDomain/_activeHostsOf: [target: ?site] => [hosts: ?hosts]
  ?host ∈ ?hosts
}
then {
  CustomDomain/setPrimary: [host: ?host]
}

sync unbindDomain
// implementation: UnbindDomainUseCase#unbindDomain
when {
  Requesting/unbindDomain: [tenant: ?tenant; site: ?site; host: ?host] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
  guard: [chain: [?tenant, ?site]; op: admin]
  // 主域名且仍有其他已核验 host → 409 domain_is_primary
}
then {
  CustomDomain/unbind: [host: ?host]
}

sync listDomains
// implementation: ListDomainsUseCase#listDomains
when {
  Requesting/listDomains: [tenant: ?tenant; site: ?site; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  Site/_listByTenant: [tenant: ?tenant] => [sites: ?sites]
  Permission/_filter: [chains: 各 [?tenant, ?site]; subject: ?actor; op: read] => [sites: ?readable]
  // site? 再过滤；范围为空则空页（不 404 探测）
}
then {
  CustomDomain/_page: [targets: ?readable; cursor: ?cursor; limit: ?limit] => [hosts: ?hosts; nextCursor: ?next]
  Requesting/respond: [request: ?request; items: ?hosts; nextCursor: ?next; total: null]
}

sync allowDomain
// implementation: AllowDomainUseCase#allowDomain
when {
  Requesting/allowDomain: [host: ?host] => [request: ?request]
}
then {
  CustomDomain/_resolve: [host: ?host] => [target: ?site]
  Requesting/respond: [request: ?request]
}
```

错误与调用方行动：

| 条件 | HTTP / code |
| --- | --- |
| 站点不存在或路径 tenant 错配 | 404 `site_not_found` |
| 存在但 guard 拒绝；TOKEN 写域名 | 403 `permission_denied` |
| host 非法 | 422 `validation_failed`（host） |
| 全局已被占用（含未过期的未核验） | 409 `domain_taken` |
| host 不属于该站或已过期当不存在 | 404 `domain_not_found` |
| TXT 权威答案不符 | 422 `not_proven` |
| 对未核验 setPrimary | 409 `domain_not_verified` |
| 另有已核验时解绑主域名 | 409 `domain_is_primary` |
| DNS 超时 | 504 `dependency_timeout` |
| DNS 不可用 | 503 `dependency_unavailable` |
| 同键异请求 | 409 `idempotency_key_reused` |

未核验 TTL 默认 72h，惰性回收；同站 TTL 内重 bind 幂等且 token 不变。
ask 无用户会话；可选共享密钥。本 flow 不投递证书、不写 `/ops/jobs`。

资源关联写入与终结共享实体行锁；锁后重新确认资源存在与状态，顺序为Space先于Page/Site，避免晚到授权、挂载或域名绑定在删除后恢复。

前端以已确认响应为操作完成边界；后续列表刷新或导航失败单独恢复，不重发已成功的变更。域名绑定后继续 DNS 核验。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `AllowDomainUseCase.allowDomain` | `host: String` | `boolean` |
| `BindDomainUseCase.bindDomain` | `credential: String, tenant: UUID, site: UUID, host: String, key: String` | `FlowResponse<CustomDomainTypes.DomainDetail>` |
| `ListDomainsUseCase.listDomains` | `credential: String, tenant: UUID, site: Optional<UUID>, cursor: String, limit: int` | `CustomDomainTypes.TenantDomainPage` |
| `SetPrimaryDomainUseCase.setPrimaryDomain` | `credential: String, tenant: UUID, site: UUID, host: String, key: String` | `FlowResponse<CustomDomainTypes.DomainDetail>` |
| `UnbindDomainUseCase.unbindDomain` | `credential: String, tenant: UUID, site: UUID, host: String, key: String` | `void` |
| `VerifyDomainUseCase.verifyDomain` | `credential: String, tenant: UUID, site: UUID, host: String, key: String` | `FlowResponse<CustomDomainTypes.DomainDetail>` |
| `ViewDomainUseCase.viewDomain` | `credential: String, tenant: UUID, site: UUID, host: String` | `CustomDomainTypes.DomainDetail` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `CustomDomainTypes.DomainAction` | `BIND / UPDATE` |
| `CustomDomainTypes.DomainDetail` | `host: String, verified: boolean, isPrimary: boolean, dnsToken: String, txtName: String, txtValue: String` |
| `CustomDomainTypes.DomainSiteChoice` | `id: UUID, name: String, allowedActions: Set<CustomDomainTypes.DomainAction>` |
| `CustomDomainTypes.TenantDomainPage` | `items: List<CustomDomainTypes.TenantDomainSummary>, nextCursor: String, total: Long, sites: List<CustomDomainTypes.DomainSiteChoice>` |
| `CustomDomainTypes.TenantDomainSummary` | `host: String, verified: boolean, isPrimary: boolean, createdAt: Instant, siteId: UUID, siteName: String, allowedActions: Set<CustomDomainTypes.DomainAction>` |

<!-- interface-contract:end -->


## Implementation policy ownership

`DomainFailures` owns `bindTaken`, `verifyFailed`. These names denote entry policy, refusal translation, or a read projection. They do not create completion events or persist rule identities. Protected effects retain the original transaction, lock, and tenant scope.

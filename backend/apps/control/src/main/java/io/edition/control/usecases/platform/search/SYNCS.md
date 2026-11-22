# syncs: 检索配置与重建

```
sync searchConfiguration
// implementation: SearchConfigurationUseCase#searchConfiguration
when {
  Requesting/searchConfiguration: [tenant: ?tenant; site: ?site] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
  guard: [chain: [?tenant, ?site]; op: admin]
}
then {
  Search/_configuredBoost: [scope: ?site] => [fields: ?fields; revision: ?revision]
}

sync configureSearch
// implementation: ConfigureSearchUseCase#configureSearch
when {
  Requesting/configureSearch: [tenant: ?tenant; site: ?site; fields: ?fields] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
  guard: [chain: [?tenant, ?site]; op: admin]
  ?fields = permutation(title, headings, body)
}
then {
  Search/configureBoost: [scope: ?site; fields: ?fields] => [fields: ?fields; revision: ?revision]
  // atomic with audit + delivery outbox
}

sync reindexSearch
// implementation: ReindexSearchUseCase#reindexSearch
when {
  Requesting/reindexSearch: [tenant: ?tenant; site: ?site] => [request: ?request]
}
where {
  PlatformOperatorGuard.require
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
}
then {
  Search/_configuredBoost: [scope: ?site] => [fields: ?fields]
  Search/configureBoost: [scope: ?site; fields: ?fields] => [fields: ?fields; revision: ?revision]
  // atomic with audit + delivery outbox
}
```
字段顺序/配置 revision 为 Search 概念唯一持有的期望状态，202 只表示持久受理。组合层把配置写入交付 outbox；独立工作器按 revision 强制重建，完成前继续服务旧索引。Control 不持有索引、搜索引擎客户端或构建状态；在线索引状态只从交付读模型查询。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `ConfigureSearchUseCase.configureSearch` | `credential: String, tenant: UUID, site: UUID, fields: List<String>, key: String` | `FlowResponse<SearchTypes.Configuration>` |
| `ReindexSearchUseCase.reindexSearch` | `credential: String, tenant: UUID, site: UUID, key: String` | `FlowResponse<SearchTypes.Configuration>` |
| `SearchConfigurationUseCase.searchConfiguration` | `credential: String, tenant: UUID, site: UUID` | `SearchTypes.Configuration` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `SearchTypes.Configuration` | `fields: List<String>, revision: long` |

<!-- interface-contract:end -->

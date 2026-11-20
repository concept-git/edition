# syncs: 统计与只读采集

```text
sync ingest
// implementation: IngestUseCase#ingest
when {
  Collector/telemetry: [key: ?key; events: ?events] => [request: ?request]
}
where {
  // 独立采集密钥、批次≤500、已知事件/合法时间
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
}
then {
  Telemetry.accept: [events: ?events]
}

sync tenantUsage
// implementation: TenantUsageUseCase#tenantUsage
when {
  Requesting/tenantUsage: [tenant: ?tenant; from: ?from; to: ?to] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  guard: [chain: [?tenant]; op: admin]
}
then {
  Requesting/respond: [request: ?request]
}

sync spaceUsage
// implementation: SpaceUsageUseCase#spaceUsage
when {
  Requesting/spaceUsage: [tenant: ?tenant; space: ?space; from: ?from; to: ?to] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
  guard: [chain: [?tenant, ?space]; op: admin]
}
then {
  Requesting/respond: [request: ?request]
}

sync traffic
// implementation: TrafficUseCase#traffic
when {
  Requesting/traffic: [tenant: ?tenant; site: ?site; from: ?from; to: ?to; granularity: ?granularity] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
  guard: [chain: [?tenant, ?site]; op: admin]
  // UTC 日界，day 或 hour；小时最多 31 天
}
then {
  Requesting/respond: [request: ?request]
}

sync search
// implementation: SearchUseCase#search
when {
  Requesting/search: [tenant: ?tenant; site: ?site; from: ?from; to: ?to] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
  guard: [chain: [?tenant, ?site]; op: admin]
}
then {
  Requesting/respond: [request: ?request]
}
```

Reader只有非阻塞日志队列，collector另持采集密钥；遥测不把管理服务加入阅读请求依赖。默认近30个UTC日，最多366天；无采集数据不伪造0。PV包含200与条件304的正文GET，不计HEAD/附件/静态/跳转。搜索/可观测/点击按searchId稳定ID去重，Proof限定站点/会话/结果路径/15分钟；无JS搜索只进总数，不进入可观测CTR分母。

统计请求的时间区间、粒度和采集事件格式非法返回 `validation_failed`，不归类为程序故障；最大区间按精确时长366天，小时粒度最多31天。

原始流量/搜索事件保留30天；允许的较长查询区间只表达已保留的观测记录，health.partial与retainedFrom明确历史缺口，UI不画成完整零流量历史。活动投影保留366天。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `IngestUseCase.ingest` | `credential: String, events: List<TelemetryEvent>` | `StatisticsTypes.Accepted` |
| `SearchUseCase.search` | `credential: String, tenant: UUID, site: UUID, from: Instant, to: Instant` | `StatisticsTypes.Search` |
| `SpaceUsageUseCase.spaceUsage` | `credential: String, tenant: UUID, space: UUID, from: Instant, to: Instant` | `StatisticsTypes.Usage` |
| `TenantUsageUseCase.tenantUsage` | `credential: String, tenant: UUID, from: Instant, to: Instant` | `StatisticsTypes.Usage` |
| `TrafficUseCase.traffic` | `credential: String, tenant: UUID, site: UUID, from: Instant, to: Instant, granularity: String` | `StatisticsTypes.Traffic` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `StatisticsTypes.Accepted` | `accepted: int` |
| `StatisticsTypes.Bucket` | `time: Instant, pv: long, uv: long` |
| `StatisticsTypes.Health` | `status: String, updatedAt: Instant, lossDetected: boolean, staleSources: long, retainedFrom: Instant` |
| `StatisticsTypes.Range` | `from: Instant, to: Instant` |
| `StatisticsTypes.Ranked` | `label: String, count: long` |
| `StatisticsTypes.Search` | `searches: long, observable: long, clicked: long, clickRate: Double, popular: List<StatisticsTypes.Ranked>, zeroResults: List<StatisticsTypes.Ranked>, health: StatisticsTypes.Health` |
| `StatisticsTypes.Traffic` | `pv: long, series: List<StatisticsTypes.Bucket>, pages: List<StatisticsTypes.Ranked>, notFound: List<StatisticsTypes.Ranked>, referrers: List<StatisticsTypes.Ranked>, health: StatisticsTypes.Health` |
| `StatisticsTypes.Usage` | `workingPages: long, trashedPages: long, publishedPages: long, workingTextBytes: long, trashedTextBytes: long, attachmentCount: long, attachmentBytes: long, releases: long, snapshotPages: long, snapshotTextBytes: long, promotions: long, activeAuthors: long, imports: Map<String, Long>, computedAt: Instant` |

<!-- interface-contract:end -->

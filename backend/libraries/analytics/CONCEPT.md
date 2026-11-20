# concept Analytics

## purpose

让运营者从独立读侧事件中看到有缺口标记的访问与活动趋势。

## state

events: EventId -> TelemetryEvent
activity: seq ActivityEvent
collector: CollectorId -> (lastSeenAt: Time, dropped: Nat, gaps: Nat)

初态为空。相同 EventId 至多入库一次；原始流量/搜索事件与活动事件有不同保留截止时间。聚合不回写业务状态。无事件为 no_data，采集缺口和超出保留范围为 partial，不等同于完整的零流量。

## actions

ingest [events: seq TelemetryEvent] => []
  ensures 按 event id 去重并更新有限的流量、搜索、点击与采集健康事实；重复事件不重复计数

activity [tenant: TenantId; space: SpaceId; page: PageId; actor: ActorId; kind: String; time: Time] => []
  ensures 记录一项活动事实

retain [trafficBefore: Time; activityBefore: Time] => []
  ensures 分别删除两个截止时间之前的原始事件；不把已删除历史补成零

## operational principle

after ingest [events: e] => []
then traffic [site: s; from: a; to: b; granularity: g] => [traffic: t]
其中 t 同时显示已接收事件的计数和采集缺口，运营者能区分低流量与数据缺失。

## queries

usageActivity [space: SpaceId; from: Time; to: Time] => [usage: UsageActivity]
traffic [site: SiteId; from: Time; to: Time; granularity: String] => [traffic: Traffic]
search [site: SiteId; from: Time; to: Time] => [search: Search]
redirectHits [site: SiteId; from: Time] => [hits: Map<String, Long>]
  returns 只读派生聚合；Traffic/Search 携带 Health，保留范围不足时 Health.retainedFrom 非空

## notes

平台类概念；与产品概念采用相同规格形式。以下保留实现边界与运维约束。

独立reader通过有界非阻塞日志队列发版本化TelemetryEvent；独立collector持仅采集密钥，异步投递管理入口，reader不持管理凭据、不依赖管理可用性。接收去重id；搜索/点击按稳定searchId计数。保留原始事件30天；派生投影永不回写概念。IP仅参与按site+UTCday的HMAC估算，不保存原值。查询词限长与明显敏感格式过滤、来源仅域。心跳/丢弃计数/更新时间表达缺口。采集故障不伪装为零流量。已观测站点发生丢弃或采集缺口时，健康状态至少为 partial（来源仍延迟则为 delayed），不能同时声称 ready。

每日按租户作用域清理30天前原始流量/搜索事件，活动计数保留366天。查询区间超过原始保留范围时health为partial并返回retainedFrom，不能将缺失历史解释为0。

collector使用稳定身份发送独立心跳；文件轮转/截断导致可能未读取尾部时递增缺口标记，并持久保存于checkpoint。缺口不伪装为完整采集，也不把缺口次数当作精确丢失事件数。collector健康应用于全部站点，但没有站点事件仍为no_data。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `AnalyticsApi.activity` | `tenant: UUID, space: UUID, page: UUID, actor: UUID, kind: String, time: Instant` | `void` |
| `AnalyticsApi.ingest` | `events: List<TelemetryEvent>` | `void` |
| `AnalyticsApi.redirectHits` | `site: UUID, from: Instant` | `Map<String, Long>` |
| `AnalyticsApi.retain` | `trafficBefore: Instant, activityBefore: Instant` | `void` |
| `AnalyticsApi.search` | `site: UUID, from: Instant, to: Instant` | `AnalyticsApi.Search` |
| `AnalyticsApi.traffic` | `site: UUID, from: Instant, to: Instant, granularity: String` | `AnalyticsApi.Traffic` |
| `AnalyticsApi.usageActivity` | `space: UUID, from: Instant, to: Instant` | `AnalyticsApi.UsageActivity` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `AnalyticsApi.Bucket` | `time: Instant, pv: long, uv: long` |
| `AnalyticsApi.Health` | `status: String, updatedAt: Instant, lossDetected: boolean, staleSources: long, retainedFrom: Instant` |
| `AnalyticsApi.Ranked` | `label: String, count: long` |
| `AnalyticsApi.Search` | `searches: long, observable: long, clicked: long, clickRate: Double, popular: List<AnalyticsApi.Ranked>, zeroResults: List<AnalyticsApi.Ranked>, health: AnalyticsApi.Health` |
| `AnalyticsApi.Traffic` | `pv: long, series: List<AnalyticsApi.Bucket>, pages: List<AnalyticsApi.Ranked>, notFound: List<AnalyticsApi.Ranked>, referrers: List<AnalyticsApi.Ranked>, health: AnalyticsApi.Health` |
| `AnalyticsApi.UsageActivity` | `promotions: long, activeAuthors: long` |

<!-- interface-contract:end -->

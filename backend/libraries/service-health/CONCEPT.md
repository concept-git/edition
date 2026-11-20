# concept ServiceHealth

## purpose

让平台运营者看到进程、交付与数据库的当前运行状态，而不泄露租户载荷。

## state

heartbeats: (Service, Instance) -> lone (version: String, seenAt: Time, details: Map)

初态为空。每个进程实例只保留最近一次心跳。

## actions

beat [service: String; instance: String; version: String; details: Map<String, Object>] => []
  ensures 在独立短事务 upsert 一行心跳；失败仅影响观测，不回滚业务事务

## operational principle

after beat [service: s; instance: i; version: v; details: d] => []
then heartbeats [] 包含 s/i 的最近上报；运营组合可同时读取 搜索作业聚合识别积压。

## queries

heartbeats [] => [heartbeats: seq Heartbeat]
  returns 已知心跳按 seenAt 倒序
databaseBytes [] => [bytes: Long]
  returns 当前数据库占用字节数；数据库故障向上传播

## notes

平台类概念；与产品概念采用相同规格形式。以下保留实现边界与运维约束。

拥有 `shared.service_heartbeats`：管理进程与交付 worker 以
`(service, instance)` 为键定期 upsert 一行心跳，附版本与少量诊断细节（队列积压、最近失败数），
不含任何租户数据。心跳写入走独立短事务，失败只记日志，绝不影响业务事务。

只由 sync 调用；gateway 不可见。`space-index` 通过 `shared.record_service_heartbeat` SECURITY DEFINER
函数以数据库服务键 `space-worker` 写入（`delivery_writer` 只有 EXECUTE）。space-content 没有管理库凭据，
健康由管理面经各自 HTTP `/healthz` 探测。判定阈值属 flow（见 `syncs/platform/servicehealth/SYNCS.md`），本模块只存事实。

搜索作业积压与失败数由主库的只读聚合提供，应用组合将它与本概念的心跳合并。
这是此次边界审查发现并纠正的跨概念状态读取；HTTP 字段、SQL 函数、RLS 与故障传播保持原有行为。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `ServiceHealthApi.beat` | `service: String, instance: String, version: String, details: Map<String, Object>` | `void` |
| `ServiceHealthApi.databaseBytes` | `` | `long` |
| `ServiceHealthApi.heartbeats` | `` | `List<ServiceHealthApi.Heartbeat>` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `ServiceHealthApi.Heartbeat` | `service: String, instance: String, version: String, seenAt: Instant, details: Map<String, Object>` |

<!-- interface-contract:end -->

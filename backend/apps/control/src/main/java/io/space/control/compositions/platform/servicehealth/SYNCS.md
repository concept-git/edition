# flow: service health（服务状态）

平台运营员在「平台 · 服务状态」看三个进程的存活与滞后。心跳是事实，判定是 flow 规则：
距最近心跳 ≤ 60s 为 `normal`，60–180s 为 `lagging`，> 180s 为 `lost`，从未出现为 `unknown`；
Reader 使用只读凭据，管理面可选配置 HTTP 探测其 `/healthz`，未配置地址时为 `unconfigured`。
`Scheduler/tick` 是 Spring `@Scheduled` 每次调用的外部根动作；`job=serviceHeartbeat`
标识心跳轮询，不表示数据库写入已经成功。

```text
sync heartbeat
// implementation: HeartbeatOnSchedule#heartbeat
when {
  Scheduler/tick: [job: serviceHeartbeat] => [fired: true]
}
where {
  // 管理进程自身，无主体
  ?version = BuildProperties.version，未提供时为 dev
}
then {
  ServiceHealth/beat: [service: space-management; instance: hostname@pid; version: ?version; details: {}]
}

sync platformHealth
// implementation: PlatformHealthUseCase#platformHealth
when {
  Requesting/platformHealth: [] => [request: ?request]
}
where {
  PlatformOperatorGuard.require
  publication_v1.search_health: [] => [backlog: ?backlog; recentFailures: ?recentFailures]
  ServiceHealth/_heartbeats: [] => [heartbeats: ?heartbeats]
}
then {
  Requesting/respond: [request: ?request]
  // 按服务归并心跳，将数据库服务键 space-worker 映射为响应中的 space-index；附搜索作业积压与 24h 内失败数；
  // 两项投递数字由平台聚合入口跨租户统计，不读取租户明细，也不要求租户上下文；
  // Reader 以 2s 超时探测 /healthz；返回 checkedAt 与每服务 status / instances / details
}
```

错误：非运营员 403 `platform_operator_required`；依赖故障（管理库不可达）按 503 传播，不伪装为 `unknown`。
Reader 探测失败不是依赖故障，而是被观察的事实：记为 `lost`。仅 2xx 且 JSON 顶层 `status` 精确为 `UP` 才是正常；畸形响应记 `invalid_response`，I/O 失败记 `probe_failed`，不透出任意异常文本。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `HeartbeatOnSchedule.heartbeat` | `` | `void` |
| `PlatformHealthUseCase.platformHealth` | `credential: String` | `ServiceStatuses.HealthReport` |

| 类型 | 字段／封闭分支 |
| --- | --- |


<!-- interface-contract:end -->

# concept Session [Principal]

## purpose
让主体认证一次后，在一段时间内免于反复证明身份

## state
holder: Session -> Principal
expiry: Session -> Time
refreshHash: Session -> Hash
previousRefreshHash: Session -> lone Hash
rotatedAt: Session -> lone Time
device: Session -> (name: String, browser: String, os: String)
network: Session -> String
createdAt: Session -> Time
lastSeenAt: Session -> Time
endedAt: Session -> lone Time

Session 由本概念创建。初态集合为空。start 每次建立新身份，必有 holder/device/network/createdAt/lastSeenAt/expiry/refreshHash；previousRefreshHash/rotatedAt/endedAt 初始无绑定。
绝对期限 30 天，renew 不延长。相同设备描述可对应多条 Session。network 为调用方提供的近似网络文本，可为 unknown/loopback。

## actions
start [principal: Principal; device: Device; network: String] => [session: Session; access: Credential; refresh: Credential]
  ensures 创建新 Session；返回同一 Credentials 结构（含 tokenType=Bearer、expiresIn）

renew [refresh: Credential] => [session: Session; access: Credential; refresh: Credential]
  requires refresh 匹配当前或宽限内上一代 hash，且未结束、未过绝对期限
  ensures 原子轮换 refresh，不延长 expiry

renew [refresh: Credential] => [error: Invalid]
  requires 未知、已结束或更早已淘汰的 hash
  ensures 返回 Invalid；不改状态

renew [refresh: Credential] => [error: Expired]
  requires 已过绝对期限
  ensures 置 endedAt 并返回 Expired

renew [refresh: Credential] => [error: ConcurrentReuse]
  requires 上一代 hash 在 rotatedAt 后 10 秒宽限内再次出示
  ensures 返回 ConcurrentReuse；不改状态

renew [refresh: Credential] => [error: Replayed]
  requires 上一代 hash 超过宽限再次出示
  ensures 结束会话并返回 Replayed

end [session: Session; requester: Principal] => []
  requires requester 是该 session 的 holder
  ensures 结束该 session。不满足即空操作，不泄露他人 session 存在性

endByRefresh [refresh: Credential] => []
  ensures 出示凭据者即持有者；无匹配时幂等成功

endAll [principal: Principal] => []
  ensures 结束该主体全部 Session

eraseAll [principal: Principal] => []
  ensures 物理删除该主体的全部 Session（含 refresh hashes、设备与网络信息）；不存在时幂等成功

touch [session: Session] => []
  ensures 仅当距 lastSeenAt >= 5 分钟才更新 lastSeenAt，且不延长 expiry

## operational principle
after start [principal: p; device: d; network: n] => [session: s; access: a; refresh: r]
then 当 s 仍有效时 _principal [session: s] => [principal: p]
认证一次后凭 session 免于再证明身份

after end [session: s; requester: p] => []
then _principal [session: s] 为零行
主动结束即立刻失效

after endAll [principal: p] => []
then p 的所有 session 均无 principal
一处收束全部免认证状态

## queries
_principal [session: Session] => [principal: Principal]
  returns 仅当 session 未结束且未过绝对期限才有绑定；至多一行

_sessionOf [refresh: Credential] => [session: Session]
  returns 未结束且未过期、匹配当前或上一代 hash 的会话；无匹配为零行

_listOf [principal: Principal; cursor: String; limit: Int; currentSession: Session] => [sessions: seq View; nextCursor: String]
  returns 该主体有效会话，按 (lastSeenAt, id) 倒序，游标保留数据库时间完整精度，不能遗漏同一毫秒内的会话；current 标记当前会话

_snapshots [sessions: set Session] => [info: Session -> (holder: Principal, expiry: Time, active: Bool)]
  returns 已存在身份的只读批量投影，含结束/过期并派生 active；不存在的身份省略。不输出凭据散列、设备或联系信息

## credential revocation boundary
密码与会话由组合在同一主库事务更新。Session/endAll 的失败使凭据变更一同回滚；没有跨进程补偿意图或独立提交的撤销屏障。明确密码拒绝保留当前会话。升级时对旧跨进程撤销意图中的主体先结束会话，再退役意图表，避免解除旧屏障后恢复已撤销凭据。

## notes
access 实现为 RS256 JWT（10 分钟，含 sid/sub，不落库）；refresh 为 256-bit 随机值，仅 hash 落库。
每次 start 建立一条 Session，不按设备描述去重。refresh 只通过 Secure/HttpOnly/SameSite=Lax/Path=/auth cookie 运输。
绝对期限是概念常量而非 start 的入参；access 时效属实现层配置。
eraseAll 供注销路径使用，不是「免于再证明身份」本身。
end/endAll/eraseAll 及 renew 内的过期/重放终结都会发布完成事件；无权结束他人会话不得产生终结事件。
Java 模块不得依赖其他概念；Principal 是不透明实例化值。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `SessionApi.endAll` | `holder: SessionApi.HolderId` | `void` |
| `SessionApi.endByRefresh` | `refreshToken: String` | `void` |
| `SessionApi.end` | `session: SessionApi.SessionId, requester: SessionApi.HolderId` | `void` |
| `SessionApi.eraseAll` | `holder: SessionApi.HolderId` | `void` |
| `SessionApi.listOf` | `holder: SessionApi.HolderId, cursor: String, limit: int, current: SessionApi.SessionId` | `SessionApi.Page` |
| `SessionApi.principal` | `session: SessionApi.SessionId` | `Optional<SessionApi.HolderId>` |
| `SessionApi.renew` | `refreshToken: String` | `SessionApi.RenewResult` |
| `SessionApi.sessionOf` | `refreshToken: String` | `Optional<SessionApi.SessionId>` |
| `SessionApi.snapshots` | `sessions: Set<SessionApi.SessionId>` | `Map<SessionApi.SessionId, SessionApi.Info>` |
| `SessionApi.start` | `holder: SessionApi.HolderId, device: SessionApi.Device, approximateIp: String` | `SessionApi.StartResult` |
| `SessionApi.touch` | `session: SessionApi.SessionId` | `void` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `SessionApi.Credentials` | `session: SessionApi.SessionId, accessToken: String, refreshToken: String, tokenType: String, expiresIn: long` |
| `SessionApi.Device` | `name: String, browser: String, os: String` |
| `SessionApi.HolderId` | `value: UUID` |
| `SessionApi.Info` | `id: SessionApi.SessionId, holder: SessionApi.HolderId, expiresAt: Instant, active: boolean` |
| `SessionApi.Page` | `sessions: List<SessionApi.View>, nextCursor: String` |
| `SessionApi.RenewResult.Reason` | `INVALID / EXPIRED / CONCURRENT_REUSE / REPLAYED` |
| `SessionApi.RenewResult.Rejected` | `reason: SessionApi.RenewResult.Reason` |
| `SessionApi.RenewResult.Renewed` | `credentials: SessionApi.Credentials` |
| `SessionApi.RenewResult` | `SessionApi.RenewResult.Rejected / SessionApi.RenewResult.Renewed` |
| `SessionApi.SessionId` | `value: UUID` |
| `SessionApi.StartResult.Started` | `credentials: SessionApi.Credentials` |
| `SessionApi.StartResult` | `SessionApi.StartResult.Started` |
| `SessionApi.View` | `id: SessionApi.SessionId, device: SessionApi.Device, ipApproximate: String, createdAt: Instant, lastSeenAt: Instant, expiresAt: Instant, current: boolean` |

<!-- interface-contract:end -->

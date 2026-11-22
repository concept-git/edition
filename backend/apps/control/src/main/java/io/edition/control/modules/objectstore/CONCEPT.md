# concept ObjectStore

## purpose

让内容寻址对象可安全写入、读取与回收，且依赖故障不伪装成对象缺失。

## state

objects: Key -> Bytes
reservations: Key -> (protectedUntil: Time, failedAttempts: Nat, nextRetryAt: lone Time)
inventory: (cursor: lone Key, publishedStats: lone InventoryStats)

初态源桶可已有对象，但 reservations 与盘点统计可能为空。保护期内或仍有任一引用的对象不得回收；首次完整盘点前统计未知，不为零。

## actions

putIfAbsent [key: Key; bytes: Bytes; contentType: String] => []
putIfAbsent [key: Key; stream: InputStream; size: Long; contentType: String] => []
  ensures 同键已存在时跳过；流式入口不消费 stream。依赖故障抛 Unavailable
remove [key: Key] => []
  requires GC 已持对象锁并复查全部引用；ensures 删除物理对象
protect [key: Key] => []
  ensures 在写事务中建立保护期
observe [key: Key; modifiedAt: Time] => []
  ensures 为扫描发现的对象建立至少两小时保护
lock [key: Key] => []
  ensures 串行该对象的引用提交和回收裁决
collect [key: Key; referenced: BooleanSupplier; remove: Runnable] => [collected: Bool]
  ensures 在锁内复查保护和引用；仅安全时调用 remove
retry [keys: set Key] => []
retryFailed [] => [count: Int]
  ensures 重排失败对象，仍需重新执行保护与引用检查
scan [objects: ObjectStoreApi] => []
  ensures 分页扫描源桶并按失败预算清理候选
advanceInventory [after: Key] => []
  ensures 推进持久盘点游标；完整扫描结束后才公布统计

## operational principle

after putIfAbsent [key: k; bytes: b; contentType: c] => []，protect [key: k] => []
then open [key: k] => [stream: b]；仅当保护结束且引用检查为 false 时 collect [key: k; referenced: r; remove: d] => [collected: true]。

## queries

exists [key: Key] => [exists: Bool]
open [key: Key] => [stream: optional InputStream]
  returns 仅 NoSuchKey 为 empty；传输或拒绝抛 Unavailable，调用方关闭流
presignGet [key: Key; ttl: Duration; filename: String; contentType: String] => [url: PresignedGet]
presignPut [key: Key; ttl: Duration; contentType: String] => [url: PresignedPut]
inventory [after: Key; limit: Int] => [objects: seq StoredObject]
failedCount [] => [count: Long]
failed [keys: set Key] => [failed: Bool]
inventoryCursor [] => [cursor: String]
inventoryStats [] => [stats: InventoryStats]
candidates [limit: Int] => [keys: seq Key]

## notes

平台类概念；与产品概念采用相同规格形式。以下保留实现边界与运维约束。

本概念是MinIO（S3协议）的出口，提供内容寻址原语、对象预留和受保护回收。键由调用方按ADR-0008传入；业务归属由其他概念与组合层维护，预留和GC状态属于本概念。

- `putIfAbsent(key, bytes, contentType)`：同键幂等跳过。
- `putIfAbsent(key, stream, size, contentType)`：流式写入（导入发版包 / 边算 sha 边存）。同键已存在则
  跳过且不消费 stream。`size` 未知时传 `-1`；适配器对未知大小使用 SDK 要求的 ≥5 MiB 分片，已知大小
  则 `partSize = -1` 让 SDK 自算。
- `exists(key)`：键不存在为 false；传输失败抛 `Unavailable`。
- `open(key) → Optional<InputStream>`：键不存在返回 empty（sync 可据此 404 uploadKey）；传输/拒绝
  抛 `Unavailable`，不得把依赖故障降成 empty。调用方必须关闭流。
- `presignGet(key, ttl, filename, contentType)`：短时 GET；filename/contentType 落响应头。
- `presignPut(key, ttl, contentType)`：短时 PUT，供浏览器直传；不含 `response-content-disposition`。

对象存储不可用或超时以 `ObjectStoreApi.Unavailable` 显式传播：调用方（sync）必须让业务事务一并
回滚并映射为 503/504，不得降级为空结果、false 或伪成功（`docs/agents/failure-handling.md`）。
`open` 的 empty 只表示 NoSuchKey，不是依赖故障。

本模块不执行业务体积上限：附件单文件 10 MiB 仍是 Page 层不变量；导入发版包 500 MiB 是 syncs/gateway
入站限制。读写超时 30 分钟以覆盖大包传输；连接超时 5 秒。

配置：`io.edition.object-store.{endpoint, access-key, secret-key, bucket, presign-public-endpoint}`；
桶在部署侧预建（docker compose `minio-init`），模块启动时不自建桶。

ADR-0023：SourceObjectReservations在写事务保留2小时上传/旧签名保护，再由GuardedObjectStore持对象事务锁至引用提交；GC同锁重新检查所有租户工作区/快照/作业/交付引用。后台分页扫描源桶发现历史与事务回滚遗留对象，按lastModified补2小时保护后再检查引用；不要求每次保护另借连接，避免连接池嵌套事务饥饿。管理不删除交付桶对象。remove是仅GC调用的系统出口。

对象回收失败持久记录 attempts 与 next_retry_at；最多8次，指数退避并有上限/抖动。耗尽后停止自动删除，并使关联删除记录显示 failed/object_cleanup_failed。人工重试只重置相关对象的失败次数，仍检查租约与引用保护。新写入保护会重置旧失败状态。

源对象桶物理盘点每批1000项，使用全局事务锁和持久游标防重复累计；只在完整扫描结束后公布对象数/字节数/扫描时间。盘点不是跨整个扫描周期的原子存储快照，平台UI标明采样时间；未完成第一次盘点时返回未知，不返回0。

平台可查看失败对象总数并重排耗尽预算的对象；重新执行仍检查租约和引用，涵盖上传回滚孤儿对象，没有直接强删入口。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `ObjectReservationsApi.advanceInventory` | `after: String` | `void` |
| `ObjectReservationsApi.candidates` | `limit: int` | `List<String>` |
| `ObjectReservationsApi.collect` | `key: String, referenced: BooleanSupplier, remove: Runnable` | `boolean` |
| `ObjectReservationsApi.failedCount` | `` | `long` |
| `ObjectReservationsApi.failed` | `keys: Set<String>` | `boolean` |
| `ObjectReservationsApi.inventoryCursor` | `` | `String` |
| `ObjectReservationsApi.inventoryStats` | `` | `ObjectReservationsApi.InventoryStats` |
| `ObjectReservationsApi.lock` | `key: String` | `void` |
| `ObjectReservationsApi.observe` | `key: String, modifiedAt: Instant` | `void` |
| `ObjectReservationsApi.protect` | `key: String` | `void` |
| `ObjectReservationsApi.retryFailed` | `` | `int` |
| `ObjectReservationsApi.retry` | `keys: Set<String>` | `void` |
| `ObjectReservationsApi.scan` | `objects: ObjectStoreApi` | `void` |
| `ObjectStoreApi.exists` | `key: String` | `boolean` |
| `ObjectStoreApi.inventory` | `after: String, limit: int` | `List<ObjectStoreApi.StoredObject>` |
| `ObjectStoreApi.open` | `key: String` | `Optional<InputStream>` |
| `ObjectStoreApi.presignGet` | `key: String, ttl: Duration, filename: String, contentType: String` | `ObjectStoreApi.PresignedGet` |
| `ObjectStoreApi.presignPut` | `key: String, ttl: Duration, contentType: String` | `ObjectStoreApi.PresignedPut` |
| `ObjectStoreApi.putIfAbsent` | `key: String, bytes: byte[], contentType: String` | `void` |
| `ObjectStoreApi.putIfAbsent` | `key: String, stream: InputStream, size: long, contentType: String` | `void` |
| `ObjectStoreApi.remove` | `key: String` | `void` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `ObjectReservationsApi.InventoryStats` | `objects: Long, bytes: Long, measuredAt: Instant` |
| `ObjectStoreApi.PresignedGet` | `url: String, expiresAt: Instant` |
| `ObjectStoreApi.PresignedPut` | `url: String, expiresAt: Instant` |
| `ObjectStoreApi.StoredObject` | `key: String, modifiedAt: Instant, sizeBytes: long` |

<!-- interface-contract:end -->

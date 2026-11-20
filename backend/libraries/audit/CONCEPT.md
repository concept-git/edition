# concept Audit

## purpose

让授权查询者追溯操作事实，同时使已抹除主体不能被迟到事件重新识别。

## state

events: EventId -> AuditEntry
scrubbed: set ActorId
exports: ExportId -> (filter: Filter, status: Status, lease: lone Token, objectKey: lone Key)

初态为空。eventId 稳定且唯一；rootId 关联级联。scrubbed 是脱敏墓碑，迟到写入不得恢复 IP 或变化摘要。租户事实受 RLS，平台事实的 tenant 为空。

## actions

append [event: Event] => [id: Long]
  requires 已有业务事务；ensures 在同一事务记录成功事实，重复 eventId 不新增事实
appendPlatform [event: Event] => [id: Long]
  requires 已有业务事务；ensures 显式写平台作用域，不继承当前租户
failed [event: Event] => []
  ensures 在业务事务结束后以独立、有界、尽力的事务记录失败尝试
scrub [actor: ActorId] => []
  ensures 删除可识别摘要并建立墓碑；保留稳定事件锚
retain [cutoff: Time] => []
  ensures 删除 cutoff 之前的过期事实
create [tenant: TenantId; actor: ActorId; filter: Filter; cutoff: Time] => [entry: ExportEntry]
  ensures 建立导出意图
claim [] => [entries: seq ExportEntry]
  ensures 为待处理导出分配租约
renew [entry: ExportEntry] => [renewed: Bool]
  ensures 仅当前租约可续租
finish [entry: ExportEntry; objectKey: String; error: String] => []
  ensures 记录导出完成或失败及私有对象键

## operational principle

after append [event: e] => [id: i]
then query [filter: matching(e); limit: n] 返回 i 对应事实；
after scrub [actor: e.actorId] => [] 后同一事实仍可追溯，但不再携带该主体敏感摘要。

## queries

query [filter: Filter; limit: Int] => [entries: seq AuditEntry]
count [filter: Filter] => [count: Long]
  returns 与 query 相同过滤，但忽略 before 游标
view [id: ExportId] => [entry: optional ExportEntry]
  returns 未找到导出时 empty

## notes

平台类概念；与产品概念采用相同规格形式。以下保留实现边界与运维约束。

拥有shared.audit_log与actor脱敏墓碑。成功事实与调用事务原子；失败尝试独立事务尽力记录。仅白名单结构字段；不保存正文/请求体/凭据/异常文本。管理 PAT 操作同时记录 USER actor 与 credentialId 稳定锚，不记录秘密。根操作UUID关联级联，eventId稳定。默认180天。scrub与append按actor串行，迟到事件不恢复IP/changeSummary。平台查询只返回tenant为空的记录；租户查询依RLS。

失败尝试在业务事务结束后写独立事务，锁等待上限1秒；失败审计不可延长为无界等待。写成功事实必须已有业务事务。切面通过延迟获取AuditApi避免提前创建存储组件而丢失事务代理。

概念成功事实切面仅包围声明的写事务；无单一事务的外部后台构建不在该切面内伪装成功事实，其受理/终态由运维与交付事件记录。

append继承当前租户；appendPlatform明确写平台作用域，不能受客户资源恢复事务的tenant上下文影响。
概念动作目标由AuditTargets按公开签名显式映射，有限输出由AuditOutcomes的穷尽sealed分支映射。
没有独立UUID的概念不伪造UUID：Revision记录item锚，Redirect/Search记录scope锚，CustomDomain目标留空。
失败Requesting尝试尚未解析实体时目标留空；不从请求参数中猜测UUID或输出任何凭据。

Session.touch是成功读取后的活跃心跳，按不记录普通读取成功的策略排除；独立 Worker 索引构建不属于管理单事务事实。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `AuditApi.appendPlatform` | `event: AuditApi.Event` | `long` |
| `AuditApi.append` | `event: AuditApi.Event` | `long` |
| `AuditApi.count` | `filter: AuditApi.Filter` | `long` |
| `AuditApi.failed` | `event: AuditApi.Event` | `void` |
| `AuditApi.query` | `filter: AuditApi.Filter, limit: int` | `List<AuditApi.Entry>` |
| `AuditApi.retain` | `cutoff: Instant` | `void` |
| `AuditApi.scrub` | `actor: UUID` | `void` |
| `AuditExportsApi.claim` | `` | `List<AuditExportsApi.Entry>` |
| `AuditExportsApi.create` | `tenant: UUID, actor: UUID, filter: AuditApi.Filter, cutoff: Instant` | `AuditExportsApi.Entry` |
| `AuditExportsApi.finish` | `entry: AuditExportsApi.Entry, objectKey: String, error: String` | `void` |
| `AuditExportsApi.renew` | `entry: AuditExportsApi.Entry` | `boolean` |
| `AuditExportsApi.view` | `id: UUID` | `Optional<AuditExportsApi.Entry>` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `AuditApi.Entry` | `id: long, eventId: UUID, rootId: UUID, time: Instant, kind: String, actorType: String, actorId: UUID, action: String, targetType: String, targetId: UUID, outcome: String, ip: String, requestId: String, credentialId: UUID` |
| `AuditApi.Event` | `tenantId: UUID, eventId: UUID, rootId: UUID, kind: String, actorType: String, actorId: UUID, action: String, targetType: String, targetId: UUID, outcome: String, ip: String, requestId: String` |
| `AuditApi.Filter` | `actor: UUID, action: String, target: UUID, outcome: String, from: Instant, to: Instant, before: Long, platform: boolean` |
| `AuditExportsApi.Entry` | `id: UUID, tenantId: UUID, actorId: UUID, filter: AuditApi.Filter, cutoff: Instant, status: String, objectKey: String, error: String, token: UUID, expiresAt: Instant` |

<!-- interface-contract:end -->

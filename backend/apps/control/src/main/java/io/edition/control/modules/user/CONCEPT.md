# concept User

## purpose
让每一个人拥有可指代、可核验、可终结的稳定身份

## state
email: User -> lone String
name: User -> String
avatar: User -> lone Image
locale: User -> lone Locale
verified: User -> Bool
verifyToken: User -> lone (token: String, expiry: Time)
status: User -> {active, deactivated, erased}
readerEpoch: User -> Int
platformOperator: User -> Bool

User 由本概念创建。初态集合为空。register 建立 active 身份，avatar/locale 无绑定、platformOperator=false。
每个现存 User 恰有一个 name、verified、status、platformOperator 与 readerEpoch（初始 0）。email 是登录标识，全局唯一，本表守护；erased 后清除。
验证挑战期限 24 小时，持久层仅存哈希。Image 为 HTTPS URL 字符串。platformOperator 只解锁平台运维面，不授予任何租户资源权限。

## actions

revokeReaderSessions [user: User] => [epoch: Long]
  ensures 在调用方事务递增 readerEpoch；未提交或回滚的递增对读者不可见。该版本是当前账号事实，不创建投递意图。


register [email: String; name: String] => [user: User; verifyToken: String]
  requires email 未被占用
  ensures 创建新 User，status=active、verified=false，生成限时 verifyToken；明文只供投递渠道，不进 HTTP

register [email: String; name: String] => [error: EmailTaken]
  requires email 已被占用
  ensures 返回 EmailTaken；状态不变

verify [user: User; token: String] => [user: User]
  requires status=active 且 token 与 verifyToken 匹配且未过期
  ensures verified=true 并作废 token

verify [user: User; token: String] => [error: Rejected]
  requires 不满足上一分支
  ensures 返回 Rejected；状态不变

requestVerification [user: User] => [token: String; expiresAt: Time]
  requires status=active 且未 verified
  ensures 替换验证挑战，期限 24 小时

requestVerification [user: User] => []
  requires 不满足上一分支
  ensures 状态不变

updateProfile [user: User; name: String; locale: String; avatar: String] => [profile: AccountProfile]
  requires user 存在；name 不可空白，avatar 无绑定或为 HTTPS URL
  ensures 整份展示资料替换；空或无绑定的 locale/avatar 清空

updateProfile [user: User; name: String; locale: String; avatar: String] => [error: Rejected]
  requires name 或 avatar 不合法
  ensures 返回 Rejected(violations)；状态不变

deactivate [user: User] => [status: Status; changed: Bool]
  requires status ∈ {active, deactivated}
  ensures status=deactivated；已是 deactivated 则 changed=false

deactivate [user: User] => [error: Erased]
  requires status=erased
  ensures 返回 Erased；状态不变

deactivate [user: User] => [error: NotFound]
  requires user 不存在
  ensures 返回 NotFound；状态不变

reactivate [user: User] => [status: Status; changed: Bool]
  requires status ∈ {active, deactivated}
  ensures status=active；已是 active 则 changed=false

reactivate [user: User] => [error: Erased]
  requires status=erased
  ensures 返回 Erased；状态不变

reactivate [user: User] => [error: NotFound]
  requires user 不存在
  ensures 返回 NotFound；状态不变

erase [user: User] => [changed: Bool]
  requires status ∈ {deactivated, erased}
  ensures 清除 email/avatar/locale/verifyToken，name 置为占位（"已注销用户"），verified=false、platformOperator=false、status=erased，并递增 readerEpoch；标识保留为墓碑。已是 erased 则 changed=false

erase [user: User] => [error: MustBeDeactivated]
  requires status=active
  ensures 返回 MustBeDeactivated；状态不变

erase [user: User] => [error: NotFound]
  requires user 不存在
  ensures 返回 NotFound；状态不变

## operational principle
after register [email: "a@x.com"; name: "Alice"] => [user: u; verifyToken: token]
then _byEmail [email: "a@x.com"] => [user: u]
系统各处此后可用 u 稳定指代此人

after verify [user: u; token: token] => [user: u]
then _profile [user: u] 的 verified=true
登录标识确实属于此人

after requestVerification [user: u] => [token: t1; expiresAt: e1]
after requestVerification [user: u] => [token: t2; expiresAt: e2]
then t1 失效，t2 可完成 verify；verify 成功、过期或用户停用后 _verificationPending 为 false

after deactivate [user: u] => [status: deactivated; changed: true]
then _isActive [user: u] => [active: false]
一切以 u 名义的活动可被拒绝

after deactivate [user: u] => [status: deactivated; changed: true]
after erase [user: u] => [changed: true]
then _byEmail [email: "a@x.com"] 为零行，_profile [user: u] 的 name 为墓碑
邮箱可被重新注册，历史引用降解为墓碑

after deactivate [user: u] => [status: deactivated; changed: true]
after erase [user: u] => [changed: true]
after register [email: "a@x.com"; name: "New Alice"] => [user: u2; verifyToken: token2]
then u2 ≠ u，且 _profile [user: u] 仍为墓碑
释放登录标识不复活旧身份

## queries

_readerEpoch [user: User] => [epoch: Long]
  returns 当前阅读会话版本；不是凭据证明，调用方仍须验证主体、状态、站点及期限。
_byEmail [email: String] => [user: User]
  returns 匹配该登录标识的身份；无匹配为零行，至多一行

_profile [user: User] => [name: String; verified: Bool]
  returns 展示名与核验位；无匹配为零行

_accountProfile [user: User] => [id: User; email: String; name: String; avatar: String; locale: String; verified: Bool; status: Status; platformOperator: Bool]
  returns 完整账户投影；无匹配为零行

_lockAccountProfile [user: User] => [id: User; email: String; name: String; avatar: String; locale: String; verified: Bool; status: Status; platformOperator: Bool]
  returns 与身份终结串行的同一投影；不改变状态；无匹配为零行

_isActive [user: User] => [active: Bool]
  returns 仅 status=active 为 true

_isPlatformOperator [user: User] => [operator: Bool]
  returns 仅 active 且标志为 true 时为 true

_verificationPending [user: User; token: String] => [pending: Bool]
  returns 当前挑战匹配、未过期、未消费且用户 active

_search [query: String; cursor: String; limit: Int] => [users: seq SearchItem; nextCursor: String]
  returns query 规范化后至少 2 字符的 email/name 字面前缀页；按 id 倒序，limit 夹到 1..100。百分号、下划线和反斜线不作为通配。无条件全库浏览为零行。

## notes
多租户下这是全局身份；租户归属由成员关系承担。审计字段走约定层。
合规注销 = erase：只抹个人信息、保留稳定 id，历史修订与审计条目锚 id 不锚个人信息。
Password、Session、ApiToken、Membership、Permission 与审计字段的处置是组合层职责。
Rejected 合并无效、过期、已使用 token，因为调用方下一步相同。updateProfile 的 user 不存在违反主体不变量，不是 Rejected。
数据库等依赖故障不属于任何 error case。updateProfile 与 platformOperator 不进操作原则：前者是指代的展示字段，后者只解锁平台运维面。
`_search` 是概念内部查询 seam：租户授权主体选择器可用 2 字符前缀；平台全库 `/admin/users` 仍由 gateway 要求至少 3 字符。
Java 模块不得依赖其他概念；跨概念生命周期级联只在 sync 完成。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `UserApi.accountProfile` | `user: UserApi.UserId` | `Optional<UserApi.AccountProfile>` |
| `UserApi.byEmail` | `email: String` | `Optional<UserApi.UserId>` |
| `UserApi.deactivate` | `user: UserApi.UserId` | `UserApi.LifecycleResult` |
| `UserApi.erase` | `user: UserApi.UserId` | `UserApi.EraseResult` |
| `UserApi.isActive` | `user: UserApi.UserId` | `boolean` |
| `UserApi.isPlatformOperator` | `user: UserApi.UserId` | `boolean` |
| `UserApi.lockAccountProfile` | `user: UserApi.UserId` | `Optional<UserApi.AccountProfile>` |
| `UserApi.profile` | `user: UserApi.UserId` | `Optional<UserApi.Profile>` |
| `UserApi.reactivate` | `user: UserApi.UserId` | `UserApi.LifecycleResult` |
| `UserApi.readerEpoch` | `user: UserApi.UserId` | `long` |
| `UserApi.register` | `email: String, name: String` | `UserApi.RegisterResult` |
| `UserApi.requestVerification` | `user: UserApi.UserId` | `Optional<UserApi.Verification>` |
| `UserApi.revokeReaderSessions` | `user: UserApi.UserId` | `long` |
| `UserApi.search` | `query: String, cursor: String, limit: int` | `UserApi.SearchPage` |
| `UserApi.updateProfile` | `user: UserApi.UserId, name: String, locale: String, avatar: String` | `UserApi.UpdateProfileResult` |
| `UserApi.verificationPending` | `user: UserApi.UserId, token: String` | `boolean` |
| `UserApi.verify` | `user: UserApi.UserId, token: String` | `UserApi.VerifyResult` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `UserApi.AccountProfile` | `id: UserApi.UserId, email: String, name: String, avatar: String, locale: String, verified: boolean, status: UserApi.Status, platformOperator: boolean` |
| `UserApi.EraseResult.MustBeDeactivated` | `[]` |
| `UserApi.EraseResult.NotFound` | `[]` |
| `UserApi.EraseResult.Ok` | `changed: boolean` |
| `UserApi.EraseResult` | `UserApi.EraseResult.MustBeDeactivated / UserApi.EraseResult.NotFound / UserApi.EraseResult.Ok` |
| `UserApi.LifecycleResult.Erased` | `[]` |
| `UserApi.LifecycleResult.NotFound` | `[]` |
| `UserApi.LifecycleResult.Ok` | `status: UserApi.Status, changed: boolean` |
| `UserApi.LifecycleResult` | `UserApi.LifecycleResult.Erased / UserApi.LifecycleResult.NotFound / UserApi.LifecycleResult.Ok` |
| `UserApi.Profile` | `name: String, verified: boolean` |
| `UserApi.RegisterResult.EmailTaken` | `email: String` |
| `UserApi.RegisterResult.Registered` | `user: UserApi.UserId, verifyToken: String` |
| `UserApi.RegisterResult` | `UserApi.RegisterResult.EmailTaken / UserApi.RegisterResult.Registered` |
| `UserApi.SearchItem` | `id: UserApi.UserId, email: String, name: String, status: UserApi.Status, platformOperator: boolean, updatedAt: Instant` |
| `UserApi.SearchPage` | `users: List<UserApi.SearchItem>, nextCursor: String` |
| `UserApi.Status` | `ACTIVE / DEACTIVATED / ERASED` |
| `UserApi.UpdateProfileResult.Rejected` | `violations: List<ValidationViolation>` |
| `UserApi.UpdateProfileResult.Updated` | `profile: UserApi.AccountProfile` |
| `UserApi.UpdateProfileResult` | `UserApi.UpdateProfileResult.Rejected / UserApi.UpdateProfileResult.Updated` |
| `UserApi.UserId` | `value: UUID` |
| `UserApi.Verification` | `token: String, expiresAt: Instant` |
| `UserApi.VerifyResult.Rejected` | `[]` |
| `UserApi.VerifyResult.Verified` | `user: UserApi.UserId` |
| `UserApi.VerifyResult` | `UserApi.VerifyResult.Rejected / UserApi.VerifyResult.Verified` |

<!-- interface-contract:end -->

阅读会话以签发时的 readerEpoch 绑定账号；停用、恢复或擦除的实际状态转换递增该版本，恢复不重新激活旧 Cookie。当前状态与版本由同一主库快照读取，不依赖身份投影、安全头或屏障对账。

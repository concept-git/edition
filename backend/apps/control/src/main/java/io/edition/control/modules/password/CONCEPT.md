# concept Password [User]

## purpose
让用户凭只有自己知道的秘密证明身份

## state
hash: User -> Hash
failures: User -> Int
lockedUntil: User -> lone Time
resetToken: User -> lone (token: String, expiry: Time)

初始无密码状态；set 后 failures=0、lockedUntil 无绑定。密码至少 8 字符，且含字母和数字；拒绝详情为 password_too_short / password_letter_required / password_digit_required。

## actions
set [user: User; password: String] => [user: User]
  requires 强度达标
  ensures 更新 hash、清零 failures 与 lockedUntil，并作废已存在的重设挑战

set [user: User; password: String] => [error: TooWeak]
  requires 强度不达标
  ensures 返回 TooWeak(violations)；状态不变

authenticate [user: User; password: String] => [user: User]
  requires 未处锁定期且密码匹配
  ensures failures 与 lockedUntil 原子清零

authenticate [user: User; password: String] => [error: Locked]
  requires 锁定尚未到期，或本轮失败使 failures 达到 5
  ensures 已锁定则状态不变；第 5 次失败设置锁定期限。锁定时长可配置，默认 15 分钟

authenticate [user: User; password: String] => [error: BadPassword]
  requires 未锁定且密码不匹配且本轮失败后仍未满 5
  ensures 当前轮 failures 原子 +1

change [user: User; oldPassword: String; newPassword: String] => [user: User]
  requires new 强度达标且 old 验证通过（含防爆破计数）
  ensures 更新 hash、清零 failures/lockedUntil 并清除 resetToken

change [user: User; oldPassword: String; newPassword: String] => [error: TooWeak]
  requires new 强度不达标
  ensures 返回 TooWeak；不增加旧密码失败计数、不消费挑战

change [user: User; oldPassword: String; newPassword: String] => [error: Locked]
  requires old 验证时锁定尚未到期
  ensures 返回 Locked(until)；不改 hash

change [user: User; oldPassword: String; newPassword: String] => [error: BadPassword]
  requires old 不匹配且未锁定
  ensures 返回 BadPassword；计入 failures

requestReset [user: User] => [user: User; token: String; expiresAt: Time]
  requires 已有 Password 状态
  ensures 生成一次性限时 resetToken（默认 30 分钟），替换并立即作废该用户的旧 token

reset [token: String; newPassword: String] => [user: User]
  requires token 有效未过期且 newPassword 强度达标
  ensures 更新 hash、作废 token、清零 failures 与 lockedUntil

reset [token: String; newPassword: String] => [error: TokenInvalid]
  requires token 无效、过期、已使用或已被替换
  ensures 返回 TokenInvalid；状态不变

reset [token: String; newPassword: String] => [error: TooWeak]
  requires token 有效但 newPassword 强度不达标
  ensures 返回 TooWeak；不消费挑战

terminate [user: User] => []
  ensures 原子删除该主体全部密码、失败计数、锁定和重设挑战；重复执行无额外效果。

## operational principle
after set [user: u; password: p] => [user: u]
then authenticate [user: u; password: p] => [user: u]
兑现凭秘密证明身份

after authenticate [user: u; password: 错误密码] 连续 5 次 => [error: Locked]
then 即便密码正确 authenticate [user: u; password: p] => [error: Locked]，直至锁定期满
爆破被概念自身挡住

after 锁定期满 authenticate [user: u; password: p] => [user: u]
then failures=0、lockedUntil 无绑定

after requestReset [user: u] => [user: u; token: t; expiresAt: expiry]
after reset [token: t; newPassword: p2] => [user: u]
then authenticate [user: u; password: p2] => [user: u]
忘记秘密也有安全的重设路径

## queries
_isSet [user: User] => [set: Bool]
  returns 该身份是否已有 Password 状态

_resetPending [user: User; token: String] => [pending: Bool]
  returns 当前挑战匹配且尚未过期；不消费或续期

_fakeAuthenticate [password: String] => []
  returns 无绑定。未知邮箱等成本 Argon2 验证；不读写任何账户 state

_resetOwner [token: String] => [user: lone User]
  returns 有效挑战的主体，不消费挑战；仅供同库组合先锁定 User。消费动作必须再次检查挑战，定位结果不授予修改权。

## notes
Password 只拥有 `iam.password_credentials`，以不透明 User ID 标识主体；不读取其他概念，也不等待身份投影。
Control 是唯一装配密码写入的应用。注册、密码变更、重设、会话撤销和用户擦除由组合在同一主库事务中执行；后续系统故障完整回滚凭据与会话，无远程协议或补偿意图。
哈希使用 Argon2id；失败计数与锁定属于 authenticate 动作。锁定与挑战有效期可配置。
没有 Password 状态时 authenticate 做等成本假验证并返回 BadPassword。requestReset 要求已有状态，由组合先检查。
未知邮箱的假验证不读写任何账户状态；端点限流先于 authenticate，429 不影响 failures。
忘记密码对未知邮箱和不可登录用户静默成功，不签发挑战。TokenInvalid 合并无效、过期、已使用和已替换的 token。
存储、时钟或加密设施不可用是系统故障。Java 模块不得依赖其他概念；User 是不透明实例化值。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `PasswordApi.authenticate` | `user: PasswordApi.AccountId, password: String` | `PasswordApi.AuthenticateResult` |
| `PasswordApi.change` | `user: PasswordApi.AccountId, oldPassword: String, newPassword: String` | `PasswordApi.ChangeResult` |
| `PasswordApi.fakeAuthenticate` | `password: String` | `void` |
| `PasswordApi.isSet` | `user: PasswordApi.AccountId` | `boolean` |
| `PasswordApi.requestReset` | `user: PasswordApi.AccountId` | `PasswordApi.ResetRequest` |
| `PasswordApi.resetOwner` | `token: String` | `Optional<PasswordApi.AccountId>` |
| `PasswordApi.resetPending` | `user: PasswordApi.AccountId, token: String` | `boolean` |
| `PasswordApi.reset` | `token: String, newPassword: String` | `PasswordApi.ResetResult` |
| `PasswordApi.set` | `user: PasswordApi.AccountId, password: String` | `PasswordApi.SetResult` |
| `PasswordApi.terminate` | `user: PasswordApi.AccountId` | `void` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `PasswordApi.AccountId` | `value: UUID` |
| `PasswordApi.AuthenticateResult.Authenticated` | `user: PasswordApi.AccountId` |
| `PasswordApi.AuthenticateResult.Reason` | `BAD_PASSWORD / LOCKED` |
| `PasswordApi.AuthenticateResult.Rejected` | `reason: PasswordApi.AuthenticateResult.Reason` |
| `PasswordApi.AuthenticateResult` | `PasswordApi.AuthenticateResult.Authenticated / PasswordApi.AuthenticateResult.Rejected` |
| `PasswordApi.ChangeResult.BadPassword` | `[]` |
| `PasswordApi.ChangeResult.Locked` | `until: Instant` |
| `PasswordApi.ChangeResult.Ok` | `user: PasswordApi.AccountId` |
| `PasswordApi.ChangeResult.TooWeak` | `violations: List<ValidationViolation>` |
| `PasswordApi.ChangeResult` | `PasswordApi.ChangeResult.BadPassword / PasswordApi.ChangeResult.Locked / PasswordApi.ChangeResult.Ok / PasswordApi.ChangeResult.TooWeak` |
| `PasswordApi.ResetRequest` | `user: PasswordApi.AccountId, token: String, expiresAt: Instant` |
| `PasswordApi.ResetResult.Ok` | `user: PasswordApi.AccountId` |
| `PasswordApi.ResetResult.TokenInvalid` | `[]` |
| `PasswordApi.ResetResult.TooWeak` | `violations: List<ValidationViolation>` |
| `PasswordApi.ResetResult` | `PasswordApi.ResetResult.Ok / PasswordApi.ResetResult.TokenInvalid / PasswordApi.ResetResult.TooWeak` |
| `PasswordApi.SetResult.Ok` | `user: PasswordApi.AccountId` |
| `PasswordApi.SetResult.TooWeak` | `violations: List<ValidationViolation>` |
| `PasswordApi.SetResult` | `PasswordApi.SetResult.Ok / PasswordApi.SetResult.TooWeak` |

<!-- interface-contract:end -->

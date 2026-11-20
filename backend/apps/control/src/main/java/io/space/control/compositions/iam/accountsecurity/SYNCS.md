# syncs: 账户安全联动

> IAM `accountsecurity` flow 的唯一 sync 规格；共享约定见 [../SYNCS.md](../SYNCS.md)。

## flow: 账户安全联动

触发: `Requesting/changePassword` / `Requesting/forgotPassword` / `Requesting/resetPassword`

```text
sync changePassword
// implementation: ChangePasswordUseCase#changePassword
when {
  Requesting/changePassword: [oldPassword: ?old; newPassword: ?new] => [request: ?request]
}
where {
  Session/_principal: [session: ?sid] => [principal: ?u]
}
then {
  Password/change: [user: ?u; oldPassword: ?old; newPassword: ?new] => [user: ?u]
  Session/endAll: [principal: ?u]
  Requesting/respond: [request: ?request]
}

mediator branch changePasswordFailed
when {
  Password/change: [user: ?u; oldPassword: ?old; newPassword: ?new] => [error: BadPassword | Locked | TooWeak]
}
then {
  Requesting/respond: [request: ?request; error: ?error]
}

sync forgot
// implementation: ForgotUseCase#forgot
when {
  Requesting/forgotPassword: [email: ?email] => [request: ?request]
}
where {
  AuthenticationRateLimiter.allow: [ip: ?ip; email: ?email]
  User/_byEmail: [email: ?email] => [user: ?u]
  User/_isActive: [user: ?u] => [active: true]
  Password/_isSet: [user: ?u] => [set: true]
}
then {
  Password/requestReset: [user: ?u] => [user: ?user; token: ?token; expiresAt: ?expiresAt]
  MailOutbox.enqueue: [kind: password_reset; email: ?email; userId: ?user; token: ?token]
  Requesting/respond: [request: ?request]
}

sync resetByToken
// implementation: ResetByTokenUseCase#resetByToken
when {
  Requesting/resetPassword: [token: ?token; newPassword: ?new] => [request: ?request]
}
then {
  Password/reset: [token: ?token; newPassword: ?new] => [user: ?u]
  Session/endAll: [principal: ?u]
  Requesting/respond: [request: ?request]
}

mediator branch resetInvalid
when {
  Password/reset: [token: ?token; newPassword: ?new] => [error: TokenInvalid | TooWeak]
}
then {
  Requesting/respond: [request: ?request; error: ?error]
}
```

`changePassword` / `resetByToken` 的 Password 更新与 Session/endAll 在同一主库事务提交；后续系统故障完整回滚，旧凭据和会话保持原状态。明确拒绝保留既有会话，错误密码计数按 noRollbackFor 提交。
changePasswordFailed：BadPassword → 400 invalid_old_password；Locked → 429 password_locked；TooWeak → 422。
forgot 对未知邮箱或不可登录用户不签发 token，但也返回完全相同的 202。
User 的平台停用与注销已归入 usererasure；本 flow 不再监听 User/deactivate。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `ChangePasswordUseCase.changePassword` | `user: UUID, oldPassword: String, newPassword: String` | `void` |
| `ForgotUseCase.forgot` | `email: String` | `void` |
| `ResetByTokenUseCase.resetByToken` | `token: String, newPassword: String` | `void` |

| 类型 | 字段／封闭分支 |
| --- | --- |


<!-- interface-contract:end -->

## Implementation policy ownership

`PasswordFailures` owns `changePasswordFailed`, `resetInvalid`. These names denote entry policy, refusal translation, or a read projection. They do not create completion events or persist rule identities. Protected effects retain the original transaction, lock, and tenant scope.

凭据命令统一按 User→Password→Session 取得行锁。reset 的非消费主体定位只用于先锁 User，Password/reset 随后在锁内复核挑战，挑战被替换或消费即拒绝；没有远程屏障或补偿事务。

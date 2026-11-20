# syncs: 登录与会话

> IAM `login` flow 的唯一 sync 规格；共享约定见 [../SYNCS.md](../SYNCS.md)。

## flow: 登录与会话

触发: `Requesting/login` / `Requesting/refresh` / `Requesting/logout`

```text
sync login
// implementation: LoginUseCase#login
when {
  Requesting/login: [email: ?email; password: ?password] => [request: ?request]
}
where {
  User/_byEmail: [email: ?email] => [user: ?u]
  User/_lockAccountProfile: [user: ?u] => [profile: ?profile]
  profile.status = active
  profile.verified
}
then {
  Password/authenticate: [user: ?u; password: ?password]
}

mediator branch loginUnknownEmail
when {
  Requesting/login: [email: ?email; password: ?password] => [request: ?request]
}
where {
  User/_byEmail: [email: ?email] => []
}
then {
  Password/_fakeAuthenticate: [password: ?password]
  Requesting/respond: [request: ?request; error: InvalidCredentials]
}

sync loginSucceeded
// implementation: LoginSucceededOnCompletion#loginSucceeded
when {
  Password/authenticate: [user: ?u; password: ?password] => [user: ?user]
}
where {
  principal = ?user
  device/network 来自同一请求
}
then {
  Session/start: [principal: ?user; device: ?device; network: ?network] => [session: ?session; access: ?access; refresh: ?refresh]
  Requesting/respond: [request: ?request; credential: ?credential]
}

mediator branch loginFailed
when {
  Password/authenticate: [user: ?u; password: ?password] => [error: BadPassword | Locked]
}
then {
  Requesting/respond: [request: ?request; error: InvalidCredentials]
}

mediator branch loginIneligible
when {
  Requesting/login: [email: ?email; password: ?password] => [request: ?request]
}
where {
  User/_byEmail: [email: ?email] => [user: ?u]
  User/_lockAccountProfile: [user: ?u] => [profile: ?profile]
  profile.status ≠ active 或 ¬profile.verified
}
then {
  Password/_fakeAuthenticate: [password: ?password]
  Requesting/respond: [request: ?request; error: InvalidCredentials]
}

sync refresh
// implementation: RefreshUseCase#refresh
when {
  Requesting/refresh: [refresh: ?refresh] => [request: ?request]
}
where {
  管理 refresh 只使用本地管理会话存储
}
then {
  Session/renew: [refresh: ?refresh]
}

mediator branch refreshExpired
when {
  Session/renew: [refresh: ?refresh] => [error: Invalid | Expired | ConcurrentReuse | Replayed]
}
then {
  Requesting/respond: [request: ?request; error: InvalidRefresh]
}

sync logout
// implementation: LogoutUseCase#logout
when {
  Requesting/logout: [refresh: ?refresh] => [request: ?request]
}
where {
  refresh 非空；空值为空操作，旧 reader refresh 已由迁移终结
}
then {
  Session/endByRefresh: [refresh: ?refresh]
}
```

上述所有登录拒绝对外均为 `401 invalid_credentials`；内部结构化安全事件区分
`unknown_email / bad_password / locked / ineligible`，且不记录原始邮箱、密码、
token 或精确 IP。refresh/logout 只接受 `/auth` 路径的 HttpOnly refresh cookie，并校验
Origin/Referer allowlist；refresh 重放按 Session 的 10 秒并发宽限处理。
以上 error sync 只匹配概念声明的业务拒绝；JWT 解析确认无效映射认证拒绝，存储/加密设施不可用
穿透到 gateway 为 503/504，不能降级成 401。

`loginSucceeded` 的 device / network 取自请求元信息；绝对期限是 Session 常量，无 ttl 入参。
reader-state 凭据格式与管理 refresh 完全分开，不能互换。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `LoginSucceededOnCompletion.loginSucceeded` | `binding: LoginSignals.LoginSucceeded` | `void` |
| `LoginUseCase.login` | `email: String, password: String, device: LoginTypes.Device, approximateIp: String` | `LoginTypes.Credentials` |
| `LogoutUseCase.logout` | `refreshToken: String` | `void` |
| `RefreshUseCase.refresh` | `refreshToken: String` | `LoginTypes.Credentials` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `LoginSignals.LoginSucceeded` | `user: UserApi.UserId, device: SessionApi.Device, approximateIp: String, completion: RuleCompletion<LoginTypes.Credentials>` |
| `LoginTypes.Credentials` | `sessionId: UUID, accessToken: String, refreshToken: String, tokenType: String, expiresIn: long` |
| `LoginTypes.Device` | `name: String, browser: String, os: String` |

<!-- interface-contract:end -->

前端完成边界：业务成功与后续刷新、导航分离；后续故障不重新提交已完成动作。身份结束后的完成反馈在应用外层保留。


## Implementation policy ownership

`LoginFailures` owns `loginUnknownEmail`, `loginFailed`, `loginIneligible`, `refreshExpired`. These names denote entry policy, refusal translation, or a read projection. They do not create completion events or persist rule identities. Protected effects retain the original transaction, lock, and tenant scope.


## Native completion protocol

`LoginRelay` publishes the bindings in `LoginSignals` synchronously at the corresponding call-completion or entry-continuation point. Each binding carries a unique occurrence and the current root flow. It is local execution data, not a second business state. Receiving rules claim their occurrence before effects and record one response. Equal-valued later requests use distinct occurrences; another flow cannot supply this binding. A missing response fails explicitly.

These continuations use the existing synchronous Java transaction and Spring event publisher. Receiving listeners must remain synchronous: no `@Async`, after-commit listener, durable replay, or independent transaction is added. Failures propagate to the caller and retain the original rollback/refusal policy. Persistent asynchronous delivery continues through the existing outboxes.

The native implementation retains the documented ordered transactional synchronization dialect. The typed binding is emitted only at the declared request/result branch; it does not join arbitrary historical concept events.

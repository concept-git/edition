# syncs: 注册与激活

> IAM `registration` flow 的唯一 sync 规格；共享约定见 [../SYNCS.md](../SYNCS.md)。

## flow: 注册与激活

触发: `Requesting/register` / `Requesting/verifyEmail` / `Requesting/resendVerification`

```text
sync register
// implementation: RegisterUseCase#register
when {
  Requesting/register: [email: ?email; name: ?name; password: ?password] => [request: ?request]
}
then {
  User/register: [email: ?email; name: ?name] => [user: ?u; verifyToken: ?verifyToken]
  Password/set: [user: ?u; password: ?password]
  acceptInviteOnRegister
  MailOutbox.enqueue: [kind: verification; email: ?email; userId: ?u; token: ?verifyToken]
  Requesting/respond: [request: ?request; user: ?u]
}

mediator branch registerTaken
when {
  User/register: [email: ?email; name: ?name] => [error: EmailTaken]
}
then {
  Requesting/respond: [request: ?request; error: EmailTaken]
}

mediator branch passwordTooWeak
when {
  Password/set: [user: ?u; password: ?password] => [error: TooWeak]
}
then {
  Requesting/respond: [request: ?request; error: TooWeak]
}

sync acceptInviteOnRegister
// implementation: AcceptInviteOnRegister#acceptInviteOnRegister
when {
  User/register: [email: ?email; name: ?name] => [user: ?u; verifyToken: ?verifyToken]
}
where {
  Membership/_pendingFor: [email: ?email] => [invites: ?invites]
  仅 group.type = TENANT
}
then {
  对每个 tenant 作用域 Membership/accept: [invite: ?handle; member: ?u]
  Accepted 且 role=owner 时补群体根 admin
}

sync verifyEmail
// implementation: VerifyEmailUseCase#verifyEmail
when {
  Requesting/verifyEmail: [user: ?user; token: ?token] => [request: ?request]
}
then {
  User/verify: [user: ?user; token: ?token]
}

mediator branch verifyRejected
when {
  User/verify: [user: ?user; token: ?token] => [error: Rejected]
}
then {
  Requesting/respond: [request: ?request; error: Rejected]
}

sync resendVerification
// implementation: ResendVerificationUseCase#resendVerification
when {
  Requesting/resendVerification: [email: ?email] => [request: ?request]
}
where {
  User/_byEmail: [email: ?email] => [user: ?u]
  User/_accountProfile: [user: ?u] => [profile: ?profile]
  profile.status = active 且 ¬profile.verified
}
then {
  User/requestVerification: [user: ?u] => [token: ?token; expiresAt: ?expiresAt]
  MailOutbox.enqueue: [kind: verification; email: ?email; userId: ?u; token: ?token]
  Requesting/respond: [request: ?request]
}
```

`register`、`acceptInviteOnRegister` 及其接力动作在同一调用栈、同一数据库事务；身份注册 EmailTaken、Password TooWeak 及
系统故障回滚 User、Password、Membership、根授权与邮件 outbox。可选邀请的 Invalid/Expired/AlreadyMember 跳过，不阻止独立身份注册。
未知、已验证、非 active 身份的 resend 同样 202，不签发挑战。TEAM 邀请不在注册中自动接受。
User.reactivate 由 usererasure.reactivateUser 承接。

拒绝的 mediator branch 由所属入口直接翻译动作结果或条件失败，不对应独立 Java 方法；错误码、违反项和事务结果保持上述契约。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `AcceptInviteOnRegister.acceptInviteOnRegister` | `binding: RegistrationSignals.AcceptInviteOnRegister` | `void` |
| `RegisterUseCase.register` | `email: String, name: String, password: String` | `UUID` |
| `ResendVerificationUseCase.resendVerification` | `email: String` | `void` |
| `VerifyEmailUseCase.verifyEmail` | `user: UUID, token: String` | `void` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `RegistrationSignals.AcceptInviteOnRegister` | `user: UUID, email: String, completion: RuleCompletion<Void>` |

<!-- interface-contract:end -->

密码与身份在同一事务提交，不再创建身份投影等待状态或注册补偿意图。

## Native completion protocol

`RegistrationRelay` publishes the bindings in `RegistrationSignals` synchronously at the corresponding call-completion or entry-continuation point. Each binding carries a unique occurrence and the current root flow. It is local execution data, not a second business state. Receiving rules claim their occurrence before effects and record one response. Equal-valued later requests use distinct occurrences; another flow cannot supply this binding. A missing response fails explicitly.

These continuations use the existing synchronous Java transaction and Spring event publisher. Receiving listeners must remain synchronous: no `@Async`, after-commit listener, durable replay, or independent transaction is added. Failures propagate to the caller and retain the original rollback/refusal policy. Persistent asynchronous delivery continues through the existing outboxes.

The native implementation retains the documented ordered transactional synchronization dialect. The typed binding is emitted only at the declared request/result branch; it does not join arbitrary historical concept events.

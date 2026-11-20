# flow: mail delivery

`Scheduler/tick` 是 Spring `@Scheduled` 每次调用的外部根动作；`job=mailDelivery`
标识轮询种类。轮询本身不持久化，已提交邮件意图和有限重试状态由 MailOutbox 保存。

新邮件的主题使用平台品牌 Space：`Space · 验证邮箱`、`Space · 成员邀请`、
`Space · 重设密码`。部署可配置各动作的链接模板；未配置时正文提供管理 API 所需的一次性凭据。已经固化的邮件内容按原样重试。

```text
sync deliverMail
// implementation: DeliverMailOnSchedule#deliverMail
when {
  Scheduler/tick: [job: mailDelivery] => [fired: true]
}
then {
  MailOutbox/claim: []
}

mediator branch deliverClaimedMail
when {
  Scheduler/tick: [job: mailDelivery] => [fired: true]
  MailOutbox/claim: [] => [lease: ?lease]
}
where {
  MailOutbox/payload: [lease: ?lease] => [payload: ?payload]
  当前凭据仍可投递；不可投递则 MailOutbox/obsolete 终结该租约
}
then {
  MailOutbox/prepare: [lease: ?lease; payload: 固化的主题与正文]
}

mediator branch sendPreparedMail
when {
  MailOutbox/prepare: [lease: ?lease; payload: ?payload] => [prepared: true]
}
then {
  MailOutbox/send: [messageId: ?lease.id; recipient: ?lease.recipient; subject: ?payload.mailSubject; text: ?payload.mailText]
}

mediator branch acceptSentMail
when {
  MailOutbox/claim: [] => [lease: ?lease]
  MailOutbox/send: [messageId: ?lease.id] => []
}
then {
  MailOutbox/accepted: [lease: ?lease]
}
```

Credentials never appear in logging or HTTP. Intent id and original payload survive retry/replay.
The eligibility check cannot recall an SMTP delivery that has already started or been accepted.
Normal failure is retrying/failed, never a business held Release. Worker claim/finish are separate short
transactions; SMTP does not hold a management business transaction.
`claim` 是修改租约的动作，不能放在 `where` 当只读查询；无候选、资格失效或 `prepare=false`
均不发送。SMTP 依赖故障写有限重试，认证/配置/不变量故障写 failed。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `DeliverMailOnSchedule.deliverMail` | `` | `void` |

| 类型 | 字段／封闭分支 |
| --- | --- |


<!-- interface-contract:end -->

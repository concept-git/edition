# flow 用户管理令牌

## purpose

用户会话签发和管理本人的 PAT，PAT 按当前用户权限执行管理操作，并受任务 scope 与可选租户限制约束。

## syncs

sync issueManagementToken
// implementation: IssueManagementTokenUseCase#issueManagementToken
when Requesting.issueManagementToken [credential: ?c; key: ?k; name: ?n; scopes: ?s; tenant?: ?t; expiry: ?e]
where credential 是有效用户 Session；User 当前 active 且 verified；指定 tenant 时是当前成员；platform scopes 要求当前平台运营员且无 tenant 限制
then Idempotency.execute 与 ManagementToken.issue 在同一事务；201 响应经加密重放保存，明文仅从签发响应交付

sync listManagementTokens
// implementation: ListManagementTokensUseCase#listManagementTokens
when Requesting.listManagementTokens [credential: ?c; cursor: ?p; limit: ?l]
where credential 是有效用户 Session
then ManagementToken._ownedBy [owner: ?u; cursor: ?p; limit: ?l] => [page: ?r]

sync revokeManagementToken
// implementation: RevokeManagementTokenUseCase#revokeManagementToken
when Requesting.revokeManagementToken [credential: ?c; token: ?id]
where credential 是有效用户 Session
then ManagementToken.revoke [token: ?id; owner: ?u]；204，其他 owner 或不存在为同一 no-op

sync authenticationContext
// implementation: AuthenticationContextUseCase#authenticationContext
when Requesting.authenticationContext [credential: ?c]
where PrincipalResolution 认证有效；ManagementToken 时 User 当前 active 且 verified
then 返回 actorId、credentialId、凭据类型、任务 scopes、tenant 限制和 expiry；不返回秘密或全部其他租户事实

## mediator branches

InvalidScope / InvalidExpiry => 422 invalid_management_token_scope / invalid_token_expiry。
未授权租户或 platform 范围 => 403 permission_denied / platform_operator_required。
PAT 请求凭据生命周期、密码变更和本人擦除 => 403 permission_denied。
缺 task scope => 403 management_scope_required，violations[scope] 明示所需 task scope。
未知 handler、租户限制不匹配 => 403 permission_denied。
格式、hash、过期、撤销、用户失效 => 401 invalid_token；依赖失败保留 503/504，不能伪装成身份失效。

## authentication and authorization

spm_ 由独立 Bearer manager 认证；PrincipalResolution 返回 USER actor 与 management credential 限制，不建立 TOKEN grant。HTTP handler 前按已登记控制器和动作校验 scope，未知入口默认拒绝；TenantAccess 每次准入再校验 tenant 限制、当前成员和真实资源权限。非资源型本人及 platform 入口也必须在 HTTP scope gate 覆盖。
user 停用在原事务 revokeAll；恢复不恢复旧 PAT；erase 在原事务 eraseAll。PAT 不因普通浏览器退出而撤销；不使用 refresh cookie。
审计 actor 为用户，额外记录 credentialId，秘密不进入审计。幂等按 USER actor 与操作/key/request 指纹定义，换凭据不产生新的业务意图；重放前仍须通过当前认证与授权。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `AuthenticationContextUseCase.authenticationContext` | `credential: String` | `ManagementTokenTypes.ManagementAuthenticationContext` |
| `IssueManagementTokenUseCase.issueManagementToken` | `credential: String, key: String, name: String, scopes: Set<String>, tenant: UUID, expiry: Instant` | `FlowResponse<ManagementTokenTypes.IssuedManagementToken>` |
| `ListManagementTokensUseCase.listManagementTokens` | `credential: String, cursor: String, limit: int` | `ManagementTokenTypes.ManagementTokenPage` |
| `RevokeManagementTokenUseCase.revokeManagementToken` | `credential: String, id: UUID` | `void` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `ManagementTokenTypes.IssuedManagementToken` | `token: ManagementTokenTypes.ManagementTokenView, secret: String` |
| `ManagementTokenTypes.ManagementAuthenticationContext` | `credentialType: String, actorId: UUID, credentialId: UUID, scopes: Set<String>, tenantId: UUID, expiry: Instant` |
| `ManagementTokenTypes.ManagementTokenPage` | `items: List<ManagementTokenTypes.ManagementTokenView>, nextCursor: String` |
| `ManagementTokenTypes.ManagementTokenView` | `id: UUID, name: String, scopes: Set<String>, tenantId: UUID, expiry: Instant, status: String, createdAt: Instant, lastUsedAt: Instant, revokedAt: Instant` |

<!-- interface-contract:end -->

## 管理凭据能力约束

`allowedActions` 是当前资源授权、业务状态、PAT task scope 与租户边界的交集。会话保持原有能力；PAT 的读取范围不隐含写入、发布或权限管理范围。管理 scope catalog 与网关及生成命令契约共用。预演只读观察不锁定执行，写入仍重新校验授权、ETag 与业务前置条件。

签发拒绝 account:* 与租户绑定的组合，避免产生无法使用的个人账号范围。已有凭据的账号入口仍拒绝租户限定令牌。

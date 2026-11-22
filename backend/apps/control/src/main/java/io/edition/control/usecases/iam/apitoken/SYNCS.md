# syncs: API 令牌生命周期

> IAM `apitoken` flow 的唯一 sync 规格；共享约定见 [../../SYNCS.md](../../SYNCS.md)。
> 真实 space→tenant 走组合根 `ResourceChain`（本 flow miss 映射 400 `tenant_space_mismatch`）。

## flow: API 令牌生命周期

触发: `Requesting/issueToken` / `Requesting/listTokens` / `Requesting/revokeToken`

```text
sync issueToken
// implementation: IssueTokenUseCase#issueToken
when {
  Requesting/issueToken: [tenant: ?tenant; name: ?name; space: ?space; role: ?role; scopes: ?scopes; expiry: ?expiry] => [request: ?request]
}
where {
  Session/_principal: [session: ?sid] => [principal: ?issuer]
  TenantAccess: [tenant: ?tenant; principal: ?issuer]
  ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
  Permission/_decide: [chain: [?tenant, ?space]; subject: ?issuer; op: admin] => [allowed: true]
  Permission/_operations: [role: ?role] ⊆ decision.effectiveOperations
  scopes ⊆ {read, write, publish}
}
then {
  ApiToken/issue: [owner: ?issuer; tenant: ?tenant; space: ?space; name: ?name; scopes: ?scopes; expiry: ?expiry] => [metadata: ?token; secret: ?secret]
  Permission/grant: [resource: ?space; principal: ?token; role: ?role]
  Requesting/respond: [request: ?request; metadata: ?token; secret: ?secret]
}

mediator branch issueTokenRejected
when {
  Requesting/issueToken: [tenant: ?tenant; name: ?name; space: ?space; role: ?role; scopes: ?scopes; expiry: ?expiry] => [request: ?request]
  ApiToken/issue: [owner: ?issuer; tenant: ?tenant; space: ?space; name: ?name; scopes: ?scopes; expiry: ?expiry] => [error: InvalidScope | InvalidExpiry]
}
then {
  Requesting/respond: [request: ?request; error: ?error]
}

sync listTokens
// implementation: ListTokensUseCase#listTokens
when {
  Requesting/listTokens: [tenant: ?tenant; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  Session/_principal: [session: ?sid] => [principal: ?actor]
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  ApiToken/_ownedBy: [owner: ?actor; tenant: ?tenant; includeRevoked: false] => [owned: ?owned]
  Permission/_filter: [chains: Space/_listByTenant 的资源链; subject: ?actor; op: admin] => [spaces: ?administered]
}
then {
  对每个 administered space：ApiToken/_inSpace: [tenant: ?tenant; space: ?space; includeRevoked: false]
  Requesting/respond: [request: ?request; tokens: distinct(owned ∪ administered)]
}

sync revokeToken
// implementation: RevokeTokenUseCase#revokeToken
when {
  Requesting/revokeToken: [tenant: ?tenant; token: ?token] => [request: ?request]
}
where {
  Session/_principal: [session: ?sid] => [principal: ?actor]
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  ApiToken/_metadata: [token: ?token] => [owner: ?owner; tenant: ?tenant; space: ?space]
  ?actor = ?owner 或 Permission/_decide: [chain: [?tenant, ?space]; principal: ?actor; op: admin] => [allowed: true]
}
then {
  ApiToken/revoke: [token: ?token]
  Permission/clearPrincipal: [principal: ?token]
  Requesting/respond: [request: ?request]
}

mediator branch revokeTokenForbidden
when {
  Requesting/revokeToken: [tenant: ?tenant; token: ?token] => [request: ?request]
}
where {
  ApiToken/_metadata: [token: ?token] => [owner: ?owner; tenant: ?tenant; space: ?space]
  ?actor ≠ ?owner
  Permission/_decide: [chain: [?tenant, ?space]; principal: ?actor; op: admin] => [allowed: false]
}
then {
  Requesting/respond: [request: ?request; error: PermissionDenied]
}
```

三条入口都先过组合根 TenantAccess。issueTokenRejected 也覆盖 issuer 非 admin、role 不存在、
role 过高、ResourceChain miss。吊销读取 `_metadata` 为空或 tenant 错配时返回 404 token_not_found。

拒绝的 mediator branch 由所属入口直接翻译动作结果或条件失败，不对应独立 Java 方法；错误码、违反项和事务结果保持上述契约。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `IssueTokenUseCase.issueToken` | `credential: String, key: String, tenant: UUID, name: String, space: UUID, role: String, scopes: Set<String>, expiry: Instant` | `FlowResponse<ApiTokenTypes.IssuedToken>` |
| `ListTokensUseCase.listTokens` | `credential: String, tenant: UUID, cursor: String, requestedLimit: int` | `ApiTokenTypes.TokenPage` |
| `RevokeTokenUseCase.revokeToken` | `credential: String, tenant: UUID, tokenId: UUID` | `void` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `ApiTokenTypes.IssuedToken` | `id: UUID, name: String, ownerId: UUID, tenantId: UUID, spaceId: UUID, role: String, scopes: Set<String>, expiry: Instant, status: String, createdAt: Instant, secret: String` |
| `ApiTokenTypes.TokenPage` | `tokens: List<ApiTokenTypes.TokenView>, nextCursor: String, total: long` |
| `ApiTokenTypes.TokenView` | `id: UUID, name: String, ownerId: UUID, tenantId: UUID, spaceId: UUID, role: String, scopes: Set<String>, expiry: Instant, status: String, createdAt: Instant` |

<!-- interface-contract:end -->

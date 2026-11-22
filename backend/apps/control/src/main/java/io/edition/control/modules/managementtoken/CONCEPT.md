# concept ManagementToken [Owner, Tenant]

## purpose

让用户为管理自动化签发一个有期限、可撤销且进一步受限的个人凭据。

## state

owner: Token -> Owner
name: Token -> String
secretHash: Token -> Hash
scopes: Token -> set Scope
tenant: Token -> lone Tenant
expiry: Token -> Time
createdAt: Token -> Time
lastUsedAt: Token -> lone Time
revokedAt: Token -> lone Time

初态为空。scope 为封闭任务能力上限，非空；不创造身份、成员角色或资源权限。可选 tenant 仅收窄调用租户。明文为 spm_ + UUID + 32-byte-random，仅存随机段 SHA-256。到期时间必须在签发时刻后且至多 365 天；名称 strip 后 1 至 120 字符。

## actions

issue [owner: Owner; name: String; scopes: set Scope; tenant?: Tenant; expiry: Time] => [metadata: Metadata; secret: String]
  requires 名称、范围和到期时间有效
  ensures 新增未撤销凭据；明文仅从签发结果交付，不进入元数据或日志
issue [owner: Owner; name: String; scopes: set Scope; tenant?: Tenant; expiry: Time] => [error: InvalidScope]
  requires scopes 为空或含未知范围；状态不变
issue [owner: Owner; name: String; scopes: set Scope; tenant?: Tenant; expiry: Time] => [error: InvalidExpiry]
  requires expiry 不在 (now, now + 365 days]；状态不变
revoke [token: Token; owner: Owner] => []
  ensures 仅修改该 owner 的凭据；不存在或已撤销为 no-op，保留首次 revokedAt
revokeAll [owner: Owner] => []
  ensures 该 owner 的所有凭据永久撤销
eraseAll [owner: Owner] => []
  ensures 该 owner 的所有凭据永久撤销，name 与 secretHash 匿名化；保留稳定 id 审计锚
touch [token: Token] => []
  ensures 有效未撤销凭据记录最近使用时间，不恢复无效凭据

## queries

_authenticate [secret: String] => [authentication: Authentication]
  returns 格式、hash、expiry、revokedAt 全有效的 owner、tokenId、scopes、tenant、expiry；无匹配为 Invalid；纯只读
_ownedBy [owner: Owner; cursor?: String; limit: Int] => [page: Page]
  returns 该 owner 的脱敏元数据，包含 active/expired/revoked，按创建时刻与 id 倒序键集分页

## operational principle

after issue [owner: u; scopes: {content:read}; expiry: tomorrow] => [metadata: m; secret: s]
then _authenticate [secret: s] => [owner: u; token: m.id; scopes: {content:read}]
调用仍代表用户 u；实际用户有效性、成员和权限由组合层动态校验。

after revoke [token: m.id; owner: u] => []
then _authenticate [secret: s] => [authentication: Invalid]
另一个 owner 的 revoke 无法影响此凭据。

after revokeAll [owner: u] => []
then 所有旧明文均为 Invalid；后续用户恢复不恢复凭据。

after eraseAll [owner: u] => []
then 元数据仍保留稳定 id，但名称和秘密无法恢复。

## notes

Scope catalog 包含 content:read/write/publish、members:read/write、permissions:read/write、hosting:read/write、audit:read、operations:read/write、account:read/write、platform:read/write/erase。平台 scope 与 tenant 限制不可组合；签发检查交给 sync。未实现空间限制，不把租户限制描述为单空间限制。
认证不依赖 Session cookie。使用有效性、scope 与资源授权的交集；本概念不调用 User、TenantRegistry、Membership 或 Permission。秘密字段的 toString 固定脱敏。用户停用与擦除由跨概念 flow 调用 revokeAll/eraseAll。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `ManagementTokenApi.authenticate` | `secret: String` | `ManagementTokenApi.Authentication` |
| `ManagementTokenApi.eraseAll` | `owner: UUID` | `void` |
| `ManagementTokenApi.issue` | `owner: UUID, name: String, scopes: Set<ManagementTokenApi.Scope>, tenant: UUID, expiry: Instant` | `ManagementTokenApi.IssueResult` |
| `ManagementTokenApi.ownedBy` | `owner: UUID, cursor: String, limit: int` | `ManagementTokenApi.Page` |
| `ManagementTokenApi.revokeAll` | `owner: UUID` | `void` |
| `ManagementTokenApi.revoke` | `token: UUID, owner: UUID` | `void` |
| `ManagementTokenApi.touch` | `token: UUID` | `void` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `ManagementTokenApi.Authentication.Authenticated` | `id: UUID, ownerId: UUID, scopes: Set<ManagementTokenApi.Scope>, tenantId: UUID, expiry: Instant` |
| `ManagementTokenApi.Authentication.Invalid` | `[]` |
| `ManagementTokenApi.Authentication` | `ManagementTokenApi.Authentication.Authenticated / ManagementTokenApi.Authentication.Invalid` |
| `ManagementTokenApi.IssueResult.InvalidExpiry` | `[]` |
| `ManagementTokenApi.IssueResult.InvalidScope` | `[]` |
| `ManagementTokenApi.IssueResult.Issued` | `metadata: ManagementTokenApi.Metadata, secret: String` |
| `ManagementTokenApi.IssueResult` | `ManagementTokenApi.IssueResult.InvalidExpiry / ManagementTokenApi.IssueResult.InvalidScope / ManagementTokenApi.IssueResult.Issued` |
| `ManagementTokenApi.Metadata` | `id: UUID, ownerId: UUID, name: String, scopes: Set<ManagementTokenApi.Scope>, tenantId: UUID, expiry: Instant, createdAt: Instant, lastUsedAt: Instant, revokedAt: Instant` |
| `ManagementTokenApi.Page` | `items: List<ManagementTokenApi.Metadata>, nextCursor: String` |
| `ManagementTokenApi.Scope` | `CONTENT_READ / CONTENT_WRITE / CONTENT_PUBLISH / MEMBERS_READ / MEMBERS_WRITE / PERMISSIONS_READ / PERMISSIONS_WRITE / HOSTING_READ / HOSTING_WRITE / AUDIT_READ / OPERATIONS_READ / OPERATIONS_WRITE / ACCOUNT_READ / ACCOUNT_WRITE / PLATFORM_READ / PLATFORM_WRITE / PLATFORM_ERASE` |

<!-- interface-contract:end -->

租户限定令牌的 account:* 范围不能访问个人账号；签发边界拒绝该组合，客户端同样提前提示。

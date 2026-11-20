# concept ApiToken [Owner, Tenant, Space]

## purpose
让程序持有一个受限、可吊销且可独立授权的机器身份

## state
owner: Token -> Owner
tenant: Token -> Tenant
space: Token -> Space
secretHash: Token -> Hash
name: Token -> String
scopes: Token -> set {read, write, publish}
expiry: Token -> Time
revoked: Token -> Bool
createdAt: Token -> Time
revokedAt: Token -> lone Time

Token 由本概念创建。初态集合为空。owner/tenant/space/name/expiry/createdAt 均为每 Token 必选单值；每 Token 恰好一个非空 scopes 集合；name 先 strip 且须非空白。
owner 仅审计、可见性与 owner 吊销授权，不提供权限继承。secretHash 只存 32-byte 随机段的 SHA-256。scopes 是扁平 Operation 上限，不携带资源，禁止 admin。expiry 必填，签发时刻后至多 365 天。revoked 等价 revokedAt 有绑定。

## actions
issue [owner: Owner; tenant: Tenant; space: Space; name: String; scopes: set Scope; expiry: Time] => [metadata: Metadata; secret: String]
  requires scopes 非空且只含 read/write/publish，且 now < expiry ≤ now + 365 days
  ensures revoked=false；secret = "spc_" + token.id + "_" + 32-byte-random 的 base64url 无 padding（43 字符），明文由本次动作返回一次；secretHash = SHA-256(随机段)

issue [owner: Owner; tenant: Tenant; space: Space; name: String; scopes: set Scope; expiry: Time] => [error: InvalidScope]
  requires scopes 为空或不只含 read/write/publish
  ensures 返回 InvalidScope；状态不变

issue [owner: Owner; tenant: Tenant; space: Space; name: String; scopes: set Scope; expiry: Time] => [error: InvalidExpiry]
  requires expiry 不在 (now, now + 365 days] 内
  ensures 返回 InvalidExpiry；状态不变

revoke [token: Token] => []
  ensures revoked=true，保留元数据而不物理删除；不存在时幂等；重复吊销保留首次 revokedAt

anonymize [token: Token] => []
  ensures revoked=true、name="已注销令牌"、secretHash 替换为不可认证的随机墓碑值；保留 token/owner/tenant/space/scopes/expiry/createdAt/revokedAt；不存在时幂等

## operational principle
after issue [owner: u; tenant: tenant1; space: space1; name: "ci-docs"; scopes: {read, publish}; expiry: tomorrow] => [metadata: m; secret: s]
then _authenticate [secret: s] => [token: m.id; tenant: tenant1; space: space1; scopes: {read, publish}]
程序凭 secret 证明自己是这个受限身份，而不是签发者

after revoke [token: m.id] => []
then _authenticate [secret: s] => [error: Invalid]，且元数据仍可供审计查询
泄露可即刻止血

after anonymize [token: m.id] => []
then _authenticate [secret: s] => [error: Invalid]，且 _metadata [token: m.id] 仍可按稳定 id 审计

## queries
_authenticate [secret: String] => [token: Token; tenant: Tenant; space: Space; scopes: set Scope]
  returns 格式、tokenId、随机段 hash、expiry、revoked 全部有效时的绑定；principal = token 自身，而非 owner。无匹配为零行

_ownedBy [owner: Owner; tenant?: Tenant; includeRevoked: Bool] => [tokens: seq Metadata]
  returns 指定 tenant 时仅该租户，未指定时为 owner 的窄全局发现；includeRevoked=false 不隐藏已过期但未撤销 Token

_inSpace [tenant: Tenant; space: Space; includeRevoked: Bool] => [tokens: seq Metadata]
  returns 该空间内令牌

_metadata [token: Token] => [id: Token; owner: Owner; tenant: Tenant; space: Space; name: String; scopes: set Scope; expiry: Time; revokedAt: Time; createdAt: Time]
  returns 零或一绑定；issue 返回同一 Metadata 结构

_verifiers [tenant: Tenant] => [verifiers: seq Verifier]
  returns 当前 tenant 下 (token, tenant, space, secretHashHex, scopes, expiry, active)；不输出 secret 或 owner。受 RLS 约束，不开放 HTTP

## notes
tenant/space 真实归属是跨概念前置，由 token lifecycle sync 在调用 issue 前验证。
认证只返回 token 自身，外围将其识别为 TOKEN 独立机器主体；owner 只记录谁签发。
格式错误、不存在、hash 不匹配、过期与 revoked 对外合并为 Invalid；调用方行动相同。
最近使用时间走审计日志，保证 _authenticate 纯只读。
issue/revoke/anonymize 产生 Changed(token) 事件，在同事务更新交付权限和撤权屏障。
Java 模块不得依赖其他概念；Owner/Tenant/Space 是不透明实例化值。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `ApiTokenApi.anonymize` | `token: ApiTokenApi.TokenId` | `void` |
| `ApiTokenApi.authenticate` | `secret: String` | `ApiTokenApi.Authentication` |
| `ApiTokenApi.inSpace` | `tenant: UUID, space: UUID, includeRevoked: boolean` | `List<ApiTokenApi.Metadata>` |
| `ApiTokenApi.issue` | `owner: UUID, tenant: UUID, space: UUID, name: String, scopes: Set<ApiTokenApi.Scope>, expiry: Instant` | `ApiTokenApi.IssueResult` |
| `ApiTokenApi.metadata` | `token: ApiTokenApi.TokenId` | `Optional<ApiTokenApi.Metadata>` |
| `ApiTokenApi.ownedBy` | `owner: UUID, includeRevoked: boolean` | `List<ApiTokenApi.Metadata>` |
| `ApiTokenApi.ownedBy` | `owner: UUID, tenant: UUID, includeRevoked: boolean` | `List<ApiTokenApi.Metadata>` |
| `ApiTokenApi.revoke` | `token: ApiTokenApi.TokenId` | `void` |
| `ApiTokenApi.verifiers` | `tenant: UUID` | `List<ApiTokenApi.Verifier>` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `ApiTokenApi.Authentication.Authenticated` | `token: ApiTokenApi.TokenId, tenant: UUID, space: UUID, scopes: Set<ApiTokenApi.Scope>` |
| `ApiTokenApi.Authentication.Invalid` | `[]` |
| `ApiTokenApi.Authentication` | `ApiTokenApi.Authentication.Authenticated / ApiTokenApi.Authentication.Invalid` |
| `ApiTokenApi.IssueResult.InvalidExpiry` | `[]` |
| `ApiTokenApi.IssueResult.InvalidScope` | `[]` |
| `ApiTokenApi.IssueResult.Issued` | `metadata: ApiTokenApi.Metadata, secret: String` |
| `ApiTokenApi.IssueResult` | `ApiTokenApi.IssueResult.InvalidExpiry / ApiTokenApi.IssueResult.InvalidScope / ApiTokenApi.IssueResult.Issued` |
| `ApiTokenApi.Metadata` | `id: ApiTokenApi.TokenId, ownerId: UUID, tenantId: UUID, spaceId: UUID, name: String, scopes: Set<ApiTokenApi.Scope>, expiry: Instant, revokedAt: Instant, createdAt: Instant` |
| `ApiTokenApi.Scope` | `READ / WRITE / PUBLISH` |
| `ApiTokenApi.TokenId` | `value: UUID` |
| `ApiTokenApi.Verifier` | `id: UUID, tenant: UUID, space: UUID, hash: String, scopes: Set<ApiTokenApi.Scope>, expiry: Instant, active: boolean` |

<!-- interface-contract:end -->

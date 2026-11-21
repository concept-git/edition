# concept ReaderSecurity

## purpose

管理站点阅读会话和最近阅读历史，并随账号抹除同步清理。

## state

readerSessions: SessionId -> (site: SiteId, user: UserId, host: Host, accessHash: Hash, refreshHash: Hash, accessExpiry: Time, expiry: Time, readerEpoch: Long, endedAt: lone Time)
readerHistory: (SiteId, UserId, SpaceSlug) -> (pagePath: Path, viewedAt: Time)

Control 唯一写入主库 reader_state 会话和历史；User 与 Site 是不透明 ID。组合在 User 锁内验证当前账号状态/版本和站点，随后操作本概念；本概念不读取 User/Password/Site 状态。读取视图在同一快照中核对规范 User 和本概念的会话，不依赖 user_security 表或跨库查询函数。历史清理与账号擦除同事务，既有会话的迟到历史写入必须拒绝。

ReaderState/open 以已验证的账号版本签发站点与主域绑定的会话。access 与 refresh 只以哈希落库，轮换同时替换两个值，绝对期限不延长。ReaderState/lookup 只接受不透明凭据与站点绑定。历史按站点、用户和空间保留最新访问，最多返回 100 条。ReaderState/erase 清理该用户所有站点的会话和历史。

## actions

open [site: Site; user: UserId; epoch: Long] => [credentials: Credentials]
  ensures 签发绑定站点与账号版本的会话，只有凭据哈希落库
rotate [session: Session; refresh: Credential] => [credentials: lone Credentials]
  ensures 仅当前有效 refresh 能一次性替换两份凭据，绝对期限不变
end [site: Site; refresh: Credential] => []
  ensures 结束匹配该站点和凭据的会话；重复执行无额外效果
visit [site: Site; user: UserId; slug: SpaceSlug; path: Path] => []
  ensures 原子更新该空间的最近访问
erase [user: UserId] => []
  ensures 同一事务删除所有站点的该用户会话与历史

## operational principle

在当前 User 版本和站点内验证凭据，历史与会话写入使用同一主库事务。

## queries

lookup [site: Site; kind: Proof; credential: Credential] => [session: lone Session]
  returns 由站点、凭据哈希和有效期绑定的会话，供组合复核 User 版本
history [site: Site; user: UserId] => [entries: seq History]
  returns 指定站点与用户的最近访问，最多 100 项

## notes

身份的当前事实及撤销版本由 User 拥有。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `ReaderStateApi.end` | `site: ReaderStateApi.Site, refresh: String` | `void` |
| `ReaderStateApi.erase` | `user: UUID` | `void` |
| `ReaderStateApi.history` | `site: ReaderStateApi.Site, user: UUID` | `List<ReaderStateApi.History>` |
| `ReaderStateApi.lookup` | `site: ReaderStateApi.Site, kind: ReaderStateApi.Proof, credential: String` | `Optional<ReaderStateApi.Session>` |
| `ReaderStateApi.open` | `site: ReaderStateApi.Site, user: UUID, epoch: long` | `ReaderStateApi.Credentials` |
| `ReaderStateApi.rotate` | `session: ReaderStateApi.Session, refresh: String` | `Optional<ReaderStateApi.Credentials>` |
| `ReaderStateApi.visit` | `site: ReaderStateApi.Site, user: UUID, slug: String, path: String` | `void` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `ReaderStateApi.Credentials` | `access: String, refresh: String, expiresAt: Instant` |
| `ReaderStateApi.History` | `spaceSlug: String, pagePath: String, viewedAt: Instant` |
| `ReaderStateApi.Proof` | `ACCESS / REFRESH` |
| `ReaderStateApi.Session` | `id: UUID, site: ReaderStateApi.Site, user: UUID, epoch: long, expiresAt: Instant` |
| `ReaderStateApi.Site` | `id: UUID, host: String` |

<!-- interface-contract:end -->

当前身份查询和撤销版本属于 User；本概念不提供用户屏障、重新投影或跨库身份修复。

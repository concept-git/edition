# syncs: Space（组合根）

> sync 按概念分组拆包（分组无架构语义，flow 是拆解原子）。本文件保留全局资产：
> app 组合（类型参数实例化）、guard 模板、管理杂项模板与全局排除动作。

## 分包索引

| 包 | flow |
| --- | --- |
| [platform/SYNCS.md](platform/SYNCS.md) | 租户开通与冻结（平台运维面入口；`platform.tenantregistry` 是 TenantRegistry 平台概念） |
| [iam/SYNCS.md](iam/SYNCS.md) | 注册与激活、登录与会话、本人账户与设备、账户安全联动、用户注销（合规删除）、成员与邀请、API 令牌生命周期 |
| [authoring/SYNCS.md](authoring/SYNCS.md) | 空间管理、页面创作（authored 空间）、目录编排、删除与恢复 |
| [releases/SYNCS.md](releases/SYNCS.md) | 发版组索引（发布 / 持续导入 / 便携导出） |
| [releases/release/SYNCS.md](releases/release/SYNCS.md) | 发布（wiki 模式自动发版 / 发布制手动构建）及共享发版流水线 |
| [releases/bundleimport/SYNCS.md](releases/bundleimport/SYNCS.md) | 持续导入与发版流水线（synced 空间） |
| [hosting/SYNCS.md](hosting/SYNCS.md) | 阅读投影发布 / 重组重定向 / 站内搜索 / 域名 / 私有阅读身份；生产阅读规则在 space-content |
| 本文件 | 管理杂项（索引模板，不是 flow；禁止再创建 AdminMiscSyncs） |

## 管理 HTTP 部分响应

GET JSON 读取可声明可选 `fields` 参数，在原 flow 的授权、资源过滤和读取完成后投影响应。
投影仅减少传输字段，不改变当前权限，不增加可读资源，不参与写入语义；未传 fields 保持完整响应。
掩码接受逗号、`a/b`、`a(b,c)` 和受限 `*`，深度、长度与字段数有界；未知字段或非法表达式返回 validation_failed。
数组保持顺序与页结构；需要继续分页时客户端须请求 nextCursor。动态 map 应选择整个 map，不将任意 key 当成固定字段路径。
返回 schema 同时声明完整类型与允许省略字段的投影类型，包括声明在通配媒体类型下的 JSON DTO；字段投影后仍保留完整资源的强 ETag 供条件写入使用。
二进制、认证秘密和非 GET 写接口不声明 fields；不以 ResponseBodyAdvice 绕过原鉴权链。

## app 组合（类型参数实例化）

```text
app Space

  Principal  = User.User | Team | ApiToken.Token | anonymous
  ResourceId = Tenant | Team.Team | Site.Site | Space.Space | Page.Page   // 稳定 id，绝不用 slug
                                                       // Tenant 是身份类型；登记行为属于 TenantRegistry 平台概念，
                                                       // 作为判定链最外层参与授权并不赋予身份本身状态机

  include User
  include Password  [User.User]
  include Session   [Principal]
  include ApiToken  [User.User, Tenant, Space.Space]   // owner、单一租户、单一空间；Token 自身进入 Principal
  include ManagementToken [User.User, Tenant]          // 用户凭据与可选租户上限；仍代表 User
  include Team      [Tenant]
  include Membership [Tenant, User.User]               // 租户成员
  include Membership [Team, User.User]                 // 用户组
  include Permission [ResourceId, Principal]
  include Space     [Page.Page]
  include Page      [Format = markdown | html | …]
  include Revision  [Page.Page, Content]
  include Toc       [Page.Page]                        // 每空间一棵
  include Collection [Space.Space]
  include Tag       [Page.Page]
  include Release   [Space.Space, Bundle]
  include Site      [Space.Space]
  include CustomDomain [Site.Site]
  include Redirect  [Site.Site, Space.Space | Page.Page]
  include Search    [Site.Site]                                  // Scope 实例化为站点，持有检索配置
```

## 通用前置：guard 模板

所有管理面 Requesting 动作共享鉴权接力，下文以 `guard(chain, op)` 速记：

```text
where credential经管理鉴权解析sid；Session._principal(sid):(p)
      或 ManagementToken._authenticate (secret) : (owner = p, scopes, tenant?)，User active/verified，HTTP task scope 与 tenant 限制允许
      或 ApiToken._authenticate (secret) : (p = token, scopes)，
         principalType(p) = TOKEN，且 requested op ∈ scopes
      Tenant._status (chain 首层租户) ≠ suspended
      Permission._decide (chain, p, op) : (allow)
```

ApiToken 分支的最终条件是 **token 自身 grant 允许 AND requested op 在 scopes 中**。
`scopes` 是封闭的扁平 Operation 上限，只允许 `read/write/publish`，不携带资源且禁止 `admin`；
owner 不进入判定、无权限继承。chain 的 tenant/space 必须与 token 的唯一绑定一致。

ManagementToken 不加入 Principal 枚举，仍使用 owner 的 USER 主体和当前成员/资源授权。管理 PAT 的 HTTP handler 必须显式登记 task scope；未知 handler 默认拒绝，非资源入口也须覆盖。TenantAccess 在成员准入前校验可选 tenant 限制。凭据生命周期和本人密码证明操作只接受 Session，PAT 不可自我扩权。

- `chain` 为稳定 id 的有序资源链，**最外层是租户根**：`[tenantId, siteId, spaceId, pageId]`。
  租户 admin 因此自动继承下层全部管理权，可被下层 grant/restrict 覆盖（ADR-0003 的
  最近祖先判定天然支持）——否则开通后 owner 对站点空间零权限，得自己给自己授权。
- **租户准入与真实资源链**：Tenant 作用域管理入口中，Session 主体必须是该 Tenant 的成员；
  TOKEN 主体必须匹配唯一 tenant/space binding；平台运营员无隐式租户权限。任何 guard 之前先由
  资源查询核对父子归属，禁止把 URL 中任意 id 拼成一条可继承的伪链。路径 tenant 与资源归属不符
  对外按 not-found 收口，存在但无权限才是 403。
- **归档 Space 全局前置**：凡 mutation 的目标是 Space 或其后代，默认先匹配
  `Space._status(space)=active`；归档时只允许 read/export/restore/delete、site unmount、
  必要系统清理，以及 ACL 的**单调收紧**（写 `none`、首次启用 restriction、缩小已有名单）；
  revoke、正向 grant、扩大名单与 unrestrict 统一输出 `space_archived`。
- 冻结检查在 guard 内单点执行、不可绕过：链首租户 `suspended` → 403 `tenant_suspended`；
  平台运维面（`/admin`、`/ops`）豁免，且不走资源链（见 platform/SYNCS.md 的
  `platformOperator` 模板）。
  **当前覆盖范围**：只有以租户根开头的链会被检查。已落地的租户作用域 flow（成员与邀请、
  Team 管理、API 令牌、空间管理、页面创作）一律经组合根 `TenantAccess` 进入，链首恒为租户根；
  Delivery 组的管理写入口也经此准入；独立读者投影按 ADR-0022/0024 判权，租户冻结的读侧扩展不在当前裁决范围。
- **组合根共用件**（各 flow 不得重复实现）：`PrincipalResolution` 一次请求只解析一次主体；
  `PermissionGuard` 负责 scope→binding→冻结→判权，并自带链首租户的事务作用域；
  `TenantAccess` 负责租户准入（存在、未冻结、Session 须为成员 / TOKEN 须匹配 binding）、
  批量 `Permission.filter` 与 `inTenant`；`ResourceChain` 负责「真实资源链」核对
  （space 属于该 tenant、page 挂在该 space 且带 slug、collection 属于该 tenant），只答 found 与否，不抛 flow 异常——
  Token 路径 miss 仍由各 flow 映射 400 `tenant_space_mismatch`，Page 路径 miss 映射 404
  `page_not_found` / `space_not_found`，Collection 路径 miss 映射 404 `collection_not_found`；`AuthoringWrites` 负责「authored 工作区可写」
  （archived → `space_archived`，mode ≠ authored → `space_mode_restricted`，异常类在组合根）；
  `IdempotentFlowExecutor` + `FlowResponse` 负责幂等执行与可重放响应；键集游标用
  `shared.KeysetCursor`。禁止 `*Support` / `*Helper` 杂物抽屉；flow 的 `*Access` 只做
  本 flow 权限投影。
- **读者面读取**：独立 reader 不走管理面 `PermissionGuard`，也不访问源库。
  `ReaderAccess` / `ReaderPermissionPolicy` 消费 serving 权限投影与 reader-state 会话安全头；明确主体不存在匹配规则时才可按匿名集合判定，
  显式 `none`、restriction 失败、过期或不可确认身份不回落。链为 `[tenant, site, space, page]`。
  线上请求只由独立 Reader 按当前策略授权（ADR-0028）。
- `_decide : (deny)` 统一响应 403（各 flow 不再重复这条错误 sync）。
- **gateway 不构造链**：`gateway` 的 allowedDependencies 只有 `shared` 与 `syncs`，
  看不见 `Permission.Resource` 等概念值类型。因此 controller 只传 `tenantId` 一类裸 id 与
  credential，链的构造与 guard 调用全在 sync 内部——这也正是"端点只挂 flow"的落地形态。
- **授权约束落点**：应用只为站点、空间资源接 `Permission.grant` 的入口，只为页面接
  `Permission.restrict` 的入口——Permission 概念本身通用，"页面只收窄"是组合层决定。
- **主体闭包**：Session User 在进入租户作用域时一次性展开为 `{User + 当前租户 Teams}`。
  判定从资源链内层向外选择首个存在匹配 grant 的层；该层有 User 直接规则时优先，否则合并
  Team operations。每层 restriction 与完整闭包求交。Token/anonymous 仍是单主体。
- **ACL 元权限**：tenant-root admin 或目标 Space admin 可管理 Space grant 与 Page restriction；
  tenant-root admin 或目标 Site admin 可管理 Site grant。
  Page restriction 不参与该管理判定。root 救援只允许修复 ACL，不赋予正文读取能力。
- 角色 catalog 固定为 `admin/maintainer/author/reader/none`，运行时不开放 `defineRole`。

---

## 管理杂项（索引模板，不是 flow）

本表只记录尚未拆成独立 flow 的管理动作。**禁止再创建 `AdminMiscSyncs`**；每行随对应票
建 `syncs/<组>/<flow>/` 浅包。已落地的行划掉并指向真实 flow。

以下动作共用同一形态：`Requesting.<动作> → guard(相应链, 相应 op) → 概念动作 →
错误 case 统一映射 409/422`。逐条列举以满足"未提及即排除"的核查：

| 概念动作 | guard 链 / op |
| --- | --- |
| ~~Site.create/rename/setRule/setHome/reorder/setBranding/setLocale/setAnalytics/setRobots/mount/unmount~~ | 已由 [hosting/site/SYNCS.md](hosting/site/SYNCS.md) 显式承接（票 21）；create 为 [tenant]/admin，其余写为 [tenant, site]/admin；TOKEN 不可写 |
| ~~Space.create/rename/describe/archive/restore~~ | 已由 [authoring/space/SYNCS.md](authoring/space/SYNCS.md) 显式承接；create 为 [tenant]/admin，其余写为 [tenant, space]/admin |
| ~~Space.convert（authored→synced 前置——已有 live 快照——在 where 段判定）~~ | 已由 [authoring/space/SYNCS.md](authoring/space/SYNCS.md) 显式承接（票 18）；[tenant, space] / admin |
| ~~Collection.create/rename/move/place/remove~~ | 已由 [authoring/collection/SYNCS.md](authoring/collection/SYNCS.md) 显式承接（票 16）；租户根 / admin，GET 为租户准入；超深→422；非空删组→409 |
| ~~Toc.addEntry/move/relabel/remove~~ | 已由 [authoring/tocediting/SYNCS.md](authoring/tocediting/SYNCS.md) 显式承接（票 14）；管理面链为 [tenant, space] / write，Site 不参与；超深→422；**synced 空间禁用** |
| ~~Tag.tag/untag/rename~~ | 已由 [authoring/tagging/SYNCS.md](authoring/tagging/SYNCS.md) 显式承接（票 15）；tag/untag 为 [tenant, space, page] / write，rename 为 [tenant] / admin；Site 不参与 |
| ~~Page.rename/setSeo/setProperty/removeProperty/attach/detach~~ | 已由 [authoring/pageediting/SYNCS.md](authoring/pageediting/SYNCS.md) 显式承接（票 11/13）；管理面链为 [tenant, space, page] / write，Site 不参与 |
| ~~Permission.grant/revoke/restrict/unrestrict/defineRole~~ | Space/Page 入口已由 [permission/SYNCS.md](authoring/permission/SYNCS.md) 显式承接；Site 入口同包随票 21（`listSitePermissions` / `putSiteGrant` / `deleteSiteGrant` / `explainSiteAdmin`）；`defineRole` 不开放运行时入口 |
| ~~Release.setRetention/setLabel/annotate、Release.export（只读）~~ | 已由 [releases/release/SYNCS.md](releases/release/SYNCS.md) 显式承接（票 19）；setRetention/patch 为 [tenant, space] / admin，export要求publish且逐页当前归属read |
| ~~CustomDomain.setPrimary/unbind~~ | 已由 [hosting/customdomain/SYNCS.md](hosting/customdomain/SYNCS.md) 显式承接（票 22）；写为 [tenant, site]/admin；TOKEN 不可写 |
| ~~Membership.add/remove/setRole/revokeInvite~~ | 已由 [iam/SYNCS.md](iam/SYNCS.md) 的「成员与邀请」flow 显式承接（票 05），不再走本模板；`add` 无直加入口，只由platform.seatOwner及Team创建时落首owner使用 |
| TenantRegistry.rename（平台概念，租户 admin 自助改名）——**不随票 21**；另开租户设置票 | [tenant] / admin |
| ~~Page.setIcon~~、~~Collection.setIcon~~、Search.configureBoost | Page.setIcon 已由 pageediting 承接（票 13）；Collection.setIcon 已由 collection 的 patchCollection 承接（票 16）；Search 随运维 |
| ~~ApiToken.issue/revoke~~ | 已由 [iam/apitoken/SYNCS.md](iam/apitoken/SYNCS.md) 的「API 令牌生命周期」flow 显式承接（票 07）；原子签发、可见性与吊销不再走本模板 |
| User.updateProfile、Session.end（踢设备） | 本人 |

**全局不开放Requesting直通入口的系统动作**：`Revision.record`（仅 saveRevision 触发，否则历史可伪造）、
`Release.prune`（仅 retention 触发，手工清理走运维面且有审计）、
`Page.purge`（仅由 termination 的受保护扫描调用；扫描可定时或经运维授权触发）。

## 实现记法与事务绑定

规则体用餐厅范例的 `when { }` / `where { }` / `then { }` 与 `Concept/action: [具名: ?变]`。
`sync Name` 必须对应同包 `*Syncs` 的同名方法（含 private）；没有方法的拒绝臂写 `mediator branch`，不升格为 `syncs`。

**顺序 then 是本地扩展，不是论文因果引擎**：实现是同步 Java 调用栈，同一条 `then` 可以按书写顺序调用并绑定本次输出（`=> [page: ?page]`），再立刻把 `?page` 传给下一调用。这不表示并行 then 可以读取尚未发生的输出。已拆成独立方法的完成接力（如 `login` / `loginSucceeded`）仍按餐厅范例写成后一条 `when` 匹配前一条完成。

`where` 中的 query 不产生完成事件。`guard` / `TenantAccess` / `ResourceChain` / `AuthoringWrites` 是组合根模板，写在 where，不是概念动作。Requesting 凭据先由 gateway/`PrincipalResolution` 解析，`Session/_principal` 接收 session 身份，非原始凭据。具体入口/参数/结果由各包接口映射完整列出。

## 稳定文本约定

角色、状态、格式等枚举的对外文本与幂等指纹使用 `Locale.ROOT` 大小写转换，不能随运行主机的语言区域改变。

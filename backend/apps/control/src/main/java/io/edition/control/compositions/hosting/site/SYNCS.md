# syncs: 站点管理

目的：租户管理员创建站点；站点 admin 挂载空间、排序、配置品牌/TDK/locale/analytics/robots，
删除由authoring/termination承接，域名在该终结事务内清理。remount+Redirect、
搜索重建、级联解绑不在本 flow。

入口：`Requesting.createSite / listSites / viewSite / updateSite / mountSpace /
unmountSpace / reorderMounts`。

共同前置：

- Session User 必须是当前 Tenant member；TOKEN 一律 403（写与 ACL 均不可）。
- create 为 `[tenant]/admin`；其余 mutation 为 `[tenant, site]/admin`；详情
  `[tenant, site]/read`；列表 membership 准入后 `Permission.filter([tenant, site], read)`。
- 路径 tenant 与站点不符 → 404 `site_not_found`；存在但无权 → 403。
- 新挂载的空间必须属于该租户且 active；归档空间只允许 unmount。
- 变更经 ADR-0016 执行器；PATCH 权威 merge-patch。

```text
sync createSite
// implementation: CreateSiteUseCase#createSite
when {
  Requesting/createSite: [tenant: ?tenant; name: ?name] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  guard: [chain: [?tenant]; op: admin]
}
then {
  Site/create: [actor: ?actor; tenant: ?tenant; name: ?name] => [site: ?site]
}

sync listSites
// implementation: ListSitesUseCase#listSites
when {
  Requesting/listSites: [tenant: ?tenant; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  Site/_pageByTenant: [tenant: ?tenant; cursor: ?cursor; limit: ?limit] => [sites: ?sites; nextCursor: ?next]
  Permission/_filter: [chains: 各 [?tenant, ?site]; subject: ?actor; op: read] => [sites: ?readable]
}
then {
  Requesting/respond: [request: ?request; items: ?readable; nextCursor: ?next; total: null; allowedActions: ?actions]
}

sync viewSite
// implementation: ViewSiteUseCase#viewSite
when {
  Requesting/viewSite: [tenant: ?tenant; site: ?site] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
  guard: [chain: [?tenant, ?site]; op: read]
}
then {
  Site/_view: [site: ?site]
}

sync listSpaceMounts
// implementation: ListSpaceMountsUseCase#listSpaceMounts
when {
  Requesting/listSpaceMounts: [tenant: ?tenant; space: ?space] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
  guard: [chain: [?tenant, ?space]; op: read]
  Site/_mountsOf: [target: ?space] => [occurrences: ?mounts]
}
then {
  CustomDomain/_primaryOf: [target: ?site] => [host: ?primary]
  Requesting/respond: [request: ?request]
}

sync updateSite
// implementation: UpdateSiteUseCase#updateSite
when {
  Requesting/updateSite: [tenant: ?tenant; site: ?site; mergePatch: ?patch] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
  guard: [chain: [?tenant, ?site]; op: admin]
}
then {
  // omitted=保持、null=清空、值=替换；空 patch → 422
  Site/rename: [actor: ?actor; site: ?site; name: ?name]
  Site/setTitleTemplate: [actor: ?actor; site: ?site; template: ?template]
  Site/setBranding: [actor: ?actor; site: ?site; branding: ?branding]
  Site/setLocale: [actor: ?actor; site: ?site; locale: ?locale]
  Site/setAnalytics: [actor: ?actor; site: ?site; analyticsId: ?analyticsId]
  Site/setRobots: [actor: ?actor; site: ?site; policy: ?policy]
  Site/setHome: [actor: ?actor; site: ?site; target: ?home]
  Site/setRule: [actor: ?actor; site: ?site; rule: ?rule]
  // rule 仅 `/{slug}/{itemPath}`；home 必须已挂载否则 422 home_not_mounted
}

sync mountSpace
// implementation: MountSpaceUseCase#mountSpace
when {
  Requesting/mountSpace: [tenant: ?tenant; site: ?site; slug: ?slug; space: ?space] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
  ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
  guard: [chain: [?tenant, ?site]; op: admin]
  Space/_status: [space: ?space] => [status: active]
}
then {
  Site/mount: [actor: ?actor; site: ?site; target: ?space; slug: ?slug]
}

sync unmountSpace
// implementation: UnmountSpaceUseCase#unmountSpace
when {
  Requesting/unmountSpace: [tenant: ?tenant; site: ?site; slug: ?slug] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
  guard: [chain: [?tenant, ?site]; op: admin]
}
then {
  Site/unmount: [actor: ?actor; site: ?site; slug: ?slug]
}

sync reorderMounts
// implementation: ReorderMountsUseCase#reorderMounts
when {
  Requesting/reorderMounts: [tenant: ?tenant; site: ?site; slugs: ?slugs] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
  guard: [chain: [?tenant, ?site]; op: admin]
}
then {
  Site/reorder: [actor: ?actor; site: ?site; order: ?slugs]
}
```

错误与调用方行动：

| 条件 | HTTP / code |
| --- | --- |
| 站点不存在或路径 tenant 错配 | 404 `site_not_found` |
| 存在但 guard 拒绝；TOKEN 写站点 | 403 `permission_denied` |
| 名称非法 | 422 `site_name_invalid` |
| 空 patch / 非法 rule / 字段形态 | 422 `validation_failed` |
| branding URL/色值非法 | 422 `branding_invalid` |
| 挂载 slug 非法 | 422 `slug_invalid` |
| 站内 slug 已被占用 | 409 `slug_taken` |
| 同站已挂该空间 | 409 `space_already_mounted` |
| 空间不在该租户 | 404 `space_not_found` |
| 归档空间新挂 | 409 `space_archived` |
| home 未挂载 | 422 `home_not_mounted` |
| 排序不是当前挂载全排列 | 422 `order_invalid` |
| 有挂载时删站 | 409 `site_not_empty` |
| 同键异请求 | 409 `idempotency_key_reused` |

列表/详情投影由 sync 组合。`domains[]` 来自 CustomDomain._activeHostsOf（无 token）。
能力为服务端计算的 Permission 交集，前端只消费 `allowedActions`。
`delete` capability只表示admin权限；有挂载时终结返回409 site_not_empty，域名由终结事务清理。

删除规范唯一来源为authoring/termination/SYNCS.md。

资源关联写入与终结共享实体行锁；锁后重新确认资源存在与状态，顺序为Space先于Page/Site，避免晚到授权、挂载或域名绑定在删除后恢复。

前端创建旅程：成功响应是已提交事实；列表刷新、导航或后续查询失败不得改写为创建失败。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `CreateSiteUseCase.createSite` | `credential: String, tenant: UUID, name: String, key: String` | `FlowResponse<SiteTypes.SiteDetail>` |
| `ListSitesUseCase.listSites` | `credential: String, tenant: UUID, cursor: String, limit: int` | `SiteTypes.SitePage` |
| `ListSpaceMountsUseCase.listSpaceMounts` | `credential: String, tenant: UUID, space: UUID` | `List<SiteTypes.SpaceMount>` |
| `MountSpaceUseCase.mountSpace` | `credential: String, tenant: UUID, site: UUID, slug: String, space: UUID, key: String` | `FlowResponse<SiteTypes.SiteDetail>` |
| `ReorderMountsUseCase.reorderMounts` | `credential: String, tenant: UUID, site: UUID, slugs: List<String>, key: String` | `FlowResponse<SiteTypes.SiteDetail>` |
| `UnmountSpaceUseCase.unmountSpace` | `credential: String, tenant: UUID, site: UUID, slug: String, key: String` | `FlowResponse<SiteTypes.SiteDetail>` |
| `UpdateSiteUseCase.updateSite` | `credential: String, tenant: UUID, site: UUID, patch: SiteTypes.UpdatePatch, key: String` | `FlowResponse<SiteTypes.SiteDetail>` |
| `ViewSiteUseCase.viewSite` | `credential: String, tenant: UUID, site: UUID` | `SiteTypes.SiteDetail` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `SiteTypes.Action` | `CREATE / READ / UPDATE / MOUNT / UNMOUNT / REMOUNT / REORDER / DELETE / MANAGE_PERMISSIONS` |
| `SiteTypes.Branding` | `logo: String, favicon: String, primaryColor: String` |
| `SiteTypes.Domain` | `host: String, verified: boolean, isPrimary: boolean` |
| `SiteTypes.Mount` | `spaceId: UUID, slug: String` |
| `SiteTypes.SiteDetail` | `id: UUID, tenantId: UUID, name: String, rule: String, home: UUID, robotsPolicy: String, titleTemplate: String, branding: SiteTypes.Branding, locale: String, analyticsId: String, mounts: List<SiteTypes.Mount>, domains: List<SiteTypes.Domain>, createdAt: Instant, createdBy: UUID, updatedAt: Instant, updatedBy: UUID, allowedActions: List<SiteTypes.Action>` |
| `SiteTypes.SitePage` | `items: List<SiteTypes.SiteSummary>, nextCursor: String, total: Long, allowedActions: List<SiteTypes.Action>` |
| `SiteTypes.SiteSummary` | `id: UUID, tenantId: UUID, name: String, rule: String, home: UUID, robotsPolicy: String, domains: List<SiteTypes.Domain>, createdAt: Instant, createdBy: UUID, updatedAt: Instant, updatedBy: UUID, allowedActions: List<SiteTypes.Action>` |
| `SiteTypes.SpaceMount` | `siteId: UUID, siteName: String, slug: String, primaryHost: String` |
| `SiteTypes.UpdatePatch` | `name: SitePatch.Change<String>, titleTemplate: SitePatch.Change<String>, branding: SitePatch.BrandingChange, locale: SitePatch.Change<String>, analyticsId: SitePatch.Change<String>, robotsPolicy: SitePatch.Change<String>, home: SitePatch.Change<UUID>, rule: SitePatch.Change<String>` |

<!-- interface-contract:end -->

## 管理凭据能力约束

`allowedActions` 是当前资源授权、业务状态、PAT task scope 与租户边界的交集。会话保持原有能力；PAT 的读取范围不隐含写入、发布或权限管理范围。管理 scope catalog 与网关及生成命令契约共用。预演只读观察不锁定执行，写入仍重新校验授权、ETag 与业务前置条件。

跨站点域名索引的管理能力同样与 hosting:write 相交。

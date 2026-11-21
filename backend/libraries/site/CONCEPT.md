# concept Site [Target]

## purpose
把选定的一组目标编成一个对外站点，并守护站内地址名

## state
tenant: Site -> one Tenant
name: Site -> String
rule: Site -> PathRule
mounts: Site -> Slug -> lone Target
occupied: Site -> Target -> lone Slug
order: Site -> seq Slug
home: Site -> lone Target
titleTemplate: Site -> lone String
branding: Site -> (logo, favicon, primaryColor)
locale: Site -> lone Locale
analyticsId: Site -> lone String
robotsPolicy: Site -> {index, noindex}

PathRule 唯一合法值 `/{slug}/{itemPath}`。挂载表站内唯一。同一目标在同一站点只能出现一次。home 必须是当前挂载之一。非空 titleTemplate 恰好一个 `%s`。

## actions
create [actor: ActorId; tenant: Tenant; name: String] => [site: Site]
  ensures 创建站点。名称不合法是编程错误，不进本动作 error case

rename [actor: ActorId; site: Site; name: String] => [site: Site]
  requires site 存在
  ensures 更新 name

rename [actor: ActorId; site: Site; name: String] => [error: NotFound]

setRule [actor: ActorId; site: Site; rule: PathRule] => [site: Site]
  requires site 存在且 rule 为默认值
  ensures 写入 rule

setRule [actor: ActorId; site: Site; rule: PathRule] => [error: InvalidRule]
setRule [actor: ActorId; site: Site; rule: PathRule] => [error: NotFound]

setHome [actor: ActorId; site: Site; target?: Target] => [site: Site]
  requires site 存在且 target 为空或已挂载
  ensures 设置或清空 home

setHome [actor: ActorId; site: Site; target?: Target] => [error: HomeNotMounted]
setHome [actor: ActorId; site: Site; target?: Target] => [error: NotFound]

setBranding [actor: ActorId; site: Site; branding: Branding] => [site: Site]
  ensures 原样保存可选品牌字符串；持久化转义不改变字符内容，空字符串与未设置可区分
setBranding [actor: ActorId; site: Site; branding: Branding] => [error: NotFound]

setTitleTemplate [actor: ActorId; site: Site; template?: String] => [site: Site]
  requires 空值或恰好一个 `%s`
  ensures 空值清除模板

setTitleTemplate [actor: ActorId; site: Site; template?: String] => [error: InvalidTitleTemplate]
setTitleTemplate [actor: ActorId; site: Site; template?: String] => [error: NotFound]

setLocale [actor: ActorId; site: Site; locale?: Locale] => [site: Site]
setLocale [actor: ActorId; site: Site; locale?: Locale] => [error: NotFound]

setAnalytics [actor: ActorId; site: Site; analyticsId?: String] => [site: Site]
setAnalytics [actor: ActorId; site: Site; analyticsId?: String] => [error: NotFound]

setRobots [actor: ActorId; site: Site; policy: RobotsPolicy] => [site: Site]
setRobots [actor: ActorId; site: Site; policy: RobotsPolicy] => [error: NotFound]

mount [actor: ActorId; site: Site; target: Target; slug: Slug] => [site: Site]
  requires site 存在，slug 合法且未被占用，target 尚未挂在本站
  ensures 写入挂载

mount [actor: ActorId; site: Site; target: Target; slug: Slug] => [error: NotFound]
mount [actor: ActorId; site: Site; target: Target; slug: Slug] => [error: SlugTaken]
mount [actor: ActorId; site: Site; target: Target; slug: Slug] => [error: SlugInvalid]
mount [actor: ActorId; site: Site; target: Target; slug: Slug] => [error: TargetAlreadyMounted]

remount [actor: ActorId; site: Site; slug: Slug; newSlug: Slug] => [site: Site]
  requires 原 slug 存在，newSlug 合法且未被占用
  ensures 改挂载地址名

remount [actor: ActorId; site: Site; slug: Slug; newSlug: Slug] => [error: NotFound]
remount [actor: ActorId; site: Site; slug: Slug; newSlug: Slug] => [error: MountMissing]
remount [actor: ActorId; site: Site; slug: Slug; newSlug: Slug] => [error: SlugTaken]
remount [actor: ActorId; site: Site; slug: Slug; newSlug: Slug] => [error: SlugInvalid]

unmount [actor: ActorId; site: Site; slug: Slug] => [site: Site]
  requires site 存在
  ensures 缺失 slug 幂等成功；若卸的是 home 则 home 清空

unmount [actor: ActorId; site: Site; slug: Slug] => [error: NotFound]

reorder [actor: ActorId; site: Site; order: seq Slug] => [site: Site]
  requires order 恰为当前挂载集合的排列
  ensures 重写 order

reorder [actor: ActorId; site: Site; order: seq Slug] => [error: OrderInvalid]
reorder [actor: ActorId; site: Site; order: seq Slug] => [error: NotFound]

delete [actor: ActorId; site: Site] => []
  requires site 存在且 mounts 为空
  ensures 删除站点

delete [actor: ActorId; site: Site] => [error: NotEmpty]
delete [actor: ActorId; site: Site] => [error: NotFound]

## operational principle
after create [actor: a; tenant: t; name: "Acme Docs"] => [site: s]
after mount [actor: a; site: s; target: target; slug: "api"] => [site: s]
after setHome [actor: a; site: s; target: target] => [site: s]
then _targetAt [site: s; slug: "api"] => [target: target]，_view [site: s] 的 home=target
选定目标获得站内地址并成为站点入口

after remount [actor: a; site: s; slug: "api"; newSlug: "developers"] => [site: s]
then _targetAt [site: s; slug: "developers"] => [target: target]，_targetAt [site: s; slug: "api"] 为零行
挂载表守护站内地址唯一性

after setBranding [actor: a; site: s; branding: b] => [site: s]
after setTitleTemplate [actor: a; site: s; template: "%s | Acme Docs"] => [site: s]
then _view [site: s] 读回品牌与标题模板
一组目标对外呈现为同一个站点外观

after mount [actor: a; site: s; target: target; slug: "api"] => [site: s]
after mount [actor: a; site: s; target: target; slug: "docs"] => [error: TargetAlreadyMounted]
then 同一站点内一个目标只占一个 slug

## queries
_view [site: Site] => [name: String; rule: PathRule; home: Target; titleTemplate: String; branding: Branding; locale: Locale; analyticsId: String; robotsPolicy: RobotsPolicy; mounts: seq Mount]
  returns 零或一绑定

_listByTenant [tenant: Tenant] => [sites: seq View]
  returns 该租户全部站点

_pageByTenant [tenant: Tenant; cursor: String; limit: Int] => [sites: seq View; nextCursor: String]
  returns 键集页

_tenantOf [site: Site] => [tenant: Tenant]
  returns 零或一绑定

_targetAt [site: Site; slug: Slug] => [target: Target]
  returns 零或一绑定

_mounts [site: Site] => [mounts: seq Mount]
  returns 有序的 slug -> target 表

_mountsOf [target: Target] => [occurrences: seq (site: Site, slug: Slug)]
  returns 该目标出现在哪些站点

_slugOf [site: Site; target: Target] => [slug: Slug]
  returns 零或一绑定

_lock [site: Site] => [view: View]
  returns 生命周期组合与挂载写入共用同一行锁；不存在为零行

## notes
实例化 Target=空间。slug 是挂载点而非目标的内在属性。自有域名由独立概念承担。
PathRule 本期冻结为默认值。站点根路径 `/` 由组合层 serveHome 解释。
Java 模块不得依赖其他概念。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `SiteApi.create` | `actor: SiteApi.ActorId, tenantId: UUID, name: String` | `SiteApi.View` |
| `SiteApi.delete` | `actor: SiteApi.ActorId, site: SiteApi.SiteId` | `SiteApi.DeleteResult` |
| `SiteApi.listByTenant` | `tenantId: UUID` | `List<SiteApi.View>` |
| `SiteApi.lock` | `site: SiteApi.SiteId` | `Optional<SiteApi.View>` |
| `SiteApi.mount` | `actor: SiteApi.ActorId, site: SiteApi.SiteId, target: UUID, slug: String` | `SiteApi.MountResult` |
| `SiteApi.mountsOf` | `target: UUID` | `List<SiteApi.Occurrence>` |
| `SiteApi.mounts` | `site: SiteApi.SiteId` | `List<SiteApi.Mount>` |
| `SiteApi.pageByTenant` | `tenantId: UUID, cursor: String, limit: int` | `SiteApi.Page` |
| `SiteApi.remount` | `actor: SiteApi.ActorId, site: SiteApi.SiteId, slug: String, newSlug: String` | `SiteApi.MountResult` |
| `SiteApi.rename` | `actor: SiteApi.ActorId, site: SiteApi.SiteId, name: String` | `SiteApi.MutationResult` |
| `SiteApi.reorder` | `actor: SiteApi.ActorId, site: SiteApi.SiteId, order: List<String>` | `SiteApi.MutationResult` |
| `SiteApi.setAnalytics` | `actor: SiteApi.ActorId, site: SiteApi.SiteId, analyticsId: Optional<String>` | `SiteApi.MutationResult` |
| `SiteApi.setBranding` | `actor: SiteApi.ActorId, site: SiteApi.SiteId, branding: SiteApi.Branding` | `SiteApi.MutationResult` |
| `SiteApi.setHome` | `actor: SiteApi.ActorId, site: SiteApi.SiteId, target: Optional<UUID>` | `SiteApi.MutationResult` |
| `SiteApi.setLocale` | `actor: SiteApi.ActorId, site: SiteApi.SiteId, locale: Optional<String>` | `SiteApi.MutationResult` |
| `SiteApi.setRobots` | `actor: SiteApi.ActorId, site: SiteApi.SiteId, policy: SiteApi.RobotsPolicy` | `SiteApi.MutationResult` |
| `SiteApi.setRule` | `actor: SiteApi.ActorId, site: SiteApi.SiteId, rule: String` | `SiteApi.MutationResult` |
| `SiteApi.setTitleTemplate` | `actor: SiteApi.ActorId, site: SiteApi.SiteId, template: Optional<String>` | `SiteApi.MutationResult` |
| `SiteApi.slugOf` | `site: SiteApi.SiteId, target: UUID` | `Optional<String>` |
| `SiteApi.targetAt` | `site: SiteApi.SiteId, slug: String` | `Optional<UUID>` |
| `SiteApi.tenantOf` | `site: SiteApi.SiteId` | `Optional<UUID>` |
| `SiteApi.unmount` | `actor: SiteApi.ActorId, site: SiteApi.SiteId, slug: String` | `SiteApi.MutationResult` |
| `SiteApi.view` | `site: SiteApi.SiteId` | `Optional<SiteApi.View>` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `SiteApi.ActorId` | `value: UUID` |
| `SiteApi.Branding` | `logo: String, favicon: String, primaryColor: String` |
| `SiteApi.DeleteResult.Deleted` | `[]` |
| `SiteApi.DeleteResult.NotEmpty` | `[]` |
| `SiteApi.DeleteResult.NotFound` | `[]` |
| `SiteApi.DeleteResult` | `SiteApi.DeleteResult.Deleted / SiteApi.DeleteResult.NotEmpty / SiteApi.DeleteResult.NotFound` |
| `SiteApi.MountResult.MountMissing` | `[]` |
| `SiteApi.MountResult.Mounted` | `site: SiteApi.View` |
| `SiteApi.MountResult.NotFound` | `[]` |
| `SiteApi.MountResult.SlugInvalid` | `[]` |
| `SiteApi.MountResult.SlugTaken` | `occupant: UUID` |
| `SiteApi.MountResult.TargetAlreadyMounted` | `[]` |
| `SiteApi.MountResult` | `SiteApi.MountResult.MountMissing / SiteApi.MountResult.Mounted / SiteApi.MountResult.NotFound / SiteApi.MountResult.SlugInvalid / SiteApi.MountResult.SlugTaken / SiteApi.MountResult.TargetAlreadyMounted` |
| `SiteApi.Mount` | `slug: String, target: UUID, position: int` |
| `SiteApi.MutationResult.Changed` | `site: SiteApi.View` |
| `SiteApi.MutationResult.HomeNotMounted` | `[]` |
| `SiteApi.MutationResult.InvalidRule` | `[]` |
| `SiteApi.MutationResult.InvalidTitleTemplate` | `[]` |
| `SiteApi.MutationResult.NotFound` | `[]` |
| `SiteApi.MutationResult.OrderInvalid` | `[]` |
| `SiteApi.MutationResult` | `SiteApi.MutationResult.Changed / SiteApi.MutationResult.HomeNotMounted / SiteApi.MutationResult.InvalidRule / SiteApi.MutationResult.InvalidTitleTemplate / SiteApi.MutationResult.NotFound / SiteApi.MutationResult.OrderInvalid` |
| `SiteApi.Occurrence` | `site: SiteApi.SiteId, slug: String` |
| `SiteApi.Page` | `items: List<SiteApi.View>, nextCursor: String` |
| `SiteApi.RobotsPolicy` | `INDEX / NOINDEX` |
| `SiteApi.SiteId` | `value: UUID` |
| `SiteApi.View` | `id: UUID, tenantId: UUID, name: String, rule: String, home: UUID, titleTemplate: String, branding: SiteApi.Branding, locale: String, analyticsId: String, robotsPolicy: SiteApi.RobotsPolicy, mounts: List<SiteApi.Mount>, createdAt: Instant, createdBy: UUID, updatedAt: Instant, updatedBy: UUID` |

<!-- interface-contract:end -->

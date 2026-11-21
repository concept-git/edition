# syncs: 重组与重定向

目的：管理员改挂载 slug / 页面 slug / 跨空间转移页面时自动登记 Redirect；人工规则可增删；
serve 解析未命中时由 `serveRedirect`（serve 包）查旧地址 301。Toc 重排不产生 Redirect。

入口：`Requesting.remount / reslugPage / transferPage / listRedirects / createRedirect /
deleteRedirect`。登记动作 `redirectOnRemount / redirectOnReslug` 由本包在 mutation 成功后
**显式调用**，不监听 `Space.reslug`（导入流水线会用临时 slug，监听会登记垃圾规则）。

共同前置：

- Session User 必须是当前 Tenant member；TOKEN 一律 403。
- remount / 人工规则写：`[tenant, site]/admin`；规则列表：`[tenant, site]/read`。
- reslug：`[tenant, space, page]/write`；transfer：源 `[tenant, space, page]/write` 且目标
  `[tenant, toSpace]/write`。
- 涉及的 Space 必须 active；归档只允许既有 Site.unmount，不允许 remount / reslug / transfer。
- 变更经 ADR-0016 执行器，强制 `Idempotency-Key`。
- 新 mount、reslug 与 transfer 均要求涉及的 Space 为 active。

变更的状态与旧地址绑定在幂等首次执行内加锁后读取。remount按Space→Site加锁并复核当前挂载；
transfer先按稳定UUID顺序锁源/目标Space，再锁Page，确认当前归属后才摘源Toc。
原键重放使用请求参数指纹，不要求旧slug或旧页面归属仍存在；权限仍每次验证。

```text
sync remount
// implementation: RemountUseCase#remount
when {
  Requesting/remount: [tenant: ?tenant; site: ?site; slug: ?slug; newSlug: ?newSlug] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
  guard: [chain: [?tenant, ?site]; op: admin]
  Site/_targetAt: [site: ?site; slug: ?slug] => [target: ?space]
  Space/_status: [space: ?space] => [status: active]
}
then {
  Site/remount: [actor: ?actor; site: ?site; slug: ?slug; newSlug: ?newSlug]
  redirectOnRemount
}

sync redirectOnRemount
// implementation: RedirectOnRemount#redirectOnRemount
when {
  Site/remount: [actor: ?actor; site: ?site; slug: ?oldSlug; newSlug: ?newSlug] => [site: ?site]
}
then {
  Redirect/register: [scope: ?site; path: /{oldSlug}/*; targetType: space; targetId: ?space; origin: auto]
  // 同 slug 幂等：Site/remount 为 no-op 时不登记
}

sync reslugPage
// implementation: ReslugPageUseCase#reslugPage
when {
  Requesting/reslugPage: [tenant: ?tenant; space: ?space; page: ?page; newSlug: ?newSlug] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  ResourceChain.page: [tenant: ?tenant; space: ?space; page: ?page] => [page: ?page]
  guard: [chain: [?tenant, ?space, ?page]; op: write]
  Space/_status: [space: ?space] => [status: active]
  Space/_mode: [space: ?space] => [mode: authored]
}
then {
  Space/reslug: [space: ?space; item: ?page; slug: ?newSlug]
  redirectOnReslug
  // 同 slug 幂等：不登记；synced 空间 409 space_mode_restricted
}

sync redirectOnReslug
// implementation: RedirectOnReslug#redirectOnReslug
when {
  Space/reslug: [space: ?oldSpace; item: ?page; slug: ?newSlug] => [placement: ?placed]
}
where {
  Site/_mountsOf: [target: ?oldSpace] => [occurrences: ?mounts]
}
then {
  Redirect/register: [scope: ?site; path: /{siteSpaceSlug}/{oldSlug}/*; targetType: page; targetId: ?page; origin: auto]
}

sync transferPage
// implementation: TransferPageUseCase#transferPage
when {
  Requesting/transferPage: [tenant: ?tenant; space: ?space; page: ?page; toSpace: ?toSpace; slug: ?slug] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  ResourceChain.page: [tenant: ?tenant; space: ?space; page: ?page] => [page: ?page]
  guard: [chain: [?tenant, ?space, ?page]; op: write]
  ResourceChain.space: [tenant: ?tenant; space: ?toSpace] => [space: ?toSpace]
  guard: [chain: [?tenant, ?toSpace]; op: write]
  Space/_status: [space: ?space] => [status: active]
  Space/_status: [space: ?toSpace] => [status: active]
  Space/_mode: [space: ?space] => [mode: authored]
  Space/_mode: [space: ?toSpace] => [mode: authored]
  Page/_view: [page: ?page] => [trashedAt: none]
  ?toSpace ≠ ?space
}
then {
  Toc/remove: [entry: 源空间全部 TARGET]
  Space/transfer: [item: ?page; toSpace: ?toSpace; slug: ?slug]
  redirectOnReslug
  // Space/transfer 成功后由发版规格的 authoredAfterTransferFrom/To 分支处理原/目标空间
  // Toc 外键要求先摘再换绑；两步同事务，transfer 失败会回滚摘除
}

mediator branch slugTaken
when {
  Site/remount: [actor: ?actor; site: ?site; slug: ?slug; newSlug: ?newSlug] => [error: SlugTaken]
  Space/reslug: [space: ?space; item: ?page; slug: ?newSlug] => [error: SlugTaken]
  Space/transfer: [item: ?page; toSpace: ?toSpace; slug: ?slug] => [error: SlugTaken]
}
then {
  Requesting/respond: [request: ?request; error: SlugTaken]
}

sync listRedirects
// implementation: ListRedirectsUseCase#listRedirects
when {
  Requesting/listRedirects: [tenant: ?tenant; site: ?site; origin: ?origin; cursor: ?cursor; limit: ?limit] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
  guard: [chain: [?tenant, ?site]; op: read]
}
then {
  Redirect/_list: [scope: ?site; origin: ?origin; cursor: ?cursor; limit: ?limit]
  // 投影 hitCount=null；目标现地址由组合层解析，悬挂标 unreachable
}

sync createRedirect
// implementation: CreateRedirectUseCase#createRedirect
when {
  Requesting/createRedirect: [tenant: ?tenant; site: ?site; path: ?path; targetType: ?type; targetId: ?target] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
  guard: [chain: [?tenant, ?site]; op: admin]
  // 目标为本站挂载空间或其页面
}
then {
  Redirect/register: [scope: ?site; path: ?path; targetType: ?type; targetId: ?target; origin: manual]
  // 同 path 覆盖为最新（含覆盖 auto）
}

sync deleteRedirect
// implementation: DeleteRedirectUseCase#deleteRedirect
when {
  Requesting/deleteRedirect: [tenant: ?tenant; site: ?site; path: ?path] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant; principal: ?actor]
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
  guard: [chain: [?tenant, ?site]; op: admin]
  Redirect/_get: [scope: ?site; path: ?path] => [rule: ?rule]
}
then {
  // origin=manual 才 retire；auto → 409 redirect_not_manual；缺失幂等 204
  Redirect/retire: [scope: ?site; path: ?path]
}
```

排除动作: Toc 重排（addEntry/move/remove）**不产生任何 Redirect**——Toc 零寻址职责，
重排永不断链（有意设计，非欠同步）。导入流水线的 `Space.reslug` 本票不登记。

错误与调用方行动：

| 条件 | HTTP / code |
| --- | --- |
| 站点不存在或路径 tenant 错配 | 404 `site_not_found` |
| 页面不存在、已回收、或不属当前空间 | 404 `page_not_found` |
| 目标空间不存在或不属该租户 | 404 `space_not_found` |
| 存在但 guard 拒绝；TOKEN 写 | 403 `permission_denied` |
| 站内/空间内 slug 占用 | 409 `slug_taken` |
| slug 形态非法 | 422 `slug_invalid` |
| 归档空间 | 409 `space_archived` |
| synced 空间 reslug/transfer；任一侧 synced | 409 `space_mode_restricted` |
| transfer 目标 = 当前空间 | 422 `validation_failed` |
| remount 挂载不存在 | 404 `mount_not_found` |
| 删除 auto 规则 | 409 `redirect_not_manual` |
| 人工规则目标不在本站 | 404 `redirect_target_not_found` |
| path 形态非法或保留前缀 | 422 `validation_failed` |
| 规则不存在（DELETE 除外） | 404 `redirect_not_found` |

手动规则登记先锁目标Space/Page，再锁Site并复查挂载/存活，防止与终结交错后重新写回已退役规则。


页级 slug 的语义是完整资源相对路径。reslugPage 保留目标ID及Toc位置，登记旧地址Redirect，并沿既有 authoredAutoRelease 接力产生包含新路径的版本；导航重排不调用本动作。站点挂载slug仍为单段前缀。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `CreateRedirectUseCase.createRedirect` | `credential: String, tenant: UUID, site: UUID, path: String, targetType: String, targetId: UUID, key: String` | `FlowResponse<ReorganizationTypes.RedirectView>` |
| `DeleteRedirectUseCase.deleteRedirect` | `credential: String, tenant: UUID, site: UUID, path: String, key: String` | `void` |
| `ListRedirectsUseCase.listRedirects` | `credential: String, tenant: UUID, site: UUID, origin: String, cursor: String, limit: int` | `ReorganizationTypes.RedirectPage` |
| `RedirectOnRemount.redirectOnRemount` | `binding: ReorganizationSignals.RedirectOnRemount` | `void` |
| `RedirectOnRemount.redirectOnRemount` | `site: UUID, oldSlug: String, space: UUID` | `RedirectApi.Rule` |
| `RedirectOnReslug.redirectOnReslug` | `binding: ReorganizationSignals.RedirectOnReslug` | `void` |
| `RedirectOnReslug.redirectOnReslug` | `oldSpace: UUID, oldPageSlug: String, page: UUID` | `List<RedirectApi.Rule>` |
| `RemountUseCase.remount` | `credential: String, tenant: UUID, site: UUID, oldSlug: String, newSlug: String, key: String` | `FlowResponse<SiteTypes.SiteDetail>` |
| `ReslugPageUseCase.reslugPage` | `credential: String, tenant: UUID, space: UUID, page: UUID, newSlug: String, key: String` | `FlowResponse<PageEditingTypes.PageDetail>` |
| `TransferPageUseCase.transferPage` | `credential: String, tenant: UUID, sourceSpace: UUID, page: UUID, targetSpace: UUID, slug: String, key: String` | `FlowResponse<PageEditingTypes.PageDetail>` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `ReorganizationSignals.RedirectOnRemount` | `site: UUID, oldSlug: String, space: UUID, completion: RuleCompletion<RedirectApi.Rule>` |
| `ReorganizationSignals.RedirectOnReslug` | `oldSpace: UUID, oldPageSlug: String, page: UUID, completion: RuleCompletion<List<RedirectApi.Rule>>` |
| `ReorganizationTypes.RedirectPage` | `items: List<ReorganizationTypes.RedirectView>, nextCursor: String` |
| `ReorganizationTypes.RedirectView` | `path: String, targetId: UUID, targetType: String, origin: String, createdAt: Instant, hitCount: Long, currentPath: String, targetLabel: String, reachable: boolean` |

<!-- interface-contract:end -->


## Implementation policy ownership

`AddressFailures` owns `slugTaken`. These names denote entry policy, refusal translation, or a read projection. They do not create completion events or persist rule identities. Protected effects retain the original transaction, lock, and tenant scope.


## Native completion protocol

`ReorganizationRelay` publishes the bindings in `ReorganizationSignals` synchronously at the corresponding call-completion or entry-continuation point. Each binding carries a unique occurrence and the current root flow. It is local execution data, not a second business state. Receiving rules claim their occurrence before effects and record one response. Equal-valued later requests use distinct occurrences; another flow cannot supply this binding. A missing response fails explicitly.

These continuations use the existing synchronous Java transaction and Spring event publisher. Receiving listeners must remain synchronous: no `@Async`, after-commit listener, durable replay, or independent transaction is added. Failures propagate to the caller and retain the original rollback/refusal policy. Persistent asynchronous delivery continues through the existing outboxes.

The native implementation retains the documented ordered transactional synchronization dialect. The typed binding is emitted only at the declared request/result branch; it does not join arbitrary historical concept events.

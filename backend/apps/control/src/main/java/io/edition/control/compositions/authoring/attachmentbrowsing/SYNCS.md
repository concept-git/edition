# 空间附件浏览

```text
sync listAttachments
// implementation: ListAttachmentsUseCase#listAttachments
when {
  Requesting/listAttachments: [tenant: ?tenant; space: ?space; cursor: ?cursor; limit: ?limit; q: ?q; type: ?type] => [request: ?request]
}
where {
  TenantAccess: [tenant: ?tenant]
  ResourceChain.space: [tenant: ?tenant; space: ?space] => [space: ?space]
  guard: [chain: [?tenant, ?space]; op: read]
  cursor 绑定 tenant/space/规范化q/type/createdAt-ref-desc，非法或条件不匹配 → 400 invalid_cursor
  Page/_scanAttachments: [cursor: ?cursor; limit: 100; q: ?q; type: ?type] 每批100、每请求最多500个候选
  Space/_placementsOf: [items: ?candidates] => [placements: ?placements]
  Permission/_filter: [chains: 各 [?tenant, ?space, ?page]; subject: ?principal; op: read] => [pages: ?readable]
  页面回收已由 Page 排除
}
then {
  Requesting/respond: [request: ?request; items: ?items; nextCursor: ?next]
}
```

只读事务；默认30最多100。type all/image/pdf，q strip 且不区分大小写，包含符号按字面匹配。
达到返回limit时游标停在最后实际处理项，不跳过批次余项。扫描预算耗尽时空items仍允许nextCursor，前端展示继续查找。
未命中可能需额外一次空扫描才能确认结束，不返回total。无正文、storageKey、URL、对象请求。
error case: invalid_cursor / page_not_found / permission_denied / unauthenticated / tenant_suspended（复用组合根错误）。依赖故障503、候选SQL超时504（现有 dependency_timeout）不伪装空列表；候选SQL单条超时2秒，应用候选预算独立控制批次数。
实时浏览：跨页不维持快照，刷新发现新项，后续页按当前权限/归属。下载沿用pageediting当前鉴权。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `ListAttachmentsUseCase.listAttachments` | `credential: String, tenant: UUID, space: UUID, cursor: String, limit: int, q: String, type: String` | `AttachmentBrowsingTypes.Result` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `AttachmentBrowsingTypes.Entry` | `id: UUID, pageId: UUID, pageTitle: String, filename: String, mime: String, sizeBytes: long, createdAt: Instant` |
| `AttachmentBrowsingTypes.Result` | `items: List<AttachmentBrowsingTypes.Entry>, nextCursor: String` |

<!-- interface-contract:end -->

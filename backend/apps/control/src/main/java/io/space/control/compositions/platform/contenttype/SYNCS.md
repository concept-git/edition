# syncs: 内容类型管理

读取建立租户上下文且不物化内置模板；写要求租户根ADMIN，并将授权、幂等和乐观基线合并到同一事务。发布定义由服务端解析，正文HTTP不可传入冻结定义。

sync listContentTypes
// implementation: ListContentTypesUseCase#listContentTypes
when {
  Requesting/listContentTypes => [request: r]
}
where {
  租户准入；成员可读
}
then {
  ContentType.list返回摘要并计算canManage
}

sync listContentTypeVersions
// implementation: ListContentTypeVersionsUseCase#listContentTypeVersions
when {
  Requesting/listContentTypeVersions => [request: r]
}
where {
  租户准入；成员可读
}
then {
  ContentType.versions仅返回不可变版本摘要
}

sync viewContentTypeVersion
// implementation: ViewContentTypeVersionUseCase#viewContentTypeVersion
when {
  Requesting/viewContentTypeVersion => [request: r]
}
where {
  租户准入；成员可读
}
then {
  ContentType.version返回单项完整定义与Schema闭包
}

sync registerContentTypeVersion
// implementation: RegisterContentTypeVersionUseCase#registerContentTypeVersion
when {
  Requesting/registerContentTypeVersion => [request: r]
}
where {
  租户准入；租户根ADMIN，Idempotency-Key有效，基线一致
}
then {
  Release.inspectDefinition检查通用Schema声明；ContentType.registerVersion新增不可变版本，首次自动启用并激活
}

sync activateContentType
// implementation: ActivateContentTypeUseCase#activateContentType
when {
  Requesting/activateContentType => [request: r]
}
where {
  租户准入；租户根ADMIN，Idempotency-Key有效，基线一致
}
then {
  ContentType.activate在基线匹配时启用并选择同类型版本
}

sync deactivateContentType
// implementation: DeactivateContentTypeUseCase#deactivateContentType
when {
  Requesting/deactivateContentType => [request: r]
}
where {
  租户准入；租户根ADMIN，Idempotency-Key有效，基线一致
}
then {
  ContentType.deactivate停用新选择；不改写已有绑定或历史快照
}

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `ActivateContentTypeUseCase.activateContentType` | `credential: String, tenant: UUID, type: String, base: int, reference: String, key: String` | `FlowResponse<ContentTypeTypes.State>` |
| `DeactivateContentTypeUseCase.deactivateContentType` | `credential: String, tenant: UUID, type: String, base: int, key: String` | `FlowResponse<ContentTypeTypes.State>` |
| `ListContentTypeVersionsUseCase.listContentTypeVersions` | `credential: String, tenant: UUID, type: String` | `ContentTypeTypes.VersionList` |
| `ListContentTypesUseCase.listContentTypes` | `credential: String, tenant: UUID` | `ContentTypeTypes.TypeList` |
| `RegisterContentTypeVersionUseCase.registerContentTypeVersion` | `credential: String, tenant: UUID, type: String, base: int, definition: ContentTypeDefinition, key: String` | `FlowResponse<ContentTypeTypes.Version>` |
| `ViewContentTypeVersionUseCase.viewContentTypeVersion` | `credential: String, tenant: UUID, reference: String` | `ContentTypeTypes.Version` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `ContentTypeTypes.State` | `contentType: String, enabled: boolean, revision: int, activeVersionRef: String, label: String, format: String, mediaType: String, builtin: boolean` |
| `ContentTypeTypes.TypeList` | `items: List<ContentTypeTypes.State>, canManage: boolean` |
| `ContentTypeTypes.VersionList` | `items: List<ContentTypeTypes.VersionSummary>` |
| `ContentTypeTypes.VersionSummary` | `versionRef: String, contentType: String, version: String, digest: String, createdAt: Instant` |
| `ContentTypeTypes.Version` | `versionRef: String, digest: String, definition: ContentTypeDefinition, createdAt: Instant` |

<!-- interface-contract:end -->

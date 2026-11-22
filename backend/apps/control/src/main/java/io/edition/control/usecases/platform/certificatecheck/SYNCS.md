# syncs: 边缘证书探查

```
sync domainCertificate
// implementation: DomainCertificateUseCase#domainCertificate
when {
  Requesting/domainCertificate: [tenant: ?tenant; site: ?site; host: ?host] => [request: ?request]
}
where {
  ResourceChain.site: [tenant: ?tenant; site: ?site] => [site: ?site]
  CustomDomain/_hostsOf: [target: ?site] => [hosts: ?hosts]
  ?host ∈ ?hosts
  // site admin 或 platform operator
  guard: [chain: [?tenant, ?site]; op: admin]
  或 PlatformOperatorGuard.require
}
then {
  Requesting/respond: [request: ?request]
}
```
只查公开证书元数据；verified不是签发或TLS正常的证据；未启用TLS与探测故障分开表达。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `DomainCertificateUseCase.domainCertificate` | `credential: String, tenant: UUID, site: UUID, host: String, platform: boolean` | `CertificateCheckTypes.Certificate` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `CertificateCheckTypes.Certificate` | `host: String, status: String, issuer: String, notBefore: Instant, notAfter: Instant, checkedAt: Instant, error: String` |

<!-- interface-contract:end -->

# concept CustomDomain [Target]

## purpose
让访问者用自有域名直达指定目标

## state
binding: Host -> lone Target
verified: Host -> Bool
isPrimary: Host -> Bool
dnsToken: Host -> String
createdAt: Host -> Time
unverifiedTtl: Duration

dnsToken 为绑定时生成的 TXT 挑战。unverifiedTtl 默认 72 小时；未核验且 createdAt+TTL<now 为过期。
Host 是恰好一个 FQDN（小写 ASCII / punycode，无通配、无端口）。

## actions
bind [host: Host; target: Target] => [domain: View]
  requires host 合法且未被其他目标占用（同目标尚未过期则返回现有绑定）
  ensures 写入绑定与挑战

bind [host: Host; target: Target] => [error: Taken]
  requires 其他目标占用该 host
  ensures 返回 Taken；状态不变

bind [host: Host; target: Target] => [error: HostInvalid]
  requires host 形态不合法
  ensures 返回 HostInvalid；状态不变

verify [host: Host; dnsToken: String] => [domain: View]
  requires host 合法、绑定存在且未过期、dnsToken 证明成立
  ensures verified=true

verify [host: Host; dnsToken: String] => [error: NotFound]
verify [host: Host; dnsToken: String] => [error: NotProven]
verify [host: Host; dnsToken: String] => [error: HostInvalid]

setPrimary [host: Host] => [domain: View]
  requires host 合法、绑定存在且 verified=true
  ensures 同一目标下主域名唯一

setPrimary [host: Host] => [error: NotFound]
setPrimary [host: Host] => [error: NotVerified]
setPrimary [host: Host] => [error: HostInvalid]

unbind [host: Host] => []
  requires host 合法
  ensures 解除绑定；缺失 host 幂等成功

unbind [host: Host] => [error: HostInvalid]

## operational principle
after bind [host: "docs.acme.com"; target: t] => [domain: d]
after verify [host: "docs.acme.com"; dnsToken: tok] => [domain: d]
then _resolve [host: "docs.acme.com"] => [target: t]
访问者用自有域名直达，无需知道平台内部地址

after setPrimary [host: "docs.acme.com"] => [domain: d]
then _primaryOf [target: t] => [host: "docs.acme.com"]
同一目标主域名唯一；非主域名 301 归一由组合层做

## queries
_resolve [host: Host] => [target: Target; tenantId: Tenant; isPrimary: Bool]
  returns 仅已核验绑定；未绑定或未验证为零行

_hostsOf [target: Target] => [hosts: seq View]
  returns 全部持久绑定，包含过期行，供生命周期清理

_activeHostsOf [target: Target] => [hosts: seq View]
  returns 已 verified 或尚未过期的绑定；只读，过期不触发删除

_page [targets: set Target; cursor: String; limit: Int] => [hosts: seq View; nextCursor: String]
  returns 多目标键集分页（host asc）；仅有效绑定

_primaryOf [target: Target] => [host: Host]
  returns 零或一绑定

## notes
实例化 Target=站点。NotProven 只表示已取得权威答案但证明不成立；DNS 超时是系统故障。
挑战、创建时间与 TTL 属于本概念的绑定生命周期。Java 模块不得依赖其他概念。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `CustomDomainApi.activeHostsOf` | `target: UUID` | `List<CustomDomainApi.View>` |
| `CustomDomainApi.bind` | `host: String, target: UUID` | `CustomDomainApi.BindResult` |
| `CustomDomainApi.hostsOf` | `target: UUID` | `List<CustomDomainApi.View>` |
| `CustomDomainApi.page` | `targets: Set<UUID>, cursor: String, limit: int` | `CustomDomainApi.Page` |
| `CustomDomainApi.primaryOf` | `target: UUID` | `Optional<String>` |
| `CustomDomainApi.resolve` | `host: String` | `Optional<CustomDomainApi.Resolved>` |
| `CustomDomainApi.setPrimary` | `host: String` | `CustomDomainApi.SetPrimaryResult` |
| `CustomDomainApi.unbind` | `host: String` | `CustomDomainApi.UnbindResult` |
| `CustomDomainApi.verify` | `host: String, dnsToken: String` | `CustomDomainApi.VerifyResult` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `CustomDomainApi.BindResult.Bound` | `domain: CustomDomainApi.View` |
| `CustomDomainApi.BindResult.HostInvalid` | `[]` |
| `CustomDomainApi.BindResult.Taken` | `[]` |
| `CustomDomainApi.BindResult` | `CustomDomainApi.BindResult.Bound / CustomDomainApi.BindResult.HostInvalid / CustomDomainApi.BindResult.Taken` |
| `CustomDomainApi.Page` | `items: List<CustomDomainApi.View>, nextCursor: String` |
| `CustomDomainApi.Resolved` | `target: UUID, tenantId: UUID, isPrimary: boolean` |
| `CustomDomainApi.SetPrimaryResult.Changed` | `domain: CustomDomainApi.View` |
| `CustomDomainApi.SetPrimaryResult.HostInvalid` | `[]` |
| `CustomDomainApi.SetPrimaryResult.NotFound` | `[]` |
| `CustomDomainApi.SetPrimaryResult.NotVerified` | `[]` |
| `CustomDomainApi.SetPrimaryResult` | `CustomDomainApi.SetPrimaryResult.Changed / CustomDomainApi.SetPrimaryResult.HostInvalid / CustomDomainApi.SetPrimaryResult.NotFound / CustomDomainApi.SetPrimaryResult.NotVerified` |
| `CustomDomainApi.UnbindResult.HostInvalid` | `[]` |
| `CustomDomainApi.UnbindResult.Unbound` | `[]` |
| `CustomDomainApi.UnbindResult` | `CustomDomainApi.UnbindResult.HostInvalid / CustomDomainApi.UnbindResult.Unbound` |
| `CustomDomainApi.VerifyResult.HostInvalid` | `[]` |
| `CustomDomainApi.VerifyResult.NotFound` | `[]` |
| `CustomDomainApi.VerifyResult.NotProven` | `[]` |
| `CustomDomainApi.VerifyResult.Verified` | `domain: CustomDomainApi.View` |
| `CustomDomainApi.VerifyResult` | `CustomDomainApi.VerifyResult.HostInvalid / CustomDomainApi.VerifyResult.NotFound / CustomDomainApi.VerifyResult.NotProven / CustomDomainApi.VerifyResult.Verified` |
| `CustomDomainApi.View` | `host: String, target: UUID, verified: boolean, isPrimary: boolean, dnsToken: String, createdAt: Instant` |

<!-- interface-contract:end -->

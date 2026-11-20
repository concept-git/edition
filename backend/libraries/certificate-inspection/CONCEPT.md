# concept CertificateInspection

## purpose

让调用方知道指定主机 443 端口实际呈现的证书状态。

## state

无持久状态；每次 inspect 独立生成一次观测 View。

## actions

inspect [host: String] => [view: View]
  requires TLS 探测已启用且可获得并发名额；ensures 只连接经公网地址检查的 443 端口，保留 SNI，并以有效期、SAN 和信任链形成状态及元数据
inspect [host: String] => [view: View(status: tls_disabled)]
  requires 部署关闭 TLS；ensures 不探测
inspect [host: String] => [view: View(status: unavailable, error: Code)]
  requires 目的地被拒、并发已满、等待超时或网络/DNS/握手失败；ensures 不宣称证书未签发，返回有限原因

## operational principle

after inspect [host: h] => [view: v]
then 调用方依据 v 的实测状态展示证书信息或不可用原因，而不以 DNS 核验状态推断证书存在。

## notes

平台类概念；与产品概念采用相同规格形式。以下保留实现边界与运维约束。

只探测当前绑定域名443端口实际呈现的TLS证书，不以DNS verified推断签发状态。
部署明确关闭TLS时返回tls_disabled；网络、DNS、握手故障返回unavailable及有限原因，不能断言未签发。
仅允许公网解析结果，连接时固定已校验地址并保留SNI；不发送HTTP请求、账户凭据或应用内容。
最多4个并发探测、调用等待5秒，无排队。检查有效期、SAN主机匹配和系统信任链；过期/不可信仍可展示证书元数据。
入口经sync核验真实域名绑定及site admin或平台operator。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `CertificateInspectionApi.inspect` | `host: String` | `CertificateInspectionApi.View` |

| 类型 | 字段／封闭分支 |
| --- | --- |
| `CertificateInspectionApi.View` | `status: String, issuer: String, notBefore: Instant, notAfter: Instant, checkedAt: Instant, error: String` |

<!-- interface-contract:end -->

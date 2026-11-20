# concept DnsLookup

## purpose

让调用方可靠地区分 TXT 无记录与 DNS 查询故障。

## state

无生产持久状态；显式开发/测试配置下可读取 stub，但不维护域名绑定、挑战或核验结果。

## actions

lookupTxt [name: String] => [values: seq String]
  requires DNS 查询成功；ensures 返回 TXT 值，无记录或 NXDOMAIN 返回空序列
lookupTxt [name: String] => [error: Timeout]
  requires 查询超时；ensures 抛 Timeout，不返回空序列
lookupTxt [name: String] => [error: Unavailable]
  requires 其他解析依赖故障；ensures 抛 Unavailable，不返回空序列

## operational principle

after lookupTxt [name: challengeName] => [values: v]
then 调用方可用 v 核验挑战；若返回 Timeout 或 Unavailable，则保留“未能查询”的区别。

## notes

平台类概念；与产品概念采用相同规格形式。以下保留实现边界与运维约束。

平台类概念。唯一出口`DnsLookupApi.lookupTxt(name)`返回TXT值列表；无记录或NXDOMAIN为空列表。
超时抛Timeout，其他解析依赖故障抛Unavailable，不能伪装空列表。概念不依赖本模块，域名管理sync使用它验证挑战。

system实现通过JNDI DNS解析器查询，初始超时2秒、重试参数2；这两个参数不承诺一个2秒总截止时间。
fake实现仅用于显式配置的开发/测试，从shared.dns_txt_stubs读取指定name。auto-prove是域名组合层的显式开发开关，不代表生产TXT核验。

模块不维护域名绑定、核验状态、挑战或TTL，不签发证书。数据库stub、网络与DNS依赖错误由调用方按故障语义处理。

<!-- interface-contract:start -->

### 实现接口映射

下表完整列出Java调用边界；行为前置、效果及组合策略以上文为准。sealed分支是可区分结果，查询Optional为空表示无绑定；参数中的actor和范围同样属于契约。此映射由SpecificationInterfaceParityTest核对，转录不替代行为审查。

| 方法 | 具名输入 | 返回类型 |
| --- | --- | --- |
| `DnsLookupApi.lookupTxt` | `name: String` | `List<String>` |

| 类型 | 字段／封闭分支 |
| --- | --- |


<!-- interface-contract:end -->

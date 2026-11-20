# language: zh-CN
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/SYNCS.md
@area-platform @suite-console
@smoke @flow-contract-security
功能: 契约与安全 walking skeleton
  五平面安全边界与 RFC 9457 错误协议对任何客户端一致生效（票 01）。

  @case-contract-security-baseline-001
  场景: 匿名访问管理面得到结构化拒绝且前端可解释
    假如 后端健康检查可公开访问
    当 匿名访客打开管理控制台
    那么 管理面返回可追踪的 401 problem
    并且 控制台展示登录指引与错误追踪号

  @case-contract-security-baseline-002
  场景: 运维探针无需凭据即可访问
    那么 存活与就绪探针公开返回健康状态

  @case-contract-security-baseline-003
  场景: 匿名访问各受保护平面均得到结构化拒绝
    那么 管理面与运维面匿名请求均返回 401 problem
    并且 交付面只读请求不要求凭据

  @case-contract-security-baseline-004
  场景: 请求追踪号原样透传便于报障互查
    当 客户端携带自定义请求号访问健康检查
    那么 响应回传同一请求号

  @case-contract-security-baseline-005
  场景: 幂等键格式非法在进入业务前被拦截
    当 客户端用空白幂等键提交管理面请求
    那么 服务端返回 400 invalid_idempotency_key problem

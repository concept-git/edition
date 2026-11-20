# language: zh-CN
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/iam/apitoken/SYNCS.md
@area-iam @suite-console
@issue-07 @api-token
功能: API 令牌
  租户所有者可以签发绑定单一空间的机器凭据，scope 与授权共同限制访问，并可立即吊销

  @case-api-token-001
  场景: 一次性 secret、机器访问、scope 拒绝与吊销
    假如 已有一个租户和它的所有者
    当 所有者登录并打开成员页
    并且 所有者打开空间页
    并且 所有者创建名称为 "令牌验收空间" 模式为 "站内创作" 的空间
    并且 所有者打开 API 令牌页
    并且 所有者签发带 read scope 的令牌
    那么 一次性 secret 只显示到关闭对话框
    当 客户端用该 secret 读取绑定空间
    那么 机器请求成功返回空间详情
    当 所有者签发不带 read scope 的令牌
    那么 该令牌读取空间被 403 拒绝
    当 所有者吊销最初的令牌
    那么 最初的 secret 再次访问返回 401 invalid_token

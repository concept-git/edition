# language: zh-CN
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/iam/managementtoken/SYNCS.md
@area-iam @suite-console
@management-tokens
功能: 用户管理令牌
  用户为 CLI 与自动化签发有限期管理凭据，按本人当前权限与任务范围调用管理面，不使用 cookie

  @case-management-token-001
  场景: 签发明文一次显示、无 cookie 管理调用、范围拒绝与即时撤销
    假如 已有一个租户和它的所有者
    当 所有者登录并打开成员页
    并且 所有者打开空间页
    并且 所有者创建名称为 "管理令牌验收空间" 模式为 "站内创作" 的空间
    并且 所有者打开账户管理令牌页
    并且 所有者签发只读管理 PAT
    那么 管理 PAT 明文关闭后不再显示
    当 独立客户端不使用 cookie 和 Origin 调用管理面
    那么 PAT 管理读取成功且凭据类型为 management_token
    当 独立客户端用只读管理 PAT 创建页面
    那么 PAT 缺少修改范围返回 403
    当 所有者在账户页撤销管理 PAT
    那么 原管理 PAT 立即返回 401 invalid_token

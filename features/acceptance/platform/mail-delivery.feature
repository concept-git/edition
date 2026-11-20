# language: zh-CN
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/platform/maildelivery/SYNCS.md
@area-platform @suite-console
@issue-33 @mail-delivery
功能: 邮件申请与运维恢复
  邮件受理、服务方接收和用户完成验证是不同状态

  @case-mail-delivery-001
  场景: 未验证用户重新申请后旧验证链接失效
    当 访客用新邮箱在注册页创建账号
    那么 页面提示注册已受理并等待验证
    当 访客从注册完成页重新申请验证邮件
    那么 重新申请已受理且原验证链接不可兑换

  @case-mail-delivery-002
  场景: 租户管理员查看本租户邀请邮件的脱敏作业
    假如 已有一个租户和它的所有者
    并且 有一个已验证的受邀用户
    当 所有者登录并打开成员页
    并且 所有者在成员页邀请该用户
    并且 所有者打开邮件作业页
    那么 邮件作业只展示脱敏邀请状态

# language: zh-CN
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/iam/accountsecurity/SYNCS.md
@area-iam @suite-console
@issue-06 @account-security
功能: 账户安全联动
  为了在密码可能泄露时重新取得账户控制权
  已验证用户可以修改或重置密码，并立即结束已有设备会话

  @smoke
  @case-account-security-001
  场景: 改密成功后全部设备下线且新密码可登录
    假如 已有一个在两台设备登录的已验证用户
    当 用户在账户设置中用正确旧密码修改密码
    那么 两台设备的会话立即失效
    并且 本设备被送回登录页
    当 用户用新密码重新登录
    那么 用户进入账户设置页

  @case-account-security-002
  场景: 旧密码错误不结束当前会话
    假如 已登录用户正在账户设置中修改密码
    当 用户用错误的旧密码提交改密
    那么 改密返回 400 invalid_old_password 并在界面提示当前密码错误
    并且 用户仍保持登录并停留在账户设置页

  @case-account-security-003
  场景: 弱新密码在改密表单中被拦截
    假如 已登录用户正在账户设置中修改密码
    当 用户提交弱的新密码
    那么 新密码字段提示强度要求且未发起改密请求

  @case-account-security-004
  场景: 绕过前端校验的弱新密码仍被服务端拒绝
    假如 已有一个完成邮箱验证的账户安全用户
    当 客户端登录后绕过表单提交弱新密码
    那么 服务端返回 422 password_too_weak 与新密码字段 violation

  @case-account-security-005
  场景: 已知邮箱可以通过邮件重置密码
    假如 已有一个完成邮箱验证的账户安全用户
    当 用户在忘记密码页提交已知邮箱
    那么 页面显示统一的密码重置申请成功信息
    当 用户打开密码重置邮件中的链接并设置新密码
    那么 页面显示密码重置成功
    当 用户用重置后的密码登录
    那么 用户进入账户设置页

  @case-account-security-006
  场景: 未知邮箱与已知邮箱的忘记密码响应一致
    假如 已有一个完成邮箱验证的账户安全用户
    当 客户端分别为已知邮箱和未知邮箱申请密码重置
    那么 两次申请的 HTTP 状态和响应体结构完全一致

  @short-clock
  @case-account-security-007
  场景: 过期的重置 token 被拒绝并引导重新申请
    假如 已验证用户已经申请密码重置
    当 重置 token 过期后用户从重置页面提交新密码
    那么 重置返回 400 reset_token_invalid 并引导重新申请

  @case-account-security-008
  场景: 重置 token 只能使用一次
    假如 已验证用户已经申请密码重置
    当 客户端使用同一重置 token 两次
    那么 第二次重置返回 400 reset_token_invalid

  @case-account-security-009
  场景: 第二次申请替换第一次重置 token
    假如 已验证用户已经申请密码重置
    当 用户再次申请密码重置
    那么 旧重置 token 返回 400 reset_token_invalid
    并且 新重置 token 可以成功重置密码

  @case-account-security-010
  场景: 重置密码立即解除账号锁定
    假如 已验证用户因连续错误密码登录而被锁定
    当 用户申请并完成密码重置
    那么 用户可以立即用新密码登录

# language: zh-CN
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/iam/registration/SYNCS.md
@area-iam @suite-console
@flow-registration
功能: 注册与激活
  访客可注册账号并完成邮箱验证；邮箱占用、弱密码有明确引导（票 03，flow 见 syncs/iam/SYNCS.md）。

  @case-registration-001
  场景: 访客注册新账号并通过邮件链接完成验证
    当 访客用新邮箱在注册页创建账号
    那么 页面提示注册已受理并等待验证
    当 用户打开邮件中的验证链接
    那么 页面显示邮箱验证成功

  @case-registration-002
  场景: 验证链接只能使用一次
    当 访客用新邮箱在注册页创建账号
    那么 页面提示注册已受理并等待验证
    当 用户打开邮件中的验证链接
    那么 页面显示邮箱验证成功
    当 用户再次打开同一验证链接
    那么 页面显示验证失败

  @case-registration-003
  场景: 重复邮箱注册被拒绝并引导登录
    假如 已存在使用某邮箱的账号
    当 访客用该邮箱再次注册
    那么 表单在邮箱字段提示已被注册并给出登录入口

  @case-registration-004
  场景: 邮箱占用判定不区分大小写
    假如 已存在使用某邮箱的账号
    当 访客用该邮箱的大写形式再次注册
    那么 表单在邮箱字段提示已被注册并给出登录入口

  @case-registration-005
  场景: 弱密码在表单内被即时拦截
    当 访客在注册页用弱密码提交表单
    那么 密码字段内联提示强度要求且未发起注册请求

  @case-registration-006
  场景: 弱密码被拒绝后不占用邮箱
    当 访客绕过表单校验用弱密码直接提交注册
    那么 服务端返回 422 password_too_weak
    并且 该邮箱仍可用合格密码注册

  @case-registration-007
  场景: 无效验证链接被拒绝
    当 用户打开带有伪造令牌的验证链接
    那么 页面显示验证失败

  @case-registration-008
  场景: 验证链接缺少令牌参数被拒绝
    当 用户打开缺少令牌参数的验证链接
    那么 页面显示验证失败

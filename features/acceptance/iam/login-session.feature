# language: zh-CN
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/iam/login/SYNCS.md
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/iam/accountsession/SYNCS.md
@area-iam @suite-console
@issue-04 @login-session
功能: 登录与设备会话
  为了安全地持续使用管理控制台
  已验证用户可以登录、续期并独立撤销设备会话

  @smoke
  @case-login-session-001
  场景: 已验证用户登录并查看账户设置
    假如 已有一个完成邮箱验证的用户
    当 用户在登录页提交正确的邮箱和密码
    那么 用户进入账户设置页
    并且 页面显示用户邮箱和当前登录设备

  @case-login-session-002
  场景大纲: 登录失败不泄露账号状态
    假如 已有一个完成邮箱验证的用户
    当 用户用"<凭据>"登录
    那么 页面只显示统一的登录失败提示

    例子:
      | 凭据       |
      | 错误密码   |
      | 未知邮箱   |

  @case-login-session-003
  场景: 未验证邮箱不能登录
    假如 已有一个尚未验证邮箱的用户
    当 用户在登录页提交该用户的正确密码
    那么 页面只显示统一的登录失败提示

  @smoke
  @short-access
  @case-login-session-004
  场景: access 过期后静默续期并保留资料草稿
    假如 已登录用户正在修改个人资料
    当 access 凭据过期后用户保存资料
    那么 页面静默续期并显示资料已保存

  @case-login-session-005
  场景: 同一标签切换账号不复用前一账号的缓存与草稿
    假如 已登录用户正在修改个人资料
    当 另一个已验证用户在同一标签登录
    那么 页面只显示另一个用户的资料

  @case-login-session-006
  场景: 登录后回到原本要访问的页面
    假如 已有一个完成邮箱验证的用户
    当 未登录用户直接访问受保护的深链接并在跳转后登录
    那么 用户回到原本要访问的深链接

  @case-login-session-007
  场景: 跨站发起的登录被拒绝
    假如 已有一个完成邮箱验证的用户
    当 攻击者站点用正确凭据向登录接口发起跨站请求
    那么 请求被拒绝且不下发 refresh cookie

  @case-login-session-008
  场景: 用户撤销当前设备
    假如 已登录用户正在查看登录设备
    当 用户撤销标记为当前设备的会话
    那么 用户立即返回登录页

  @short-clock
  @case-login-session-009
  场景: 连续失败触发锁定且锁定期满后重新计数
    假如 已有一个完成邮箱验证的用户
    当 客户端连续 5 次用错误密码登录
    那么 之后即使密码正确也被同样的 401 拒绝
    当 锁定期满
    那么 单次错误密码不会立刻再次锁定账号

  @case-login-session-010
  场景: refresh 过期或被吊销后续期返回 401
    假如 已有一个完成邮箱验证的用户
    当 客户端登录后该会话被吊销
    那么 用旧 refresh 续期返回 401 并清除 cookie

  @smoke
  @case-login-session-011
  场景: refresh 轮换且登出立即吊销 access
    假如 已有一个完成邮箱验证的用户
    当 客户端登录并续期会话
    那么 refresh 凭据被轮换且不出现在响应体
    当 客户端登出该会话
    那么 旧 access 凭据不能再访问个人资料

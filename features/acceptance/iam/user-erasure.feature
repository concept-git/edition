# language: zh-CN
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/iam/usererasure/SYNCS.md
@area-iam @suite-console
@issue-09 @user-erasure
功能: 用户合规注销
  为了让用户不可逆删除个人身份而不破坏历史事实
  注销必须由服务端强确认，并在成功响应前完成全部安全级联

  @smoke
  @case-user-erasure-001
  场景: 自助注销立即全端下线并释放原邮箱
    假如 已有一个无群体所有权的已验证用户并已登录
    当 用户在账户设置中输入邮箱和当前密码永久注销
    那么 注销返回 204 且浏览器回到登录页
    并且 旧密码不能再登录
    并且 原邮箱可注册为新的用户身份

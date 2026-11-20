# language: zh-CN
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/platform/operations/SYNCS.md
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/platform/statistics/SYNCS.md
@area-platform @suite-console
@operations27
功能: 运维与终结的真实控制台验收
  背景:
    假如运维验收租户已有已登录的所有者和空站点

  @case-operations-001
  场景: 审计完整导出与用量页面
    当我打开用量与审计并导出全部记录
    那么我能下载包含该租户创建动作的审计CSV

  @case-operations-002
  场景: 创建停用的Webhook订阅
    当我创建一个停用的Webhook订阅
    那么订阅显示停用且提供一次可见的签名密钥

  @case-operations-003
  场景: 搜索顺序异步受理
    当我将站点搜索顺序改为正文优先
    那么配置显示已受理且后端保存正文优先

  @case-operations-004
  场景: 删除确认中的名称冲突保留输入
    当站点在删除确认期间被改名
    那么旧名称删除被拒绝且确认输入仍保留

  @case-operations-005
  场景: 注销后的审计保留稳定身份并脱敏
    当一个有审计历史的用户完成注销
    那么平台审计显示已注销用户且不再显示来源IP

  @case-operations-006
  场景: 窄屏键盘确认永久删除空站点
    当我在窄屏通过键盘确认删除空站点
    那么站点读取返回不存在且删除确认已关闭

  @case-operations-007
  场景: 审计切换租户不泄漏旧记录且断网可恢复
    当我切换到另一个租户并恢复审计网络连接
    那么审计仅显示当前租户记录且会话仍然有效

  @case-operations-008
  场景: 普通成员不能查看审计与租户统计
    当普通成员登录并直接打开运维页面
    那么审计拒绝访问且统计不显示无权数据

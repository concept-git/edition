# language: zh-CN
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/platform/webhook/SYNCS.md
@area-platform @suite-console
@webhooks
功能: Webhook 订阅与投递的真实接收端验收
  接收端是本机 HTTPS 服务，按 Standard Webhooks v1 独立校验签名；Control 仅对 localhost 豁免公网地址检查。

  背景:
    假如Webhook验收租户有所有者、两个空间和本机HTTPS接收端

  @case-webhooks-001
  场景: 发布页面后接收端收到可校验的签名事件
    当我在控制台为第一个空间创建指向接收端的page.published订阅并保存密钥
    并且第一个空间发布一个页面
    那么接收端收到1次该页面的page.published事件且签名均有效
    并且投递记录显示执行完成且最近一次为HTTP 204

  @case-webhooks-002
  场景: 接收端暂时故障后自动重试成功
    假如接收端对第一次投递返回503
    并且第一个空间已有指向接收端的page.published订阅
    当第一个空间发布一个页面
    那么接收端收到2次该页面的page.published事件且签名均有效
    并且投递记录显示执行完成并依次保留HTTP 503与HTTP 204两次尝试

  @case-webhooks-003
  场景: 永久拒绝后人工重发同一事件
    假如接收端对第一次投递返回400
    并且第一个空间已有指向接收端的page.published订阅
    当第一个空间发布一个页面
    那么投递记录显示失败且只尝试1次
    当我在投递记录中重发此事件
    那么接收端收到2次该页面的page.published事件且签名均有效
    并且投递记录显示执行完成且最近一次为HTTP 204

  @case-webhooks-004
  场景: 未放行的私网地址被拒绝且不发出请求
    假如第一个空间已有指向接收端回环IP地址的page.published订阅
    当第一个空间发布一个页面
    那么投递记录显示失败且尝试历史为destination_rejected
    并且接收端没有收到任何请求

  @case-webhooks-005
  场景: 停用与范围外的订阅不产生投递
    假如第一个空间已有指向接收端的page.published订阅
    并且有一个停用的租户范围订阅和一个第二个空间的订阅
    当第一个空间发布一个页面
    那么接收端收到1次该页面的page.published事件且签名均有效
    并且停用订阅与第二个空间订阅都没有投递记录

  @case-webhooks-006
  场景: 轮换密钥后新投递只用新密钥签名
    假如第一个空间已有指向接收端的page.published订阅
    当我在控制台轮换该订阅的密钥并保存新密钥
    并且第一个空间发布一个页面
    那么接收端收到1次该页面的page.published事件且签名均有效
    并且该事件不能用轮换前的密钥校验

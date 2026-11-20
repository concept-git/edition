# language: zh-CN
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/hosting/readersecurity/SYNCS.md
# 规格依据: backend/apps/content/src/main/java/io/space/contentapp/SYNCS.md
@area-hosting @suite-private
@issue-36
功能: 独立私有阅读
  背景:
    假如 私有阅读验收采用独立 HTTPS 拓扑

  @case-private-reader-001
  场景: 无脚本完整私有阅读
    那么 无脚本私有正文、目录、前后篇、搜索、附件及匿名 sitemap

  @case-private-reader-002
  场景: 权限与主域变化
    那么 权限收窄即时阻断，主域名切换要求重新登录，移动端表单可用

  @short-reader
  @case-private-reader-003
  场景: 自动续期
    那么 [短凭据] 有脚本自动续期保留搜索和原页面

  @short-reader
  @case-private-reader-004
  场景: 无脚本续期
    那么 [短凭据] 无脚本通过同域 POST 续期，共享主库故障保留凭据

  @short-reader
  @case-private-reader-005
  场景: 刷新限流恢复
    那么 [短凭据] 自动续期遵守 Retry-After 且保留搜索

  @case-private-reader-006
  场景: 共享主库故障与恢复
    那么 共享主库离线时拒绝阅读，恢复后既有会话仍可读取

  @case-private-reader-007
  场景: 站点内登录和阅读历史
    那么 读者能新登录、续期并保存历史

  @case-private-reader-008
  场景: 搜索故障下的既有阅读
    那么 搜索引擎离线时，既有会话仍可读取私有正文

  @case-private-reader-009
  场景: 全局账号停用屏障
    那么 全局停用读者账号确认后立即阻断旧阅读会话

  @case-private-reader-010
  场景: 机器资源接口完整性与撤权
    那么 机器资源经 Caddy 完整分页读取并校验撤权与切版

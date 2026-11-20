# language: zh-CN
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/hosting/site/SYNCS.md
@area-hosting @suite-console
@issue-21 @site-management
功能: 站点管理与挂载
  管理员可创建站点、把空间挂到 slug，并按挂载表排序与授权

  @smoke
  @case-site-management-001
  场景: 建站后挂载空间并看到有序挂载表
    假如 已有一个租户和它的所有者
    当 所有者登录并打开成员页
    并且 所有者打开空间页
    并且 所有者创建名称为 "API 手册" 模式为 "站内创作" 的空间
    并且 所有者打开站点页
    并且 所有者创建名称为 "文档站" 的站点
    并且 所有者把当前空间挂到 slug "api"
    那么 挂载表按顺序显示 "api"

  @smoke
  @case-site-management-002
  场景: 同 slug 挂不同空间返回 409 slug_taken
    假如 已有一个租户和它的所有者
    并且 该租户有两个空间和一个站点
    当 所有者把第一个空间挂到 slug "api"
    并且 所有者把第二个空间挂到同一 slug "api"
    那么 站点挂载返回 409 slug_taken

  @smoke
  @case-site-management-003
  场景: 站点管理员授权后成员可管理该站
    假如 已有一个租户和它的所有者
    并且 该租户有一名站点验收成员
    并且 该租户有一个空站点
    当 所有者把该成员授为站点管理员
    那么 该成员可以读取并改名该站点

  @smoke
  @case-site-management-004
  场景: 普通成员不能创建站点
    假如 已有一个租户和它的所有者
    并且 该租户有一名站点验收成员
    当 该成员尝试创建名称为 "越权站点" 的站点
    那么 创建站点返回 403 permission_denied

  @smoke
  @case-site-management-005
  场景: 路径租户不能借根权限读取另一个租户的站点
    假如 已有两个租户及各自所有者和站点
    当 第一个租户所有者用自己的租户路径读取该站点
    那么 站点读取返回 404 site_not_found

  @smoke
  @case-site-management-006
  场景: 仍有挂载时删除站点返回 409 site_not_empty
    假如 已有一个租户和它的所有者
    并且 该租户有两个空间和一个站点
    当 所有者把第一个空间挂到 slug "api"
    并且 所有者删除该站点
    那么 删除站点返回 409 site_not_empty

# language: zh-CN
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/hosting/customdomain/SYNCS.md
@area-hosting @suite-console
@issue-22 @domain-management
功能: 域名管理
  管理员可为站点绑定自定义域名、凭 TXT 核验所有权、设主域名；Caddy ask 只放行已核验 host

  @smoke
  @case-domain-management-001
  场景: 绑定后写入 TXT 核验即成为主域名
    假如 已有一个租户和它的所有者
    当 所有者登录并打开成员页
    并且 所有者打开站点页
    并且 所有者创建名称为 "文档站" 的站点
    并且 所有者打开域名胶囊
    并且 所有者绑定一个验收用自定义域名
    那么 页面显示 TXT 校验记录
    当 运维写入该 TXT 桩
    并且 所有者核验该域名
    那么 该域名显示为主域名

  @smoke
  @case-domain-management-002
  场景: 他租户绑定已被占用的域名返回 409 domain_taken
    假如 已有两个租户及各自所有者和站点
    当 第一个租户所有者绑定一个验收用自定义域名
    并且 第二个租户所有者绑定同一自定义域名
    那么 绑定域名返回 409 domain_taken

  @smoke
  @case-domain-management-003
  场景: ask 只放行已核验域名
    假如 已有一个租户和它的所有者
    并且 该租户有一个空站点
    当 第一个租户所有者绑定一个验收用自定义域名
    并且 询问该域名是否允许签发
    那么 域名 ask 返回 404
    当 运维写入该 TXT 桩
    并且 所有者通过接口核验该域名
    并且 询问该域名是否允许签发
    那么 域名 ask 返回 200
    当 询问缺失域名是否允许签发
    那么 域名 ask 返回 404

  @case-domain-management-004
  场景: 未写入 TXT 时核验返回 422 not_proven
    假如 已有一个租户和它的所有者
    并且 该租户有一个空站点
    当 第一个租户所有者绑定一个验收用自定义域名
    并且 所有者通过接口核验该域名
    那么 核验域名返回 422 not_proven

  @case-domain-management-005
  场景: 删除空站点时自动解绑自定义域名
    假如 已有一个租户和它的所有者
    并且 该租户有一个空站点
    当 第一个租户所有者绑定一个验收用自定义域名
    并且 所有者删除该站点
    那么 删除站点成功且域名详情不再存在

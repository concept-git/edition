# language: zh-CN
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/hosting/site/SYNCS.md
# 规格依据: backend/apps/content/src/main/java/io/space/contentapp/SYNCS.md
@area-hosting @suite-console
@issue-23 @serve
功能: 阅读访问
  匿名读者经已核验主域名只看到完整主版本，页面、目录与 SEO 投影保持一致

  @smoke
  @case-serve-001
  场景: 主版本页面可读且别名归一
    假如 已有一个租户和它的所有者
    并且 该租户已有一个公开主版本站点
    那么 管理台空间页提供查看线上链接
    当 匿名读者打开主版本页面
    那么 读者看到主版本正文与 canonical
    并且 读者侧边栏包含该页面
    当 匿名读者从非主域名访问同一路径
    那么 请求 301 到主域名同一路径
    当 匿名读者访问站点 sitemap 和 robots
    那么 sitemap 只列出可读主版本且 robots 允许抓取

  @case-serve-002
  场景: 草稿不可见且撤销公开授权返回 403
    假如 已有一个租户和它的所有者
    并且 该租户已有一个公开主版本站点
    当 所有者再创建一个未进版页面
    那么 匿名读者访问该草稿得到 404
    当 所有者撤销站点公开授权
    那么 匿名读者访问原主版本得到 403

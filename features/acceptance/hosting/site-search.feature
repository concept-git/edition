# language: zh-CN
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/platform/search/SYNCS.md
# 规格依据: backend/apps/content/src/main/java/io/space/contentapp/SYNCS.md
@area-hosting @suite-console
@issue-25 @site-search
功能: 站内搜索
  匿名读者能搜索公开站点的主版本内容，未进版草稿不进入结果；搜索结果页支持无脚本访问

  @case-site-search-001
  场景: 主版本中文内容可搜且草稿不可搜
    假如 已有一个租户和它的所有者
    并且 该租户已有一个公开主版本站点
    当 匿名读者搜索主版本中文内容
    那么 搜索结果链接到当前页面地址并高亮摘要
    当 所有者再创建一个未进版页面
    那么 匿名读者搜索草稿标题得到空结果

  @case-site-search-002
  场景: 搜索结果页支持无脚本访问
    假如 已有一个租户和它的所有者
    并且 该租户已有一个公开主版本站点
    当 匿名读者打开站内搜索结果页
    那么 搜索结果页可见且禁止索引

# language: zh-CN
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/hosting/sitedelivery/SYNCS.md
# 规格依据: backend/apps/content/src/main/java/io/space/contentapp/SYNCS.md
@area-hosting @suite-delivery
@issue-25 @independent-delivery
功能: 独立交付站内搜索
  管理应用与阅读应用独立运行，读者只检索当前可见主版本

  背景:
    假如 独立交付站点已上线二十四个公开页面

  @case-site-search-independent-001
  场景: 搜索遵循交付版本与权限
    那么 完整分页、当前内容核验、跨代重搜与双进程撤权

  @case-site-search-independent-002
  场景: 即时搜索完整交互
    那么 即时搜索取消、IME、键盘、错误重试与品牌色

  @case-site-search-independent-003
  场景: 无脚本读者也可搜索和翻页
    那么 真实禁用脚本的表单搜索及下一页

  @case-site-search-independent-004
  场景: 站点随发版回滚和挂载更新
    那么 发版回滚和挂载变化遵循线上版本，工作稿不可搜索

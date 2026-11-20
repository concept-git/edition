# language: zh-CN
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/releases/bundleexport/SYNCS.md
@area-releases @suite-console
@serial
功能: 可携带 Bundle 导出
  背景:
    假如 所有者已准备可携带发版与附件

  @smoke
  @case-bundle-export-001
  场景: 浏览器下载完整文件并再次导入
    当 所有者在发版详情生成并下载发版包
    那么 下载的发版包可重新导入并保留正文和图标

  @case-bundle-export-002
  场景: 下载时重新检查页面权限
    当 所有者已生成可下载发版包
    那么 页面权限收窄后下载被拒绝并显示追踪号

  @case-bundle-export-003
  场景: 对象服务故障恢复与过期再生成
    那么 对象服务故障后原导出恢复且过期文件可重新生成

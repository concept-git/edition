# language: zh-CN
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/authoring/pageediting/SYNCS.md
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/authoring/attachmentbrowsing/SYNCS.md
@area-authoring @suite-console
@issue-13 @page-authoring
功能: 页面属性与附件
  作者可在编辑器里维护页面 SEO、属性与附件；这些改动不动内容基线，附件按内容寻址存入对象存储

  背景:
    假如 已有一个租户和它的所有者
    当 所有者登录并打开成员页
    并且 所有者打开空间页
    并且 所有者创建名称为 "页面创作" 模式为 "站内创作" 的空间
    并且 所有者在该空间创建 Markdown 页面 "快速开始" slug "quick-start"

  @smoke
  @case-page-metadata-001
  场景: 保存 SEO 后重新打开编辑器可完整回显且基线不变
    当 所有者把页面内容保存为 "# 正文"
    并且 所有者在 SEO 面板填写描述 "分页查询入门" 与分享图 "https://cdn.example.com/og.png" 并勾选不索引
    那么 SEO 面板提示已保存且页面编辑器显示基线 1
    当 所有者重新打开该页面编辑器
    那么 SEO 面板回显描述 "分页查询入门"、分享图 "https://cdn.example.com/og.png" 且不索引已勾选

  @case-page-metadata-002
  场景: 属性逐行增删且非法键名内联拒绝
    当 所有者在属性面板添加 "doc_type" = "api"
    并且 所有者在属性面板添加 "product" = "ecs"
    那么 属性面板列出 2 个属性
    当 所有者在属性面板删除属性 "product"
    那么 属性面板只剩属性 "doc_type"
    当 所有者在属性面板尝试添加键名 "9bad" = "x"
    那么 属性面板对键名给出内联错误且仍只有 1 个属性

  @case-page-metadata-003
  场景: 上传附件后可预览，解除后下载访问被拒绝
    当 所有者在附件面板上传一张 PNG 图片 "diagram.png"
    那么 附件面板列出 "diagram.png" 且类型为 "image/png"
    当 所有者点击该附件的预览
    那么 附件面板显示可加载的鉴权图片
    当 所有者解除附件 "diagram.png"
    那么 附件面板不再列出 "diagram.png"
    并且 该附件的鉴权下载接口返回 404 attachment_not_found

  @case-page-metadata-004
  场景: 超限与伪装类型的文件被 422 拒绝
    当 所有者在附件面板上传一个 11 MiB 的文件 "huge.png"
    那么 附件面板提示 "附件不能超过 10 MiB"
    当 所有者在附件面板上传一个改名为 "notes.png" 的文本文件
    那么 附件面板提示 "只接受 PNG、JPEG、GIF、WebP 与 PDF"

  @case-page-metadata-005
  场景: 外部同步空间的页面三面板只读
    假如 该租户有一个外部同步空间及其导入页面
    当 所有者打开该导入页面的编辑器
    那么 页面设置的 SEO、属性与附件面板均不存在写控件

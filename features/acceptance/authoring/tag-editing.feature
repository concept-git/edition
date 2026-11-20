# language: zh-CN
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/authoring/tagging/SYNCS.md
@area-authoring @suite-console
@issue-15 @tag-editing
功能: 页面标签
  作者可给页面打标签与摘除；列表按标签过滤；改名与聚合走接口

  背景:
    假如 已有一个租户和它的所有者
    当 所有者登录并打开成员页
    并且 所有者打开空间页
    并且 所有者创建名称为 "页面创作" 模式为 "站内创作" 的空间
    并且 所有者在该空间创建 Markdown 页面 "快速开始" slug "quick-start"

  @smoke
  @case-tag-editing-001
  场景: 打标摘除立刻生效且不移动基线
    当 所有者在标签面板打上 "Guide"
    那么 标签面板列出 "guide"
    并且 页面编辑器显示基线 0
    当 所有者重新打开该页面编辑器
    那么 标签面板列出 "guide"
    并且 页面编辑器显示基线 0
    当 所有者在标签面板摘除 "guide"
    那么 标签面板不再列出 "guide"

  @case-tag-editing-002
  场景: 输入联想已有标签
    假如 所有者通过接口给该空间另一页打上 "guide"
    当 所有者在标签面板输入 "g"
    那么 标签联想列出 "guide"
    当 所有者点选联想 "guide"
    那么 标签面板列出 "guide"

  @case-tag-editing-003
  场景: 页面列表按标签过滤
    假如 所有者通过接口给该页打上 "guide"
    当 所有者打开该空间的页面列表
    并且 所有者点击行上的标签 "guide"
    那么 地址包含标签过滤 "guide"
    并且 页面列表显示 "快速开始"
    当 所有者打开带标签过滤 "missing" 的页面列表
    那么 页面列表没有符合条件的页面

  @case-tag-editing-004
  场景: 外部同步空间标签只读且写接口被拒
    假如 该租户有一个外部同步空间及其导入页面
    当 所有者打开该导入页面的编辑器
    那么 标签面板不存在写控件
    并且 向该导入页面打标返回 409 space_mode_restricted

  @case-tag-editing-005
  场景: 非法标签与单页上限被接口拒绝
    那么 给该页打上超长标签返回 422 validation_failed
    并且 给该页打满 50 个后再打一个返回 422 too_many_tags

  @case-tag-editing-006
  场景: 改名合并、空操作与缺失
    假如 所有者通过接口给该页打上 "beta"
    并且 所有者通过接口给该页打上 "guide"
    当 所有者通过接口把标签 "beta" 改名为 "guide"
    那么 该页标签为 "guide"
    并且 把标签 "guide" 改名为自身返回 200
    并且 把不存在的标签改名返回 404 tag_not_found

  @case-tag-editing-007
  场景: 改名不越租户
    假如 所有者通过接口给该页打上 "secret"
    并且 另一租户有同名标签 "secret"
    当 所有者通过接口把标签 "secret" 改名为 "revealed"
    那么 该页标签为 "revealed"
    并且 另一租户标签仍为 "secret"

  @case-tag-editing-008
  场景: 目录页数只计可见页且空聚合不 404
    假如 所有者通过接口给该页打上 "guide"
    那么 标签目录包含 "guide" 且页数为 1
    并且 不存在标签的聚合页返回空列表 200
    当 所有者通过接口摘除该页的 "guide"
    那么 标签目录不包含 "guide"

  @case-tag-editing-009
  场景: 读者不能打标且无写控件
    假如 所有者通过接口给该页打上 "guide"
    并且 该空间有一名只有阅读权限的成员
    当 该成员打开该页面编辑器
    那么 标签面板不存在写控件
    并且 该成员给该页打标返回 403 permission_denied

  @case-tag-editing-010
  场景: 归档拒绝打标且跨租户不可见
    假如 所有者通过接口给该页打上 "secret"
    当 所有者归档该空间
    那么 给该页打标返回 409 space_archived
    并且 另一租户看不到标签 "secret"

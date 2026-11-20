# language: zh-CN
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/releases/bundleimport/SYNCS.md
@area-releases @suite-console
@issue-40 @import
功能: 远程地址导入与目录树适配
  外部同步空间可给一个公开 https 地址让服务端拉取发版包进入既有导入流水线；
  普通"目录即层级、md/html 即页面"的文档仓库无需任何标记即可导入。
  夹具由验收进程内的本机 HTTPS 服务提供（后端以 IMPORT_REMOTE_ALLOWED_HOSTS=localhost 信任），不访问外网。

  背景:
    假如 已有一个租户和它的所有者
    当 所有者登录并打开成员页
    并且 所有者打开空间页

  @smoke
  @case-import-remote-001
  场景: 令牌以远程地址导入目录树夹具后自动发版且目录与 slug 符合映射
    当 所有者创建名称为 "远程手册" 模式为 "外部同步" 的空间
    并且 所有者签发绑定该空间的导入令牌
    并且 夹具 "F-tree-mini" 已发布为远程地址
    并且 令牌以幂等键从远程地址导入
    那么 导入作业已完成且结果为 "promoted"
    并且 主版本 generator 为 "file-tree"
    并且 导入作业记录了该远程地址
    并且 主版本包含页面 "02-guides/install.md"
    并且 主版本包含页面 "01-getting-started.md"
    并且 主版本包含页面 "02-guides/faq.html"
    并且 主版本包含页面 "reference/api.html"
    并且 主版本目录含分组 "Guides" 且其下有页面 "02-guides/install.md"
    并且 主版本不含来自 ".github" 或 "LICENSE" 的页面

  @smoke
  @case-import-remote-002
  场景: 所有者在发版页填写远程地址导入并轮询到主版本
    当 所有者创建名称为 "远程界面" 模式为 "外部同步" 的空间
    并且 夹具 "F-tree-mini" 已发布为远程地址
    并且 所有者打开该空间的发版
    并且 所有者在发版页选择远程地址来源、填写地址并提交
    那么 发版页作业显示完成且结果为 "promoted"
    并且 发版页作业显示来源地址
    并且 发版页作业显示识别为 "目录树"

  @case-import-remote-003
  场景: html 页面进入主版本且相对图片成为附件
    当 所有者创建名称为 "预览手册" 模式为 "外部同步" 的空间
    并且 所有者签发绑定该空间的导入令牌
    并且 夹具 "F-tree-mini" 已发布为远程地址
    并且 令牌以幂等键从远程地址导入
    那么 导入作业已完成且结果为 "promoted"
    并且 主版本页面 "02-guides/faq.html" 的格式为 "html"
    # HTML 原文保存，链接与 head 不改写
    并且 主版本页面 "02-guides/faq.html" 的正文包含 "href=\"install.md\""
    并且 主版本页面 "02-guides/install.md" 带有 1 个附件
    并且 主版本页面 "02-guides/install.md" 的附件资源路径为 "02-guides/img/arch.png"
    并且 主版本页面 "02-guides/install.md" 的正文包含 "img/arch.png"

  @case-import-remote-004
  场景: 目录 index.md 的标题成为目录分组名并排在首位
    当 所有者创建名称为 "分组手册" 模式为 "外部同步" 的空间
    并且 所有者签发绑定该空间的导入令牌
    并且 夹具 "F-tree-mini" 已发布为远程地址
    并且 令牌以幂等键从远程地址导入
    那么 导入作业已完成且结果为 "promoted"
    并且 主版本目录分组 "Guides" 的第一项是页面 "02-guides/index.md"
    并且 主版本页面 "02-guides/install.md" 的标题为 "Install"

  @case-import-remote-005
  场景: 同一地址内容未变再导入会 skip
    当 所有者创建名称为 "远程跳过" 模式为 "外部同步" 的空间
    并且 所有者签发绑定该空间的导入令牌
    并且 夹具 "F-tree-mini" 已发布为远程地址
    并且 令牌以幂等键从远程地址导入
    那么 导入作业已完成且结果为 "promoted"
    当 令牌以新幂等键从远程地址导入
    那么 导入作业已完成且结果为 "skipped"
    并且 主版本标识未变

  @case-import-remote-006
  场景: 地址内容变更后按 externalId 对账
    当 所有者创建名称为 "远程对账" 模式为 "外部同步" 的空间
    并且 所有者签发绑定该空间的导入令牌
    并且 夹具 "F-tree-mini" 已发布为远程地址
    并且 令牌以幂等键从远程地址导入
    那么 导入作业已完成且结果为 "promoted"
    并且 记住页面 "01-getting-started.md" 的标识
    并且 记住页面 "reference/api.html" 的标识
    当 夹具 "F-tree-mini-v2" 已发布为远程地址
    并且 令牌以新幂等键从远程地址导入
    那么 导入作业已完成且结果为 "promoted"
    并且 主版本不包含页面 "02-guides/faq.html"
    并且 主版本页面 "02-guides/install.md" 的正文包含 "v2"
    # frontmatter id 使页面在目录搬家后保留稳定 id，只换 slug
    并且 页面 "02-guides/03-getting-started.md" 的标识与记住的 "01-getting-started.md" 一致
    # 无 frontmatter 的 html 搬家 = 路径即 externalId，旧页回收、新页新建
    并且 主版本不包含页面 "reference/api.html"
    并且 页面 "02-guides/api.html" 的标识与记住的 "reference/api.html" 不同

  @case-import-remote-007
  场景大纲: 被拒绝的远程地址不建作业不建发版
    当 所有者创建名称为 "<空间>" 模式为 "外部同步" 的空间
    并且 所有者签发绑定该空间的导入令牌
    并且 令牌以幂等键从地址 "<地址>" 导入
    那么 导入返回 422 "<code>"
    并且 该空间没有发版记录
    并且 该空间没有导入作业

    例子:
      | 空间 | 地址 | code |
      | 私网地址手册 | https://127.0.0.1:9/main.zip | import_source_forbidden |
      | 明文地址手册 | http://example.com/main.zip | import_source_forbidden |
      | 不存在地址手册 | https://nonexistent.invalid/main.zip | import_source_unreachable |

  @case-import-remote-008
  场景: 地址返回的不是发版包时当场拒绝
    当 所有者创建名称为 "非发版包手册" 模式为 "外部同步" 的空间
    并且 所有者签发绑定该空间的导入令牌
    并且 一段文本已发布为远程地址
    并且 令牌以幂等键从远程地址导入
    那么 导入返回 422 "invalid_bundle"
    并且 该空间没有导入作业

  @case-import-remote-009
  场景: 超过远程上限的地址被拒绝
    当 所有者创建名称为 "超限手册" 模式为 "外部同步" 的空间
    并且 所有者签发绑定该空间的导入令牌
    并且 一个超过远程上限的文件已发布为远程地址
    并且 令牌以幂等键从远程地址导入
    那么 导入返回 422 "file_too_large"
    并且 该空间没有导入作业

  @case-import-remote-010
  场景: 站内创作空间拒绝远程地址导入
    当 所有者创建名称为 "创作远程" 模式为 "站内创作" 的空间
    并且 夹具 "F-tree-mini" 已发布为远程地址
    并且 所有者用会话从远程地址导入
    那么 导入返回 409 "space_mode_restricted"
    并且 该空间没有发版记录

  @case-import-remote-011
  场景: 没有任何可成页文件的包完成 invalid_bundle
    当 所有者创建名称为 "空包手册" 模式为 "外部同步" 的空间
    并且 所有者签发绑定该空间的导入令牌
    并且 令牌以幂等键导入夹具 "F-unknown"
    那么 导入作业已完成且结果为 "invalid_bundle"
    并且 该空间没有发版记录

  @case-import-remote-012
  场景: 导出主版本发版包后再导入回环为 skip
    当 所有者创建名称为 "回环手册" 模式为 "外部同步" 的空间
    并且 所有者签发绑定该空间的导入令牌
    并且 夹具 "F-tree-mini" 已发布为远程地址
    并且 令牌以幂等键从远程地址导入
    那么 导入作业已完成且结果为 "promoted"
    当 所有者导出主版本并下载发版包
    并且 令牌以新幂等键导入下载的发版包
    那么 导入作业已完成且结果为 "skipped"
    并且 主版本标识未变

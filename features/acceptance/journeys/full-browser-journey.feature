# language: zh-CN
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/iam/registration/SYNCS.md
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/iam/membership/SYNCS.md
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/authoring/pageediting/SYNCS.md
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/releases/bundleimport/SYNCS.md
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/hosting/site/SYNCS.md
@area-journeys @suite-console
@full-journey @import
功能: PRD 全链路浏览器旅程
  同一批用户、租户、空间与内容从管理面写入，经过独立交付投影后在读者面查看和搜索；
  业务动作使用可见界面，只有邮件、平台运营身份和 DNS 证明使用受控验收夹具。

  @case-full-browser-journey-001
  场景: 从注册授权到导入发布阅读搜索
    当 两位新用户分别通过浏览器注册、验证并登录
    并且 平台运营员通过浏览器为第一位用户开通租户
    并且 第一位用户通过浏览器邀请第二位用户加入租户
    并且 第一位用户创建站内创作空间并在授权前后验证第二位用户的访问
    那么 第二浏览器中的成员可立即打开该空间
    当 第一位用户创建分组并把空间移入该分组
    并且 第一位用户创建页面、保存中文正文、打标签并按标签过滤
    并且 第一位用户创建外部同步空间并从发版页导入发版包
    并且 第一位用户把创作页面进版
    并且 第一位用户创建站点、挂载创作空间并核验域名
    并且 第一位用户通过站点授权界面向匿名访客开放阅读
    那么 独立读者最终可以查看正式中文正文
    并且 独立读者通过浏览器搜索命中该页面

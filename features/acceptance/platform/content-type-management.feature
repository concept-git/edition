# language: zh-CN
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/platform/contenttype/SYNCS.md
@area-platform @suite-console
@content-plugins @content-type-management
功能: 在线内容类型定义与独立交付
  @case-content-type-management-001
  场景: 类型定义在线演进并保持已有绑定和独立交付
    假如 内容类型管理已有独立租户与站点
    当 管理员在界面登记自定义 Schema 类型
    而且 作者按新类型编辑保存并交付
    而且 管理员登记新定义版本并切换默认
    而且 开发工具按原定义版本验证在线类型样例
    那么 已绑定内容和线上呈现仍使用原定义版本
    当 管理员停用这个内容类型
    那么 新建不能选择停用类型而既有绑定和共用实现仍可交付

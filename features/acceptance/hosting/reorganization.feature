# language: zh-CN
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/hosting/reorganization/SYNCS.md
@area-hosting @suite-console
@issue-24 @reorganization
功能: 重组零断链
  页面与挂载地址变化、跨空间转移后，旧外链单跳到目标现地址

  @case-reorganization-001
  场景: 连续改页面地址与改挂载地址
    假如 已有一个租户和它的所有者
    并且 该租户已有一个公开主版本站点
    当 所有者连续修改页面 slug
    那么 最早页面地址单跳到最终地址且正文一致
    当 所有者修改站点挂载 slug
    那么 旧挂载前缀单跳到新挂载地址
    并且 自动重定向规则不可删除

  @case-reorganization-002
  场景: 跨空间转移页面
    假如 已有一个租户和它的所有者
    并且 该租户已有一个公开主版本站点
    当 所有者把页面转移到另一个已挂载空间
    那么 源地址单跳到目标空间且正文一致

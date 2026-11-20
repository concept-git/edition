# language: zh-CN
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/iam/team/SYNCS.md
@area-iam @suite-console
@team @acceptance
功能: Team 生命周期
  作为租户所有者
  我希望创建并删除 Team
  以便维护可被授权引用的稳定群体身份

  @case-team-management-001
  场景: 创建者成为首位所有者并可原子删除
    假如 已有一个租户和它的所有者
    当 所有者在 Team 页创建一个 Team
    那么 Team 列表显示一位所有者
    当 所有者强确认删除该 Team
    那么 Team 不再出现在列表

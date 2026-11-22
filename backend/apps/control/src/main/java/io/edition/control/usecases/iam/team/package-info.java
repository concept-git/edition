/**
 * Team 生命周期与成员 flow；唯一规格为同包 SYNCS.md。
 *
 * <p>拥有：Team 面的 sync、Team 特有的可读性规则（{@code TeamAccess}）与 Team 自身的 error case
 * （team_name_invalid / team_name_taken / team_not_found）。成员关系的错误词汇与角色解析复用
 * invitation 包；租户准入复用组合根 {@code TenantAccess}；响应投影 {@code TeamProjection}。
 * 不拥有 Team 状态，不暴露 HTTP。
 */
@org.springframework.modulith.NamedInterface("iam")
package io.edition.control.usecases.iam.team;

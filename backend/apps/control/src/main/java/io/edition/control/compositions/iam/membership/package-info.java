/**
 * 成员与邀请 flow：接收邀请、接受及成员管理请求，产出成员关系和根授权联动。
 *
 * <p>拥有：邀请 sync、{@code MembershipEvents.InviteMailRequested} 到共享加密 mail outbox 的唯一桥接、
 * 成员关系的公开 error case 词汇（already_member / last_owner / member_not_found /
 * tenant_membership_required / team_last_owner …，供 team 复用）以及邀请生命周期
 * error case（{@code InvitationErrors}）。角色与邮箱归一 {@code MemberRoles}。
 * 依赖方向只能是 team → 本包。
 * 不负责平台开通、注册流程或租户准入规则（后者在组合根 {@code TenantAccess}）。
 */
@org.springframework.modulith.NamedInterface("iam")
package io.edition.control.compositions.iam.membership;

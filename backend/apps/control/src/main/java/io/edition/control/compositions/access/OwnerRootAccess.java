package io.edition.control.compositions.access;

import io.edition.concepts.membership.api.MembershipApi.Group;
import io.edition.concepts.membership.api.MembershipApi.MemberId;
import io.edition.concepts.membership.api.MembershipApi.Role;
import io.edition.concepts.permission.api.PermissionApi;
import io.edition.concepts.permission.api.PermissionApi.Principal;
import io.edition.concepts.permission.api.PermissionApi.PrincipalType;
import io.edition.concepts.permission.api.PermissionApi.Resource;
import io.edition.concepts.permission.api.PermissionApi.ResourceType;
import org.springframework.stereotype.Component;

/**
 * 成员角色与资源授权之间的唯一同步点：owner 自动持有群体根的 admin。
 *
 * <p>放在独立组件而非某个 flow 里，是因为三条 flow（开通落座、接受邀请、调整角色）都要用它——
 * 让它们互相注入 *Syncs 会把 flow 变成彼此的依赖。各 flow 的同名 sync 方法只做转发，
 * 规格与代码仍可机械 diff。
 *
 * <p>调用方必须已处于目标租户的上下文中（`TenantScopeApi.inTenant`）：
 * `iam.permission_grants.tenant_id` 默认取 `app.tenant_id`，脱离上下文写入会留下 NULL，
 * 等票 29 打开 RLS 时这些行就成了没人看得见的孤儿。
 */
@Component
public final class OwnerRootAccess {

    private static final PermissionApi.Role ADMIN = new PermissionApi.Role("admin");

    private final PermissionApi permissions;

    OwnerRootAccess(PermissionApi permissions) {
        this.permissions = permissions;
    }

    public void grant(Group group, MemberId member, Role role) {
        if (role != Role.OWNER) {
            return;
        }
        permissions.grant(resource(group), principal(member), ADMIN);
    }

    public void revoke(Group group, MemberId member) {
        permissions.revoke(resource(group), principal(member));
    }

    private static Resource resource(Group group) {
        return switch (group.type()) {
            case TENANT -> new Resource(ResourceType.TENANT, group.id());
            case TEAM -> new Resource(ResourceType.TEAM, group.id());
        };
    }

    private static Principal principal(MemberId member) {
        return new Principal(PrincipalType.USER, member.value());
    }
}

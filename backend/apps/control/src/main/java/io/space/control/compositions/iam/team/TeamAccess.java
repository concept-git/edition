package io.space.control.compositions.iam.team;

import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.permission.api.PermissionApi.Resource;
import io.space.concepts.team.api.TeamApi;
import io.space.control.compositions.access.PermissionDeniedException;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.principal.PrincipalResolver.Resolution;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Component;

/**
 * Team flow 的访问投影：在 {@link TenantAccess} 的租户准入之上，加上 Team 归属核对与
 * "租户 admin 或 Team 成员可读"这一条 Team 特有规则。租户准入本身不在这里重复。
 */
@Component
class TeamAccess {

    private final TenantAccess tenants;
    private final MembershipApi memberships;
    private final TeamApi teams;

    TeamAccess(TenantAccess tenants, MembershipApi memberships, TeamApi teams) {
        this.tenants = tenants;
        this.memberships = memberships;
        this.teams = teams;
    }

    /** 准入 + 租户根 admin；返回已解析主体供后续复用。 */
    Resolution requireTenantAdmin(String credential, UUID tenant) {
        return tenants.requireUser(credential, tenant, tenantChain(tenant), TenantAccess.ADMIN);
    }

    /** 准入 + [tenant, team] admin（租户 admin 由外层继承，Team owner 只持 Team 根）。 */
    Admitted requireTeamAdmin(String credential, UUID tenant, UUID team) {
        var resolution = tenants.admitUser(credential, tenant);
        var group = requireTeam(tenant, team);
        if (!tenants.allows(resolution, tenant, chain(tenant, team), TenantAccess.ADMIN)) {
            throw new PermissionDeniedException();
        }
        return new Admitted(resolution, group);
    }

    /** 可读 = 租户 admin 或 Team 成员；两者皆非时对外按 not-found 收口，不暴露 Team 存在性。 */
    Admitted requireReadable(String credential, UUID tenant, UUID team) {
        var resolution = tenants.admitUser(credential, tenant);
        var group = requireTeam(tenant, team);
        boolean visible = isTenantAdmin(resolution, tenant)
                || tenants.inTenant(
                        tenant,
                        () -> memberships.isMember(
                                group,
                                new MembershipApi.MemberId(
                                        resolution.principal().id())));
        if (!visible) {
            throw new TeamTypes.TeamNotFoundException();
        }
        return new Admitted(resolution, group);
    }

    boolean isTenantAdmin(Resolution resolution, UUID tenant) {
        return tenants.allows(resolution, tenant, tenantChain(tenant), TenantAccess.ADMIN);
    }

    /** Team 必须真实属于路径上的租户，否则按 not-found 收口。 */
    MembershipApi.Group requireTeam(UUID tenant, UUID team) {
        var view = tenants.inTenant(tenant, () -> teams.view(new TeamApi.TeamId(team)))
                .filter(candidate -> candidate.scope().equals(tenant))
                .orElseThrow(TeamTypes.TeamNotFoundException::new);
        return MembershipApi.Group.team(view.scope(), view.id().value());
    }

    static List<Resource> tenantChain(UUID tenant) {
        return List.of(TenantAccess.tenant(tenant));
    }

    static List<Resource> chain(UUID tenant, UUID team) {
        return List.of(TenantAccess.tenant(tenant), TenantAccess.team(team));
    }

    /** 已准入的调用方与其目标 Team 群体。 */
    record Admitted(Resolution resolution, MembershipApi.Group group) {}
}

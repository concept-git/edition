package io.space.control.compositions.iam.team;

import static io.space.control.compositions.iam.team.TeamTypes.*;

import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.membership.api.MembershipApi.Group;
import io.space.concepts.membership.api.MembershipApi.MemberId;
import io.space.concepts.team.api.TeamApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.InvalidCursorException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListTeamsUseCase {
    private static final String TENANT_ADMIN = TeamDependencies.TENANT_ADMIN;
    private final TeamAccess access;
    private final TenantAccess tenants;
    private final TeamApi teams;
    private final MembershipApi memberships;

    ListTeamsUseCase(TeamDependencies dependencies) {
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.teams = dependencies.teams;
        this.memberships = dependencies.memberships;
    }

    @Transactional(readOnly = true)
    public TeamPage listTeams(String credential, UUID tenant, String cursor, int limit) {
        var resolution = tenants.admitUser(credential, tenant);
        var principal = new MemberId(resolution.principal().id());
        boolean tenantAdmin = access.isTenantAdmin(resolution, tenant);
        return tenants.inTenant(tenant, () -> {
            final TeamApi.Page page;
            try {
                page = teams.list(tenant, cursor, limit);
            } catch (IllegalArgumentException invalid) {
                throw new InvalidCursorException();
            }
            var visible = page.teams().stream()
                    .filter(team -> tenantAdmin
                            || memberships.isMember(Group.team(tenant, team.id().value()), principal))
                    .map(team -> TeamProjection.team(
                            team,
                            tenantAdmin
                                    ? TENANT_ADMIN
                                    : TeamProjection.roleOf(
                                            memberships,
                                            Group.team(tenant, team.id().value()),
                                            principal),
                            memberships))
                    .toList();
            return new TeamPage(visible, page.nextCursor());
        });
    }
}

package io.edition.control.compositions.iam.team;

import static io.edition.control.compositions.iam.team.TeamTypes.*;

import io.edition.concepts.membership.api.MembershipApi;
import io.edition.concepts.membership.api.MembershipApi.MemberId;
import io.edition.concepts.team.api.TeamApi;
import io.edition.control.compositions.access.TenantAccess;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class GetTeamUseCase {
    private static final String TENANT_ADMIN = TeamDependencies.TENANT_ADMIN;
    private final TeamAccess access;
    private final TenantAccess tenants;
    private final TeamApi teams;
    private final MembershipApi memberships;

    GetTeamUseCase(TeamDependencies dependencies) {
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.teams = dependencies.teams;
        this.memberships = dependencies.memberships;
    }

    @Transactional(readOnly = true)
    public TeamView getTeam(String credential, UUID tenant, UUID team) {
        var admitted = access.requireReadable(credential, tenant, team);
        var principal = new MemberId(admitted.resolution().principal().id());
        String callerRole = access.isTenantAdmin(admitted.resolution(), tenant)
                ? TENANT_ADMIN
                : tenants.inTenant(tenant, () -> TeamProjection.roleOf(memberships, admitted.group(), principal));
        return tenants.inTenant(
                tenant,
                () -> TeamProjection.team(
                        teams.view(new TeamApi.TeamId(team)).orElseThrow(TeamNotFoundException::new),
                        callerRole,
                        memberships));
    }
}

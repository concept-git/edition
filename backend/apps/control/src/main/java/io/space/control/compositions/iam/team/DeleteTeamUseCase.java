package io.space.control.compositions.iam.team;

import static io.space.control.compositions.iam.team.TeamTypes.*;

import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.permission.api.PermissionApi;
import io.space.concepts.team.api.TeamApi;
import io.space.control.compositions.access.TenantAccess;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class DeleteTeamUseCase {

    private final TeamAccess access;
    private final TenantAccess tenants;
    private final TeamApi teams;
    private final MembershipApi memberships;
    private final PermissionApi permissions;

    DeleteTeamUseCase(TeamDependencies dependencies) {
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.teams = dependencies.teams;
        this.memberships = dependencies.memberships;
        this.permissions = dependencies.permissions;
    }

    @Transactional
    public void deleteTeam(String credential, UUID tenant, UUID team) {
        var group = access.requireTeamAdmin(credential, tenant, team).group();
        tenants.inTenant(tenant, () -> {
            teams.lock(new TeamApi.TeamId(team)).orElseThrow(TeamNotFoundException::new);
            memberships.clearGroup(group);
            permissions.clearPrincipal(new PermissionApi.Principal(PermissionApi.PrincipalType.TEAM, team));
            permissions.clearResource(TenantAccess.team(team));
            if (teams.delete(new TeamApi.TeamId(team)) instanceof TeamApi.DeleteResult.NotFound) {
                throw new TeamNotFoundException();
            }
        });
    }
}

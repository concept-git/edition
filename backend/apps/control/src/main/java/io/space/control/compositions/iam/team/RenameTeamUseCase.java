package io.space.control.compositions.iam.team;

import static io.space.control.compositions.iam.team.TeamTypes.*;

import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.team.api.TeamApi;
import io.space.control.compositions.access.TenantAccess;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class RenameTeamUseCase {
    private static final String TENANT_ADMIN = TeamDependencies.TENANT_ADMIN;
    private final TeamAccess access;
    private final TenantAccess tenants;
    private final TeamApi teams;
    private final MembershipApi memberships;

    RenameTeamUseCase(TeamDependencies dependencies) {
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.teams = dependencies.teams;
        this.memberships = dependencies.memberships;
    }

    @Transactional
    public TeamView renameTeam(String credential, UUID tenant, UUID team, String name) {
        var admitted = access.requireTeamAdmin(credential, tenant, team);
        String callerRole = access.isTenantAdmin(admitted.resolution(), tenant) ? TENANT_ADMIN : "owner";
        return tenants.inTenant(tenant, () -> switch (teams.rename(new TeamApi.TeamId(team), name)) {
            case TeamApi.RenameResult.Renamed ok -> TeamProjection.team(ok.team(), callerRole, memberships);
            case TeamApi.RenameResult.NotFound ignored -> throw new TeamNotFoundException();
            case TeamApi.RenameResult.InvalidName ignored -> throw new TeamNameInvalidException();
            case TeamApi.RenameResult.NameTaken ignored -> throw new TeamNameTakenException();
        });
    }
}

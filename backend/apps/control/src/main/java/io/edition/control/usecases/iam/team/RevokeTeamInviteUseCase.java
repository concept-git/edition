package io.edition.control.usecases.iam.team;

import static io.edition.control.usecases.iam.team.TeamTypes.*;

import io.edition.control.modules.membership.api.MembershipApi;
import io.edition.control.modules.membership.api.MembershipApi.InviteId;
import io.edition.control.modules.team.api.TeamApi;
import io.edition.control.usecases.access.TenantAccess;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class RevokeTeamInviteUseCase {

    private final TeamAccess access;
    private final TenantAccess tenants;
    private final TeamApi teams;
    private final MembershipApi memberships;

    RevokeTeamInviteUseCase(TeamDependencies dependencies) {
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.teams = dependencies.teams;
        this.memberships = dependencies.memberships;
    }

    @Transactional
    public void revokeTeamInvite(String credential, UUID tenant, UUID team, UUID invite) {
        var group = access.requireTeamAdmin(credential, tenant, team).group();
        tenants.inTenant(tenant, () -> {
            teams.lock(new TeamApi.TeamId(team)).orElseThrow(TeamNotFoundException::new);
            memberships.revokeInvite(group, new InviteId(invite));
        });
    }
}

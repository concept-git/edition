package io.space.control.compositions.iam.team;

import static io.space.control.compositions.iam.team.TeamTypes.*;

import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.membership.api.MembershipApi.MemberId;
import io.space.concepts.membership.api.MembershipApi.RemoveResult;
import io.space.concepts.team.api.TeamApi;
import io.space.control.compositions.access.OwnerRootAccess;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.iam.membership.LastOwnerException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class RemoveTeamMemberUseCase {

    private final TeamAccess access;
    private final TenantAccess tenants;
    private final TeamApi teams;
    private final MembershipApi memberships;

    private final OwnerRootAccess ownerRootAccess;

    RemoveTeamMemberUseCase(TeamDependencies dependencies) {
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.teams = dependencies.teams;
        this.memberships = dependencies.memberships;
        this.ownerRootAccess = dependencies.ownerRootAccess;
    }

    @Transactional
    public void removeTeamMember(String credential, UUID tenant, UUID team, UUID member) {
        var group = access.requireTeamAdmin(credential, tenant, team).group();
        tenants.inTenant(tenant, () -> {
            teams.lock(new TeamApi.TeamId(team)).orElseThrow(TeamNotFoundException::new);
            var target = new MemberId(member);
            var result = memberships.remove(group, target);
            if (result instanceof RemoveResult.LastOwner) throw new LastOwnerException();
            ownerRootAccess.revoke(group, target);
        });
    }
}

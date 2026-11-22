package io.edition.control.usecases.iam.team;

import static io.edition.control.usecases.iam.team.TeamTypes.*;

import io.edition.control.modules.membership.api.MembershipApi;
import io.edition.control.modules.membership.api.MembershipApi.MemberId;
import io.edition.control.modules.membership.api.MembershipApi.Role;
import io.edition.control.modules.membership.api.MembershipApi.SetRoleResult;
import io.edition.control.modules.team.api.TeamApi;
import io.edition.control.usecases.access.OwnerRootAccess;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.iam.membership.LastOwnerException;
import io.edition.control.usecases.iam.membership.MemberNotFoundException;
import io.edition.control.usecases.iam.membership.MemberRoles;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class SetTeamMemberRoleUseCase {

    private final TeamAccess access;
    private final TenantAccess tenants;
    private final TeamApi teams;
    private final MembershipApi memberships;

    private final OwnerRootAccess ownerRootAccess;

    SetTeamMemberRoleUseCase(TeamDependencies dependencies) {
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.teams = dependencies.teams;
        this.memberships = dependencies.memberships;
        this.ownerRootAccess = dependencies.ownerRootAccess;
    }

    @Transactional
    public void setTeamMemberRole(String credential, UUID tenant, UUID team, UUID member, String role) {
        var group = access.requireTeamAdmin(credential, tenant, team).group();
        Role parsedRole = MemberRoles.parse(role);
        tenants.inTenant(tenant, () -> {
            teams.lock(new TeamApi.TeamId(team)).orElseThrow(TeamNotFoundException::new);
            var target = new MemberId(member);
            switch (memberships.setRole(group, target, parsedRole)) {
                case SetRoleResult.LastOwner ignored -> throw new LastOwnerException();
                case SetRoleResult.NotMember ignored -> throw new MemberNotFoundException();
                case SetRoleResult.RoleSet changed -> {
                    if (changed.role() == Role.OWNER) ownerRootAccess.grant(group, target, changed.role());
                    else ownerRootAccess.revoke(group, target);
                }
            }
        });
    }
}

package io.space.control.compositions.iam.team;

import static io.space.control.compositions.iam.team.TeamTypes.*;

import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.membership.api.MembershipApi.MemberId;
import io.space.concepts.membership.api.MembershipApi.Role;
import io.space.concepts.membership.api.MembershipApi.SetRoleResult;
import io.space.concepts.team.api.TeamApi;
import io.space.control.compositions.access.OwnerRootAccess;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.iam.membership.LastOwnerException;
import io.space.control.compositions.iam.membership.MemberNotFoundException;
import io.space.control.compositions.iam.membership.MemberRoles;
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

package io.space.control.compositions.iam.team;

import static io.space.control.compositions.iam.team.TeamTypes.*;

import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.membership.api.MembershipApi.Group;
import io.space.concepts.membership.api.MembershipApi.MemberId;
import io.space.concepts.membership.api.MembershipApi.Role;
import io.space.concepts.team.api.TeamApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.FlowResponse;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import io.space.control.compositions.iam.membership.AlreadyMemberException;
import io.space.control.compositions.iam.membership.MemberRoles;
import io.space.control.compositions.iam.membership.TenantMembershipRequiredException;
import java.util.Locale;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class InviteTeamMemberUseCase {

    private final TeamAccess access;
    private final TenantAccess tenants;
    private final TeamApi teams;
    private final MembershipApi memberships;

    private final UserApi users;

    private final IdempotentFlowExecutor idempotency;

    InviteTeamMemberUseCase(TeamDependencies dependencies) {
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.teams = dependencies.teams;
        this.memberships = dependencies.memberships;
        this.users = dependencies.users;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public FlowResponse<IssuedInvite> inviteTeamMember(
            String credential, UUID tenant, UUID team, String email, String role, String key) {
        var admitted = access.requireTeamAdmin(credential, tenant, team);
        String normalizedEmail = MemberRoles.normalizeEmail(email);
        Role parsedRole = MemberRoles.parse(role);
        return idempotency.execute(
                admitted.resolution().principal(),
                key,
                "team.invitation.issue",
                IdempotentFlowExecutor.canonical(
                        tenant, team, normalizedEmail, parsedRole.name().toLowerCase(Locale.ROOT)),
                201,
                IssuedInvite.class,
                () -> tenants.inTenant(tenant, () -> {
                    var member = users.byEmail(normalizedEmail)
                            .filter(user -> memberships
                                    .lockMembership(Group.tenant(tenant), new MemberId(user.value()))
                                    .isPresent())
                            .orElseThrow(TenantMembershipRequiredException::new);
                    if (memberships.isMember(admitted.group(), new MemberId(member.value()))) {
                        throw new AlreadyMemberException();
                    }
                    teams.lock(new TeamApi.TeamId(team)).orElseThrow(TeamNotFoundException::new);
                    var invited = memberships.invite(admitted.group(), normalizedEmail, parsedRole);
                    return new IssuedInvite(InviteView.from(invited.invite()), invited.token());
                }));
    }
}

package io.edition.control.compositions.iam.team;

import static io.edition.control.compositions.iam.team.TeamTypes.*;

import io.edition.concepts.membership.api.MembershipApi;
import io.edition.concepts.membership.api.MembershipApi.AddResult;
import io.edition.concepts.membership.api.MembershipApi.Group;
import io.edition.concepts.membership.api.MembershipApi.MemberId;
import io.edition.concepts.membership.api.MembershipApi.Role;
import io.edition.concepts.team.api.TeamApi;
import io.edition.control.compositions.access.OwnerRootAccess;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.FlowResponse;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import io.edition.control.compositions.iam.membership.TenantMembershipRequiredException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class CreateTeamUseCase {

    private final TeamAccess access;
    private final TenantAccess tenants;
    private final TeamApi teams;
    private final MembershipApi memberships;

    private final OwnerRootAccess ownerRootAccess;
    private final IdempotentFlowExecutor idempotency;

    CreateTeamUseCase(TeamDependencies dependencies) {
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.teams = dependencies.teams;
        this.memberships = dependencies.memberships;
        this.ownerRootAccess = dependencies.ownerRootAccess;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public FlowResponse<TeamView> createTeam(String credential, UUID tenant, String name, String key) {
        var creator = access.requireTenantAdmin(credential, tenant);
        var owner = new MemberId(creator.principal().id());
        return idempotency.execute(
                creator.principal(),
                key,
                "team.create",
                IdempotentFlowExecutor.canonical(tenant, TeamNames.canonical(name)),
                201,
                TeamView.class,
                () -> tenants.inTenant(tenant, () -> {
                    if (memberships.lockMembership(Group.tenant(tenant), owner).isEmpty()) {
                        throw new TenantMembershipRequiredException();
                    }
                    TeamApi.View created =
                            switch (teams.create(tenant, name)) {
                                case TeamApi.CreateResult.Created ok -> ok.team();
                                case TeamApi.CreateResult.InvalidName ignored -> throw new TeamNameInvalidException();
                                case TeamApi.CreateResult.NameTaken ignored -> throw new TeamNameTakenException();
                            };
                    var group = Group.team(tenant, created.id().value());
                    if (!(memberships.add(group, owner, Role.OWNER) instanceof AddResult.Added)) {
                        throw new IllegalStateException("new team already has a creator membership");
                    }
                    ownerRootAccess.grant(group, owner, Role.OWNER);
                    return TeamProjection.team(created, "owner", memberships);
                }));
    }
}

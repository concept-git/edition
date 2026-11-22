package io.edition.control.usecases.iam.team;

import static io.edition.control.usecases.iam.team.TeamTypes.*;

import io.edition.control.modules.membership.api.MembershipApi;
import io.edition.control.modules.user.api.UserApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.InvalidCursorException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListTeamMembersUseCase {

    private final TeamAccess access;
    private final TenantAccess tenants;

    private final MembershipApi memberships;

    private final UserApi users;

    ListTeamMembersUseCase(TeamDependencies dependencies) {
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.memberships = dependencies.memberships;
        this.users = dependencies.users;
    }

    @Transactional(readOnly = true)
    public Members listTeamMembers(String credential, UUID tenant, UUID team, String cursor, int limit) {
        var group = access.requireTeamAdmin(credential, tenant, team).group();
        final MembershipApi.MemberPage page;
        try {
            page = tenants.inTenant(tenant, () -> memberships.membersOf(group, cursor, limit));
        } catch (IllegalArgumentException invalid) {
            throw new InvalidCursorException();
        }
        return new Members(
                page.members().stream()
                        .map(member -> TeamProjection.member(
                                member,
                                users.accountProfile(
                                        new UserApi.UserId(member.member().value()))))
                        .toList(),
                page.nextCursor());
    }
}

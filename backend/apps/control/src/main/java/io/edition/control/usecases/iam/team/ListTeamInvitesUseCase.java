package io.edition.control.usecases.iam.team;

import static io.edition.control.usecases.iam.team.TeamTypes.*;

import io.edition.control.modules.membership.api.MembershipApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.InvalidCursorException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListTeamInvitesUseCase {

    private final TeamAccess access;
    private final TenantAccess tenants;

    private final MembershipApi memberships;

    ListTeamInvitesUseCase(TeamDependencies dependencies) {
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.memberships = dependencies.memberships;
    }

    @Transactional(readOnly = true)
    public Invites listTeamInvites(String credential, UUID tenant, UUID team, String cursor, int limit) {
        var group = access.requireTeamAdmin(credential, tenant, team).group();
        final MembershipApi.InvitePage page;
        try {
            page = tenants.inTenant(tenant, () -> memberships.invitesOf(group, cursor, limit));
        } catch (IllegalArgumentException invalid) {
            throw new InvalidCursorException();
        }
        return new Invites(page.invites().stream().map(InviteView::from).toList(), page.nextCursor());
    }
}

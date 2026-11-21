package io.edition.control.compositions.iam.membership;

import static io.edition.control.compositions.iam.membership.MembershipTypes.*;

import io.edition.concepts.membership.api.MembershipApi;
import io.edition.concepts.membership.api.MembershipApi.Group;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.InvalidCursorException;
import java.util.List;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListInvitesUseCase {

    private final TenantAccess access;

    private final MembershipApi memberships;

    ListInvitesUseCase(MembershipDependencies dependencies) {
        this.access = dependencies.access;
        this.memberships = dependencies.memberships;
    }

    @Transactional(readOnly = true)
    public Invites listInvites(String credential, UUID tenant, String cursor, int limit) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            access.requireUser(credential, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN);
            final MembershipApi.InvitePage page;
            try {
                page = access.inTenant(tenant, () -> memberships.invitesOf(Group.tenant(tenant), cursor, limit));
            } catch (IllegalArgumentException invalid) {
                throw new InvalidCursorException();
            }
            return new Invites(page.invites().stream().map(InviteSummary::of).toList(), page.nextCursor());
        }
    }
}

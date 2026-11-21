package io.edition.control.compositions.iam.membership;

import static io.edition.control.compositions.iam.membership.MembershipTypes.*;

import io.edition.concepts.membership.api.MembershipApi;
import io.edition.concepts.membership.api.MembershipApi.Group;
import io.edition.concepts.user.api.UserApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.InvalidCursorException;
import java.util.List;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListMembersUseCase {

    private final TenantAccess access;

    private final MembershipApi memberships;

    private final UserApi users;

    ListMembersUseCase(MembershipDependencies dependencies) {
        this.access = dependencies.access;
        this.memberships = dependencies.memberships;
        this.users = dependencies.users;
    }

    @Transactional(readOnly = true)
    public Members listMembers(String credential, UUID tenant, String cursor, int limit) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            access.requireUser(credential, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN);
            final MembershipApi.MemberPage page;
            try {
                page = access.inTenant(tenant, () -> memberships.membersOf(Group.tenant(tenant), cursor, limit));
            } catch (IllegalArgumentException invalid) {
                throw new InvalidCursorException();
            }
            return new Members(
                    page.members().stream()
                            .map(view -> MemberSummary.of(
                                    view,
                                    users.profile(
                                            new UserApi.UserId(view.member().value()))))
                            .toList(),
                    page.nextCursor());
        }
    }
}

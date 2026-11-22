package io.edition.control.usecases.iam.membership;

import static io.edition.control.usecases.iam.membership.MembershipTypes.*;

import io.edition.control.modules.membership.api.MembershipApi;
import io.edition.control.modules.membership.api.MembershipApi.Group;
import io.edition.control.modules.membership.api.MembershipApi.InviteId;
import io.edition.control.usecases.access.TenantAccess;
import java.util.List;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class RevokeInviteUseCase {

    private final TenantAccess access;

    private final MembershipApi memberships;

    RevokeInviteUseCase(MembershipDependencies dependencies) {
        this.access = dependencies.access;
        this.memberships = dependencies.memberships;
    }

    @Transactional
    public void revokeInvite(String credential, UUID tenant, UUID invite) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            access.requireUser(credential, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN);
            access.inTenant(tenant, () -> memberships.revokeInvite(Group.tenant(tenant), new InviteId(invite)));
        }
    }
}

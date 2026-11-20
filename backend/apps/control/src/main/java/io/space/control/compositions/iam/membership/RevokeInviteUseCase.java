package io.space.control.compositions.iam.membership;

import static io.space.control.compositions.iam.membership.MembershipTypes.*;

import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.membership.api.MembershipApi.Group;
import io.space.concepts.membership.api.MembershipApi.InviteId;
import io.space.control.compositions.access.TenantAccess;
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
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
            access.requireUser(credential, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN);
            access.inTenant(tenant, () -> memberships.revokeInvite(Group.tenant(tenant), new InviteId(invite)));
        }
    }
}

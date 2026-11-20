package io.space.control.compositions.iam.membership;

import static io.space.control.compositions.iam.membership.MembershipTypes.*;

import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.membership.api.MembershipApi.Group;
import io.space.concepts.membership.api.MembershipApi.MemberId;
import io.space.concepts.membership.api.MembershipApi.Role;
import io.space.concepts.membership.api.MembershipApi.SetRoleResult;
import io.space.control.compositions.access.TenantAccess;
import java.util.List;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class SetMemberRoleUseCase {
    private final MembershipRelay relay;

    private final TenantAccess access;

    private final MembershipApi memberships;

    SetMemberRoleUseCase(MembershipDependencies dependencies) {
        this.relay = dependencies.relay;
        this.access = dependencies.access;
        this.memberships = dependencies.memberships;
    }

    @Transactional
    public void setMemberRole(String credential, UUID tenant, UUID member, String role) {
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
            access.requireUser(credential, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN);
            Group group = Group.tenant(tenant);
            var target = new MemberId(member);
            Role parsedRole = MemberRoles.parse(role);
            var result = access.inTenant(tenant, () -> {
                var outcome = memberships.setRole(group, target, parsedRole);
                if (outcome instanceof SetRoleResult.RoleSet ok) {
                    if (ok.role() == Role.OWNER) {
                        relay.grantOwnerRootAccess(group, target, Role.OWNER);
                    } else {
                        relay.revokeOwnerRootAccess(group, target);
                    }
                }
                return outcome;
            });
            switch (result) {
                case SetRoleResult.LastOwner ignored -> throw new LastOwnerException();
                case SetRoleResult.NotMember ignored -> throw new MemberNotFoundException();
                case SetRoleResult.RoleSet ignored -> {}
            }
        }
    }
}

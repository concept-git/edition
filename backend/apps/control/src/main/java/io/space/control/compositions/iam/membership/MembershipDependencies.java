package io.space.control.compositions.iam.membership;

import static io.space.control.compositions.iam.membership.MembershipTypes.*;

import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.permission.api.PermissionApi;
import io.space.concepts.team.api.TeamApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.access.OwnerRootAccess;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.IdempotentFlowExecutor;

@org.springframework.stereotype.Component
final class MembershipDependencies {
    final MembershipRelay relay;
    final MembershipChecks membershipChecks;
    static final String INVITE_OPERATION = "tenant.invitation.issue";
    final TenantAccess access;
    final IdempotentFlowExecutor idempotency;
    final MembershipApi memberships;
    final PermissionApi permissions;
    final OwnerRootAccess ownerRootAccess;
    final UserApi users;
    final TeamApi teams;
    final TenantRegistryApi tenants;
    final TenantScopeApi tenantScope;

    MembershipDependencies(
            TenantAccess access,
            IdempotentFlowExecutor idempotency,
            MembershipApi memberships,
            PermissionApi permissions,
            OwnerRootAccess ownerRootAccess,
            UserApi users,
            TeamApi teams,
            TenantRegistryApi tenants,
            TenantScopeApi tenantScope,
            MembershipChecks membershipChecks,
            MembershipRelay relay) {
        this.relay = relay;
        this.membershipChecks = membershipChecks;
        this.access = access;
        this.idempotency = idempotency;
        this.memberships = memberships;
        this.permissions = permissions;
        this.ownerRootAccess = ownerRootAccess;
        this.users = users;
        this.teams = teams;
        this.tenants = tenants;
        this.tenantScope = tenantScope;
    }
}

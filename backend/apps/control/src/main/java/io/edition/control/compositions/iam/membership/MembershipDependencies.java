package io.edition.control.compositions.iam.membership;

import static io.edition.control.compositions.iam.membership.MembershipTypes.*;

import io.edition.concepts.membership.api.MembershipApi;
import io.edition.concepts.permission.api.PermissionApi;
import io.edition.concepts.team.api.TeamApi;
import io.edition.concepts.tenantregistry.api.TenantRegistryApi;
import io.edition.concepts.tenantregistry.api.TenantScopeApi;
import io.edition.concepts.user.api.UserApi;
import io.edition.control.compositions.access.OwnerRootAccess;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;

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

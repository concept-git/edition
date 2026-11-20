package io.space.control.compositions.platform.tenant;

import static io.space.control.compositions.platform.tenant.TenantTypes.*;

import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.user.api.UserApi;
import io.space.control.compositions.access.OwnerRootAccess;
import io.space.control.compositions.access.PlatformOperatorGuard;

@org.springframework.stereotype.Component
final class TenantDependencies {
    final TenantRelay relay;
    final TenantLookup tenantLookup;
    final PlatformOperatorGuard platformOperator;
    final TenantRegistryApi tenants;
    final TenantScopeApi tenantScope;
    final MembershipApi memberships;
    final UserApi users;
    final OwnerRootAccess ownerRootAccess;

    TenantDependencies(
            PlatformOperatorGuard platformOperator,
            TenantRegistryApi tenants,
            TenantScopeApi tenantScope,
            MembershipApi memberships,
            UserApi users,
            OwnerRootAccess ownerRootAccess,
            TenantLookup tenantLookup,
            TenantRelay relay) {
        this.relay = relay;
        this.tenantLookup = tenantLookup;
        this.platformOperator = platformOperator;
        this.tenants = tenants;
        this.tenantScope = tenantScope;
        this.memberships = memberships;
        this.users = users;
        this.ownerRootAccess = ownerRootAccess;
    }
}

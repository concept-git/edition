package io.edition.control.compositions.platform.tenant;

import static io.edition.control.compositions.platform.tenant.TenantTypes.*;

import io.edition.concepts.membership.api.MembershipApi;
import io.edition.concepts.tenantregistry.api.TenantRegistryApi;
import io.edition.concepts.tenantregistry.api.TenantScopeApi;
import io.edition.concepts.user.api.UserApi;
import io.edition.control.compositions.access.OwnerRootAccess;
import io.edition.control.compositions.access.PlatformOperatorGuard;

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

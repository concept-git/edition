package io.edition.control.usecases.platform.tenant;

import static io.edition.control.usecases.platform.tenant.TenantTypes.*;

import io.edition.control.modules.membership.api.MembershipApi;
import io.edition.control.modules.tenantregistry.api.TenantRegistryApi;
import io.edition.control.modules.tenantregistry.api.TenantScopeApi;
import io.edition.control.modules.user.api.UserApi;
import io.edition.control.usecases.access.OwnerRootAccess;
import io.edition.control.usecases.access.PlatformOperatorGuard;

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

package io.space.control.compositions.authoring.permission;

import static io.space.control.compositions.authoring.permission.PermissionTypes.*;

import io.space.concepts.permission.api.PermissionApi;
import io.space.control.compositions.access.TenantAccess;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class PutSiteGrantUseCase {
    private final PermissionAccess access;
    private final PermissionProjection projection;

    private final PermissionMutationPublisher mutationEvents;
    private final PermissionApi permissions;
    private final TenantAccess tenants;

    private final io.space.control.compositions.resource.ResourceWriteLocks locks;

    PutSiteGrantUseCase(PermissionDependencies dependencies) {
        this.access = dependencies.access;
        this.projection = dependencies.projection;
        this.mutationEvents = dependencies.mutationEvents;
        this.permissions = dependencies.permissions;
        this.tenants = dependencies.tenants;
        this.locks = dependencies.locks;
    }

    @Transactional
    public GrantView putSiteGrant(String credential, UUID tenant, UUID site, String principalKey, String role) {
        var authorized = access.requireSite(credential, tenant, locks.site(tenant, site));
        PermissionApi.Principal principal = access.siteMutablePrincipal(tenant, principalKey, true);
        PermissionApi.Role parsedRole = access.siteRole(principal, role);
        var grant = new PermissionApi.Grant(TenantAccess.site(site), principal, parsedRole);
        tenants.inTenant(tenant, () -> permissions.grant(grant.resource(), grant.principal(), grant.role()));
        mutationEvents.grantSite(authorized, tenant, site, principal);
        return projection.siteGrant(tenant, site, grant, authorized.actor());
    }
}

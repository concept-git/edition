package io.edition.control.usecases.authoring.permission;

import static io.edition.control.usecases.authoring.permission.PermissionTypes.*;

import io.edition.control.modules.permission.api.PermissionApi;
import io.edition.control.usecases.access.TenantAccess;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class DeleteSiteGrantUseCase {
    private final PermissionAccess access;

    private final PermissionMutationPublisher mutationEvents;
    private final PermissionApi permissions;
    private final TenantAccess tenants;

    private final io.edition.control.usecases.resource.ResourceWriteLocks locks;

    DeleteSiteGrantUseCase(PermissionDependencies dependencies) {
        this.access = dependencies.access;
        this.mutationEvents = dependencies.mutationEvents;
        this.permissions = dependencies.permissions;
        this.tenants = dependencies.tenants;
        this.locks = dependencies.locks;
    }

    @Transactional
    public void deleteSiteGrant(String credential, UUID tenant, UUID site, String principalKey) {
        var authorized = access.requireSite(credential, tenant, locks.site(tenant, site));
        PermissionApi.Principal principal = access.siteRevocablePrincipal(principalKey);
        tenants.inTenant(tenant, () -> permissions.revoke(TenantAccess.site(site), principal));
        mutationEvents.revokeSite(authorized, tenant, site, principal);
    }
}

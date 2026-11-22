package io.edition.control.usecases.authoring.permission;

import static io.edition.control.usecases.authoring.permission.PermissionTypes.*;

import io.edition.control.modules.permission.api.PermissionApi;
import io.edition.control.modules.space.api.SpaceApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.resource.SpaceArchivedException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class DeleteSpaceGrantUseCase {
    private final PermissionAccess access;

    private final PermissionMutationPublisher mutationEvents;
    private final PermissionApi permissions;
    private final TenantAccess tenants;

    private final io.edition.control.usecases.resource.ResourceWriteLocks locks;

    DeleteSpaceGrantUseCase(PermissionDependencies dependencies) {
        this.access = dependencies.access;
        this.mutationEvents = dependencies.mutationEvents;
        this.permissions = dependencies.permissions;
        this.tenants = dependencies.tenants;
        this.locks = dependencies.locks;
    }

    @Transactional
    public void deleteSpaceGrant(String credential, UUID tenant, UUID space, String principalKey) {
        var authorized = access.require(credential, tenant, locks.space(tenant, space));
        if (authorized.space().status() == SpaceApi.Status.ARCHIVED) {
            throw new SpaceArchivedException();
        }
        PermissionApi.Principal principal = access.revocablePrincipal(principalKey);
        tenants.inTenant(tenant, () -> permissions.revoke(TenantAccess.space(space), principal));
        mutationEvents.revoke(authorized, tenant, space, principal);
    }
}

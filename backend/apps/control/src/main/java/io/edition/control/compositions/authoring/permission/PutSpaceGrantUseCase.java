package io.edition.control.compositions.authoring.permission;

import static io.edition.control.compositions.authoring.permission.PermissionTypes.*;

import io.edition.concepts.permission.api.PermissionApi;
import io.edition.concepts.space.api.SpaceApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.resource.SpaceArchivedException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class PutSpaceGrantUseCase {
    private final PermissionAccess access;
    private final PermissionProjection projection;

    private final PermissionMutationPublisher mutationEvents;
    private final PermissionApi permissions;
    private final TenantAccess tenants;

    private final io.edition.control.compositions.resource.ResourceWriteLocks locks;

    PutSpaceGrantUseCase(PermissionDependencies dependencies) {
        this.access = dependencies.access;
        this.projection = dependencies.projection;
        this.mutationEvents = dependencies.mutationEvents;
        this.permissions = dependencies.permissions;
        this.tenants = dependencies.tenants;
        this.locks = dependencies.locks;
    }

    @Transactional
    public GrantView putSpaceGrant(String credential, UUID tenant, UUID space, String principalKey, String role) {
        var authorized = access.require(credential, tenant, locks.space(tenant, space));
        PermissionApi.Role parsedRole = access.role(role);
        if (authorized.space().status() == SpaceApi.Status.ARCHIVED
                && !parsedRole.value().equals("none")) {
            throw new SpaceArchivedException();
        }
        PermissionApi.Principal principal = access.mutablePrincipal(tenant, principalKey, true);
        var grant = new PermissionApi.Grant(TenantAccess.space(space), principal, parsedRole);
        tenants.inTenant(tenant, () -> permissions.grant(grant.resource(), grant.principal(), grant.role()));
        mutationEvents.grant(authorized, tenant, space, principal);
        return projection.grant(
                tenant, space, grant, authorized.space().status() == SpaceApi.Status.ARCHIVED, authorized.actor());
    }
}

package io.edition.control.compositions.authoring.permission;

import static io.edition.control.compositions.authoring.permission.PermissionTypes.*;

import io.edition.concepts.permission.api.PermissionApi;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class DeletePageRestrictionUseCase {
    private final PermissionAccess access;
    private final PermissionProjection projection;

    private final PermissionRestrictionRules restrictions;
    private final PermissionMutationPublisher mutationEvents;

    private final io.edition.control.compositions.resource.ResourceWriteLocks locks;

    DeletePageRestrictionUseCase(PermissionDependencies dependencies) {
        this.access = dependencies.access;
        this.projection = dependencies.projection;
        this.restrictions = dependencies.restrictions;
        this.mutationEvents = dependencies.mutationEvents;
        this.locks = dependencies.locks;
    }

    @Transactional
    public PagePermissionView deletePageRestriction(
            String credential, UUID tenant, UUID space, UUID page, long expectedRevision) {
        var authorized = access.require(credential, tenant, locks.space(tenant, space));
        locks.page(tenant, space, page);
        PermissionApi.RestrictionView changed = restrictions.remove(tenant, authorized.space(), page, expectedRevision);
        mutationEvents.unrestrict(authorized, tenant, page);
        return projection.pagePermission(tenant, page, authorized.space(), changed, authorized.actor());
    }
}

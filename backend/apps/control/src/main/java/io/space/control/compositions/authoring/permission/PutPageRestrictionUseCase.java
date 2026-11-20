package io.space.control.compositions.authoring.permission;

import static io.space.control.compositions.authoring.permission.PermissionTypes.*;

import io.space.concepts.permission.api.PermissionApi;
import java.util.List;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class PutPageRestrictionUseCase {
    private final PermissionAccess access;
    private final PermissionProjection projection;

    private final PermissionRestrictionRules restrictions;
    private final PermissionMutationPublisher mutationEvents;

    private final io.space.control.compositions.resource.ResourceWriteLocks locks;

    PutPageRestrictionUseCase(PermissionDependencies dependencies) {
        this.access = dependencies.access;
        this.projection = dependencies.projection;
        this.restrictions = dependencies.restrictions;
        this.mutationEvents = dependencies.mutationEvents;
        this.locks = dependencies.locks;
    }

    @Transactional
    public PagePermissionView putPageRestriction(
            String credential, UUID tenant, UUID space, UUID page, List<String> principalKeys, long expectedRevision) {
        var authorized = access.require(credential, tenant, locks.space(tenant, space));
        locks.page(tenant, space, page);
        PermissionApi.RestrictionView changed =
                restrictions.replace(tenant, authorized.space(), page, principalKeys, expectedRevision);
        mutationEvents.restrict(authorized, tenant, page, changed);
        return projection.pagePermission(tenant, page, authorized.space(), changed, authorized.actor());
    }
}

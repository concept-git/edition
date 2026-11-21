package io.edition.control.compositions.authoring.permission;

import static io.edition.control.compositions.authoring.permission.PermissionTypes.*;

import io.edition.concepts.permission.api.PermissionApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.resource.ResourceChain;

@org.springframework.stereotype.Component
final class PermissionDependencies {
    final PermissionAccess access;
    final PermissionProjection projection;
    final PermissionQueries queries;
    final PermissionRestrictionRules restrictions;
    final PermissionMutationPublisher mutationEvents;
    final PermissionApi permissions;
    final TenantAccess tenants;
    final ResourceChain resources;
    final io.edition.control.compositions.resource.ResourceWriteLocks locks;

    PermissionDependencies(
            PermissionAccess access,
            PermissionProjection projection,
            PermissionQueries queries,
            PermissionRestrictionRules restrictions,
            PermissionMutationPublisher mutationEvents,
            PermissionApi permissions,
            TenantAccess tenants,
            ResourceChain resources,
            io.edition.control.compositions.resource.ResourceWriteLocks locks) {
        this.locks = locks;
        this.access = access;
        this.projection = projection;
        this.queries = queries;
        this.restrictions = restrictions;
        this.mutationEvents = mutationEvents;
        this.permissions = permissions;
        this.tenants = tenants;
        this.resources = resources;
    }
}

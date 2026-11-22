package io.edition.control.usecases.authoring.space;

import static io.edition.control.usecases.authoring.space.SpaceTypes.*;

import io.edition.control.modules.release.api.ReleaseApi;
import io.edition.control.modules.space.api.SpaceApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.resource.ResourceChain;

@org.springframework.stereotype.Component
final class SpaceDependencies {
    final SpaceAccess access;
    final TenantAccess tenants;
    final ResourceChain resources;
    final SpaceApi spaces;
    final ReleaseApi releases;
    final IdempotentFlowExecutor idempotency;
    final SpaceProjection projection;
    final SpaceCollectionListing listing;

    SpaceDependencies(
            SpaceAccess access,
            TenantAccess tenants,
            ResourceChain resources,
            SpaceApi spaces,
            ReleaseApi releases,
            IdempotentFlowExecutor idempotency,
            SpaceProjection projection,
            SpaceCollectionListing listing) {
        this.access = access;
        this.tenants = tenants;
        this.resources = resources;
        this.spaces = spaces;
        this.releases = releases;
        this.idempotency = idempotency;
        this.projection = projection;
        this.listing = listing;
    }
}

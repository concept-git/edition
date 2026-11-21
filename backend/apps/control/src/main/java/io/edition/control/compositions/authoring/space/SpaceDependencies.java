package io.edition.control.compositions.authoring.space;

import static io.edition.control.compositions.authoring.space.SpaceTypes.*;

import io.edition.concepts.release.api.ReleaseApi;
import io.edition.concepts.space.api.SpaceApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import io.edition.control.compositions.resource.ResourceChain;

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

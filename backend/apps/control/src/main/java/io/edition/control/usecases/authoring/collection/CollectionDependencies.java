package io.edition.control.usecases.authoring.collection;

import static io.edition.control.usecases.authoring.collection.CollectionTypes.*;

import io.edition.control.modules.collection.api.CollectionApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.authoring.space.SpaceProjection;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.resource.ResourceChain;

@org.springframework.stereotype.Component
final class CollectionDependencies {
    final CollectionApi collections;
    final TenantAccess tenants;
    final ResourceChain resources;
    final CollectionAccess access;
    final IdempotentFlowExecutor idempotency;
    final SpaceProjection spaceProjection;

    CollectionDependencies(
            CollectionApi collections,
            TenantAccess tenants,
            ResourceChain resources,
            CollectionAccess access,
            IdempotentFlowExecutor idempotency,
            SpaceProjection spaceProjection) {
        this.collections = collections;
        this.tenants = tenants;
        this.resources = resources;
        this.access = access;
        this.idempotency = idempotency;
        this.spaceProjection = spaceProjection;
    }
}

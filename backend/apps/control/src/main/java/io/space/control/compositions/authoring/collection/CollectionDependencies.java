package io.space.control.compositions.authoring.collection;

import static io.space.control.compositions.authoring.collection.CollectionTypes.*;

import io.space.concepts.collection.api.CollectionApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.authoring.space.SpaceProjection;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import io.space.control.compositions.resource.ResourceChain;

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

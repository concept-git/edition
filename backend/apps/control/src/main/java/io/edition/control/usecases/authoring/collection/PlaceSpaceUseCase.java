package io.edition.control.usecases.authoring.collection;

import static io.edition.control.usecases.authoring.collection.CollectionTypes.*;

import io.edition.control.modules.collection.api.CollectionApi;
import io.edition.control.modules.space.api.SpaceApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.authoring.space.SpaceProjection;
import io.edition.control.usecases.authoring.space.SpaceTypes;
import io.edition.control.usecases.flow.FlowResponse;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.principal.PrincipalResolver.Resolution;
import io.edition.control.usecases.resource.CollectionNotFoundException;
import io.edition.control.usecases.resource.ResourceChain;
import io.edition.control.usecases.resource.SpaceNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class PlaceSpaceUseCase {
    private final CollectionApi collections;
    private final TenantAccess tenants;
    private final ResourceChain resources;
    private final CollectionAccess access;
    private final IdempotentFlowExecutor idempotency;
    private final SpaceProjection spaceProjection;

    PlaceSpaceUseCase(CollectionDependencies dependencies) {
        this.collections = dependencies.collections;
        this.tenants = dependencies.tenants;
        this.resources = dependencies.resources;
        this.access = dependencies.access;
        this.idempotency = dependencies.idempotency;
        this.spaceProjection = dependencies.spaceProjection;
    }

    @Transactional
    public FlowResponse<SpaceTypes.SpaceDetail> placeSpace(
            String credential, UUID tenant, UUID collectionId, UUID spaceId, Integer position, String key) {
        Resolution resolution = access.requireAdmin(credential, tenant);
        if (!access.belongs(tenant, collectionId)) throw new CollectionNotFoundException();
        SpaceApi.View space = resources.space(tenant, spaceId).orElseThrow(SpaceNotFoundException::new);
        return idempotency.execute(
                resolution.principal(),
                key,
                "collection.place",
                IdempotentFlowExecutor.canonical(tenant, collectionId, space.id(), position),
                200,
                SpaceTypes.SpaceDetail.class,
                () -> tenants.inTenant(tenant, () -> {
                    CollectionApi.PlaceResult result =
                            collections.place(space.id(), new CollectionApi.CollectionId(collectionId), position);
                    return switch (result) {
                        case CollectionApi.PlaceResult.Placed ignored ->
                            spaceProjection.view(credential, tenant, space.id());
                        case CollectionApi.PlaceResult.PositionInvalid ignored -> throw new PositionInvalidException();
                        case CollectionApi.PlaceResult.NotFound ignored -> throw new CollectionNotFoundException();
                    };
                }));
    }
}

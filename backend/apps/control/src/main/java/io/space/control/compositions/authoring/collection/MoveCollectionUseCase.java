package io.space.control.compositions.authoring.collection;

import static io.space.control.compositions.authoring.collection.CollectionTypes.*;

import io.space.concepts.collection.api.CollectionApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.FlowResponse;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import io.space.control.compositions.principal.PrincipalResolver.Resolution;
import io.space.control.compositions.resource.CollectionNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class MoveCollectionUseCase {
    private final CollectionApi collections;
    private final TenantAccess tenants;

    private final CollectionAccess access;
    private final IdempotentFlowExecutor idempotency;

    MoveCollectionUseCase(CollectionDependencies dependencies) {
        this.collections = dependencies.collections;
        this.tenants = dependencies.tenants;
        this.access = dependencies.access;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public FlowResponse<CollectionView> moveCollection(
            String credential, UUID tenant, UUID collectionId, UUID parentId, int position, String key) {
        Resolution resolution = access.requireAdmin(credential, tenant);
        if (!access.belongs(tenant, collectionId)) throw new CollectionNotFoundException();
        if (parentId != null && !access.belongs(tenant, parentId)) throw new CollectionNotFoundException();
        return idempotency.execute(
                resolution.principal(),
                key,
                "collection.move",
                IdempotentFlowExecutor.canonical(tenant, collectionId, parentId, position),
                200,
                CollectionView.class,
                () -> tenants.inTenant(tenant, () -> {
                    CollectionApi.MoveResult result = collections.move(
                            new CollectionApi.CollectionId(collectionId),
                            parentId == null ? null : new CollectionApi.CollectionId(parentId),
                            position);
                    return switch (result) {
                        case CollectionApi.MoveResult.Moved ignored ->
                            CollectionProjection.of(collections, resolution, tenant, access);
                        case CollectionApi.MoveResult.DepthExceeded ignored -> throw new DepthExceededException();
                        case CollectionApi.MoveResult.CycleDetected ignored -> throw new CycleDetectedException();
                        case CollectionApi.MoveResult.PositionInvalid ignored -> throw new PositionInvalidException();
                        case CollectionApi.MoveResult.NameTaken ignored -> throw new CollectionNameTakenException();
                        case CollectionApi.MoveResult.NotFound ignored -> throw new CollectionNotFoundException();
                    };
                }));
    }
}

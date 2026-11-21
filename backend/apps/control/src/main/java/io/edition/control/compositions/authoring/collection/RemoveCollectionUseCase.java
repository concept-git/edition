package io.edition.control.compositions.authoring.collection;

import static io.edition.control.compositions.authoring.collection.CollectionTypes.*;

import io.edition.concepts.collection.api.CollectionApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.FlowResponse;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import io.edition.control.compositions.principal.PrincipalResolver.Resolution;
import io.edition.control.compositions.resource.CollectionNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class RemoveCollectionUseCase {
    private final CollectionApi collections;
    private final TenantAccess tenants;

    private final CollectionAccess access;
    private final IdempotentFlowExecutor idempotency;

    RemoveCollectionUseCase(CollectionDependencies dependencies) {
        this.collections = dependencies.collections;
        this.tenants = dependencies.tenants;
        this.access = dependencies.access;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public FlowResponse<CollectionView> removeCollection(
            String credential, UUID tenant, UUID collectionId, String key) {
        Resolution resolution = access.requireAdmin(credential, tenant);
        return idempotency.execute(
                resolution.principal(),
                key,
                "collection.remove",
                IdempotentFlowExecutor.canonical(tenant, collectionId),
                200,
                CollectionView.class,
                () -> tenants.inTenant(tenant, () -> {
                    if (!access.belongs(tenant, collectionId)) throw new CollectionNotFoundException();
                    CollectionApi.RemoveResult result =
                            collections.remove(new CollectionApi.CollectionId(collectionId));
                    return switch (result) {
                        case CollectionApi.RemoveResult.Removed ignored ->
                            CollectionProjection.of(collections, resolution, tenant, access);
                        case CollectionApi.RemoveResult.NotEmpty ignored -> throw new CollectionNotEmptyException();
                        case CollectionApi.RemoveResult.NotFound ignored -> throw new CollectionNotFoundException();
                    };
                }));
    }
}

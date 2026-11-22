package io.edition.control.usecases.authoring.collection;

import static io.edition.control.usecases.authoring.collection.CollectionTypes.*;

import io.edition.control.modules.collection.api.CollectionApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.FlowResponse;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.principal.PrincipalResolver.Resolution;
import io.edition.control.usecases.resource.CollectionNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class CreateCollectionUseCase {
    private final CollectionApi collections;
    private final TenantAccess tenants;

    private final CollectionAccess access;
    private final IdempotentFlowExecutor idempotency;

    CreateCollectionUseCase(CollectionDependencies dependencies) {
        this.collections = dependencies.collections;
        this.tenants = dependencies.tenants;
        this.access = dependencies.access;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public FlowResponse<CollectionView> createCollection(
            String credential, UUID tenant, UUID parentId, String name, String icon, Integer position, String key) {
        Resolution resolution = access.requireAdmin(credential, tenant);
        CollectionApi.IconKey parsedIcon = icon == null ? null : CollectionPatch.icon(icon);
        return idempotency.execute(
                resolution.principal(),
                key,
                "collection.create",
                IdempotentFlowExecutor.canonical(tenant, parentId, name, icon, position),
                201,
                CollectionView.class,
                () -> tenants.inTenant(tenant, () -> {
                    CollectionApi.CreateResult result = collections.create(
                            tenant,
                            parentId == null ? null : new CollectionApi.CollectionId(parentId),
                            name,
                            parsedIcon,
                            position);
                    return switch (result) {
                        case CollectionApi.CreateResult.Created ignored ->
                            CollectionProjection.of(collections, resolution, tenant, access);
                        case CollectionApi.CreateResult.DepthExceeded ignored -> throw new DepthExceededException();
                        case CollectionApi.CreateResult.PositionInvalid ignored -> throw new PositionInvalidException();
                        case CollectionApi.CreateResult.NameTaken ignored -> throw new CollectionNameTakenException();
                        case CollectionApi.CreateResult.ParentNotFound ignored ->
                            throw new CollectionNotFoundException();
                        case CollectionApi.CreateResult.Invalid invalid ->
                            throw new CollectionPatch.CollectionInvalidException(invalid.field(), invalid.code());
                    };
                }));
    }
}

package io.edition.control.compositions.authoring.collection;

import static io.edition.control.compositions.authoring.collection.CollectionTypes.*;

import io.edition.concepts.collection.api.CollectionApi;
import io.edition.concepts.space.api.SpaceApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.authoring.space.SpaceProjection;
import io.edition.control.compositions.authoring.space.SpaceTypes;
import io.edition.control.compositions.flow.FlowResponse;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import io.edition.control.compositions.principal.PrincipalResolver.Resolution;
import io.edition.control.compositions.resource.ResourceChain;
import io.edition.control.compositions.resource.SpaceNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class UnplaceSpaceUseCase {
    private final CollectionApi collections;
    private final TenantAccess tenants;
    private final ResourceChain resources;
    private final CollectionAccess access;
    private final IdempotentFlowExecutor idempotency;
    private final SpaceProjection spaceProjection;

    UnplaceSpaceUseCase(CollectionDependencies dependencies) {
        this.collections = dependencies.collections;
        this.tenants = dependencies.tenants;
        this.resources = dependencies.resources;
        this.access = dependencies.access;
        this.idempotency = dependencies.idempotency;
        this.spaceProjection = dependencies.spaceProjection;
    }

    @Transactional
    public FlowResponse<SpaceTypes.SpaceDetail> unplaceSpace(
            String credential, UUID tenant, UUID collectionId, UUID spaceId, String key) {
        Resolution resolution = access.requireAdmin(credential, tenant);
        SpaceApi.View space = resources.space(tenant, spaceId).orElseThrow(SpaceNotFoundException::new);
        return idempotency.execute(
                resolution.principal(),
                key,
                "collection.unplace",
                IdempotentFlowExecutor.canonical(tenant, collectionId, space.id()),
                200,
                SpaceTypes.SpaceDetail.class,
                () -> tenants.inTenant(tenant, () -> {
                    collections
                            .collectionOf(space.id())
                            .filter(collectionId::equals)
                            .ifPresent(ignored -> collections.unplace(space.id()));
                    return spaceProjection.view(credential, tenant, space.id());
                }));
    }
}

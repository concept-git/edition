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
public class PatchCollectionUseCase {
    private final CollectionApi collections;
    private final TenantAccess tenants;

    private final CollectionAccess access;
    private final IdempotentFlowExecutor idempotency;

    PatchCollectionUseCase(CollectionDependencies dependencies) {
        this.collections = dependencies.collections;
        this.tenants = dependencies.tenants;
        this.access = dependencies.access;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public FlowResponse<CollectionView> patchCollection(
            String credential,
            UUID tenant,
            UUID collectionId,
            boolean namePresent,
            String name,
            boolean iconPresent,
            String icon,
            String key) {
        Resolution resolution = access.requireAdmin(credential, tenant);
        if (!access.belongs(tenant, collectionId)) throw new CollectionNotFoundException();
        if (!namePresent && !iconPresent) {
            throw new CollectionPatch.CollectionInvalidException("patch", "empty");
        }
        if (namePresent && name == null) {
            throw new CollectionPatch.CollectionInvalidException("name", "required");
        }
        CollectionApi.IconKey parsedIcon = iconPresent ? CollectionPatch.icon(icon) : null;
        return idempotency.execute(
                resolution.principal(),
                key,
                "collection.patch",
                IdempotentFlowExecutor.canonical(tenant, collectionId, namePresent, name, iconPresent, icon),
                200,
                CollectionView.class,
                () -> tenants.inTenant(tenant, () -> {
                    CollectionApi.CollectionId id = new CollectionApi.CollectionId(collectionId);
                    if (namePresent) {
                        CollectionApi.RenameResult renamed = collections.rename(id, name);
                        switch (renamed) {
                            case CollectionApi.RenameResult.Renamed ignored -> {}
                            case CollectionApi.RenameResult.NameTaken ignored ->
                                throw new CollectionNameTakenException();
                            case CollectionApi.RenameResult.NotFound ignored -> throw new CollectionNotFoundException();
                            case CollectionApi.RenameResult.Invalid invalid ->
                                throw new CollectionPatch.CollectionInvalidException(invalid.field(), invalid.code());
                        }
                    }
                    if (iconPresent) {
                        CollectionApi.SetIconResult changed = collections.setIcon(id, parsedIcon);
                        switch (changed) {
                            case CollectionApi.SetIconResult.Changed ignored -> {}
                            case CollectionApi.SetIconResult.NotFound ignored ->
                                throw new CollectionNotFoundException();
                            case CollectionApi.SetIconResult.Invalid invalid ->
                                throw new CollectionPatch.CollectionInvalidException(invalid.field(), invalid.code());
                        }
                    }
                    return CollectionProjection.of(collections, resolution, tenant, access);
                }));
    }
}

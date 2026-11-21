package io.edition.control.compositions.authoring.collection;

import static io.edition.control.compositions.authoring.collection.CollectionTypes.*;

import io.edition.concepts.collection.api.CollectionApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.principal.PrincipalResolver.Resolution;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ViewCollectionsUseCase {
    private final CollectionApi collections;
    private final TenantAccess tenants;

    private final CollectionAccess access;

    ViewCollectionsUseCase(CollectionDependencies dependencies) {
        this.collections = dependencies.collections;
        this.tenants = dependencies.tenants;
        this.access = dependencies.access;
    }

    @Transactional(readOnly = true)
    public CollectionView viewCollections(String credential, UUID tenant) {
        Resolution resolution = access.admit(credential, tenant);
        return tenants.inTenant(
                tenant,
                () -> CollectionProjection.view(collections.tree(tenant), resolution, tenant, collections, access));
    }
}

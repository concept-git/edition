package io.space.control.compositions.authoring.tocediting;

import static io.space.control.compositions.authoring.tocediting.TocEditingTypes.*;

import io.space.concepts.space.api.SpaceApi;
import io.space.concepts.toc.api.TocApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.principal.PrincipalResolver.Resolution;
import io.space.control.compositions.resource.ResourceChain;
import io.space.control.compositions.resource.SpaceNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ViewTocUseCase {
    private final TocApi toc;
    private final TenantAccess tenants;
    private final ResourceChain resources;

    private final TocAccess access;

    ViewTocUseCase(TocEditingDependencies dependencies) {
        this.toc = dependencies.toc;
        this.tenants = dependencies.tenants;
        this.resources = dependencies.resources;
        this.access = dependencies.access;
    }

    @Transactional(readOnly = true)
    public TocView viewToc(String credential, UUID tenant, UUID space) {
        SpaceApi.View owner = resources.space(tenant, space).orElseThrow(SpaceNotFoundException::new);
        Resolution resolution = access.require(credential, tenant, space, TenantAccess.READ);
        return tenants.inTenant(
                tenant, () -> TocProjection.view(toc.tree(new TocApi.TocId(space)), resolution, tenant, owner, access));
    }
}

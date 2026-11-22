package io.edition.control.usecases.authoring.tocediting;

import static io.edition.control.usecases.authoring.tocediting.TocEditingTypes.*;

import io.edition.control.modules.space.api.SpaceApi;
import io.edition.control.modules.toc.api.TocApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.principal.PrincipalResolver.Resolution;
import io.edition.control.usecases.resource.ResourceChain;
import io.edition.control.usecases.resource.SpaceNotFoundException;
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

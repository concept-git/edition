package io.edition.control.compositions.authoring.tocediting;

import static io.edition.control.compositions.authoring.tocediting.TocEditingTypes.*;

import io.edition.concepts.space.api.SpaceApi;
import io.edition.concepts.toc.api.TocApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.principal.PrincipalResolver.Resolution;
import io.edition.control.compositions.resource.ResourceChain;
import io.edition.control.compositions.resource.SpaceNotFoundException;
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

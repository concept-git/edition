package io.edition.control.usecases.hosting.site;

import static io.edition.control.usecases.hosting.site.SiteTypes.*;

import io.edition.control.modules.site.api.SiteApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.FlowResponse;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.principal.PrincipalResolver.Resolution;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class CreateSiteUseCase {
    private final SiteAccess access;
    private final TenantAccess tenants;

    private final SiteApi sites;

    private final IdempotentFlowExecutor idempotency;
    private final SiteProjection projection;

    CreateSiteUseCase(SiteDependencies dependencies) {
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.sites = dependencies.sites;
        this.idempotency = dependencies.idempotency;
        this.projection = dependencies.projection;
    }

    @Transactional
    public FlowResponse<SiteDetail> createSite(String credential, UUID tenant, String name, String key) {
        Resolution resolution = access.requireTenantAdmin(credential, tenant);
        SiteApi.ActorId actor = access.actor(resolution);
        return idempotency.execute(
                resolution.principal(),
                key,
                "site.create",
                IdempotentFlowExecutor.canonical(tenant, name.strip()),
                201,
                SiteDetail.class,
                () -> tenants.inTenant(
                        tenant,
                        () -> projection.detail(SitePatch.create(sites, actor, tenant, name), resolution, tenant)));
    }
}

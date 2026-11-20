package io.space.control.compositions.hosting.site;

import static io.space.control.compositions.hosting.site.SiteTypes.*;

import io.space.concepts.site.api.SiteApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.FlowResponse;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import io.space.control.compositions.principal.PrincipalResolver.Resolution;
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

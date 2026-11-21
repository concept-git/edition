package io.edition.control.compositions.hosting.site;

import static io.edition.control.compositions.hosting.site.SiteTypes.*;

import io.edition.concepts.site.api.SiteApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.FlowResponse;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import io.edition.control.compositions.resource.ResourceChain;
import io.edition.control.compositions.resource.SiteNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class UpdateSiteUseCase {
    private final SiteAccess access;
    private final TenantAccess tenants;
    private final ResourceChain resources;
    private final SiteApi sites;

    private final IdempotentFlowExecutor idempotency;
    private final SiteProjection projection;

    UpdateSiteUseCase(SiteDependencies dependencies) {
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.resources = dependencies.resources;
        this.sites = dependencies.sites;
        this.idempotency = dependencies.idempotency;
        this.projection = dependencies.projection;
    }

    @Transactional
    public FlowResponse<SiteDetail> updateSite(
            String credential, UUID tenant, UUID site, UpdatePatch patch, String key) {
        SiteApi.View existing = resources.site(tenant, site).orElseThrow(SiteNotFoundException::new);
        var resolution = access.require(credential, tenant, existing, TenantAccess.ADMIN);
        var normalized = SitePatch.normalize(patch);
        SiteApi.ActorId actor = access.actor(resolution);
        return idempotency.execute(
                resolution.principal(),
                key,
                "site.update",
                IdempotentFlowExecutor.canonical(tenant, site, SitePatch.canonical(normalized)),
                200,
                SiteDetail.class,
                () -> tenants.inTenant(tenant, () -> {
                    SiteApi.View current = sites.lock(new SiteApi.SiteId(site)).orElseThrow(SiteNotFoundException::new);
                    return projection.detail(
                            SitePatch.apply(sites, actor, site, current, normalized), resolution, tenant);
                }));
    }
}

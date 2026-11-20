package io.space.control.compositions.hosting.site;

import static io.space.control.compositions.hosting.site.SiteTypes.*;

import io.space.concepts.site.api.SiteApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.FlowResponse;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import io.space.control.compositions.resource.ResourceChain;
import io.space.control.compositions.resource.SiteNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class UnmountSpaceUseCase {
    private final SiteAccess access;
    private final TenantAccess tenants;
    private final ResourceChain resources;
    private final SiteApi sites;

    private final IdempotentFlowExecutor idempotency;
    private final SiteProjection projection;

    UnmountSpaceUseCase(SiteDependencies dependencies) {
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.resources = dependencies.resources;
        this.sites = dependencies.sites;
        this.idempotency = dependencies.idempotency;
        this.projection = dependencies.projection;
    }

    @Transactional
    public FlowResponse<SiteDetail> unmountSpace(String credential, UUID tenant, UUID site, String slug, String key) {
        SiteApi.View existing = resources.site(tenant, site).orElseThrow(SiteNotFoundException::new);
        var resolution = access.require(credential, tenant, existing, TenantAccess.ADMIN);
        SiteApi.ActorId actor = access.actor(resolution);
        return idempotency.execute(
                resolution.principal(),
                key,
                "site.unmount",
                IdempotentFlowExecutor.canonical(tenant, site, slug),
                200,
                SiteDetail.class,
                () -> tenants.inTenant(
                        tenant,
                        () -> projection.detail(
                                SiteResults.changed(sites.unmount(actor, new SiteApi.SiteId(site), slug)),
                                resolution,
                                tenant)));
    }
}

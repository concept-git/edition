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
    public FlowResponse<SiteDetail> unmountSpace(
            String credential, UUID tenant, UUID site, String slug, UUID spaceId, String key) {
        SiteApi.View existing = resources.site(tenant, site).orElseThrow(SiteNotFoundException::new);
        var resolution = access.require(credential, tenant, existing, TenantAccess.ADMIN);
        SiteApi.ActorId actor = access.actor(resolution);
        return idempotency.execute(
                resolution.principal(),
                key,
                "site.unmount",
                spaceId == null
                        ? IdempotentFlowExecutor.canonical(tenant, site, slug)
                        : IdempotentFlowExecutor.canonical(tenant, site, "space", spaceId),
                200,
                SiteDetail.class,
                () -> tenants.inTenant(
                        tenant,
                        () -> projection.detail(
                                SiteResults.changed(
                                        spaceId == null
                                                ? sites.unmount(actor, new SiteApi.SiteId(site), slug)
                                                : sites.unmountBySpace(actor, new SiteApi.SiteId(site), spaceId)),
                                resolution,
                                tenant)));
    }
}

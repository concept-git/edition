package io.edition.control.usecases.hosting.site;

import static io.edition.control.usecases.hosting.site.SiteTypes.*;

import io.edition.control.modules.site.api.SiteApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.FlowResponse;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.resource.ResourceChain;
import io.edition.control.usecases.resource.SiteNotFoundException;
import java.util.List;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ReorderMountsUseCase {
    private final SiteAccess access;
    private final TenantAccess tenants;
    private final ResourceChain resources;
    private final SiteApi sites;

    private final IdempotentFlowExecutor idempotency;
    private final SiteProjection projection;

    ReorderMountsUseCase(SiteDependencies dependencies) {
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.resources = dependencies.resources;
        this.sites = dependencies.sites;
        this.idempotency = dependencies.idempotency;
        this.projection = dependencies.projection;
    }

    @Transactional
    public FlowResponse<SiteDetail> reorderMounts(
            String credential, UUID tenant, UUID site, List<String> slugs, List<UUID> spaceIds, String key) {
        SiteApi.View existing = resources.site(tenant, site).orElseThrow(SiteNotFoundException::new);
        var resolution = access.require(credential, tenant, existing, TenantAccess.ADMIN);
        SiteApi.ActorId actor = access.actor(resolution);
        List<String> order = slugs == null ? List.of() : List.copyOf(slugs);
        return idempotency.execute(
                resolution.principal(),
                key,
                "site.reorder",
                spaceIds == null
                        ? IdempotentFlowExecutor.canonical(tenant, site, String.join(",", order))
                        : IdempotentFlowExecutor.canonical(tenant, site, "spaces", spaceIds),
                200,
                SiteDetail.class,
                () -> tenants.inTenant(
                        tenant,
                        () -> projection.detail(
                                SiteResults.changed(
                                        spaceIds == null
                                                ? sites.reorder(actor, new SiteApi.SiteId(site), order)
                                                : sites.reorderBySpace(actor, new SiteApi.SiteId(site), spaceIds)),
                                resolution,
                                tenant)));
    }
}

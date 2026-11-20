package io.space.control.compositions.hosting.site;

import static io.space.control.compositions.hosting.site.SiteTypes.*;

import io.space.concepts.site.api.SiteApi;
import io.space.concepts.space.api.SpaceApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.FlowResponse;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import io.space.control.compositions.resource.ResourceChain;
import io.space.control.compositions.resource.SiteNotFoundException;
import io.space.control.compositions.resource.SpaceArchivedException;
import io.space.control.compositions.resource.SpaceNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class MountSpaceUseCase {
    private final SiteAccess access;
    private final TenantAccess tenants;
    private final ResourceChain resources;
    private final SiteApi sites;

    private final IdempotentFlowExecutor idempotency;
    private final SiteProjection projection;
    private final io.space.control.compositions.resource.ResourceWriteLocks locks;

    MountSpaceUseCase(SiteDependencies dependencies) {
        this.access = dependencies.access;
        this.tenants = dependencies.tenants;
        this.resources = dependencies.resources;
        this.sites = dependencies.sites;
        this.idempotency = dependencies.idempotency;
        this.projection = dependencies.projection;
        this.locks = dependencies.locks;
    }

    @Transactional
    public FlowResponse<SiteDetail> mountSpace(
            String credential, UUID tenant, UUID site, String slug, UUID space, String key) {
        SiteApi.View existing = resources.site(tenant, site).orElseThrow(SiteNotFoundException::new);
        var resolution = access.require(credential, tenant, existing, TenantAccess.ADMIN);
        SpaceApi.View target = resources.space(tenant, space).orElseThrow(SpaceNotFoundException::new);
        boolean alreadyMounted = existing.mounts().stream()
                .anyMatch(mount -> mount.slug().equals(slug) && mount.target().equals(space));
        if (!alreadyMounted && target.status() == SpaceApi.Status.ARCHIVED) {
            throw new SpaceArchivedException();
        }
        SiteApi.ActorId actor = access.actor(resolution);
        return idempotency.execute(
                resolution.principal(),
                key,
                "site.mount",
                IdempotentFlowExecutor.canonical(tenant, site, slug, space),
                200,
                SiteDetail.class,
                () -> tenants.inTenant(tenant, () -> {
                    var latestTarget = locks.space(tenant, space);
                    SiteApi.View current = sites.lock(new SiteApi.SiteId(site)).orElseThrow(SiteNotFoundException::new);
                    boolean stillMounted = current.mounts().stream()
                            .anyMatch(m -> m.slug().equals(slug) && m.target().equals(space));
                    if (!stillMounted && latestTarget.status() == SpaceApi.Status.ARCHIVED)
                        throw new SpaceArchivedException();
                    return projection.detail(
                            SiteResults.mounted(
                                    sites.mount(actor, new SiteApi.SiteId(site), space, slug), space, current),
                            resolution,
                            tenant);
                }));
    }
}

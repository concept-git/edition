package io.edition.control.compositions.hosting.reorganization;

import static io.edition.control.compositions.hosting.reorganization.ReorganizationTypes.*;

import io.edition.concepts.site.api.SiteApi;
import io.edition.control.compositions.AuthoringWrites;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.FlowResponse;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import io.edition.control.compositions.hosting.site.SiteAccess;
import io.edition.control.compositions.hosting.site.SiteProjection;
import io.edition.control.compositions.hosting.site.SiteTypes;
import io.edition.control.compositions.principal.PrincipalResolver.Resolution;
import io.edition.control.compositions.resource.ResourceChain;
import io.edition.control.compositions.resource.ResourceWriteLocks;
import io.edition.control.compositions.resource.SiteNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class RemountUseCase {
    private final ReorganizationRelay relay;
    private final ResourceWriteLocks locks;
    private final SiteApi sites;

    private final ResourceChain resources;
    private final TenantAccess tenants;
    private final SiteAccess siteAccess;

    private final AuthoringWrites authoringWrites;
    private final IdempotentFlowExecutor idempotency;
    private final SiteProjection siteProjection;

    RemountUseCase(ReorganizationDependencies dependencies) {
        this.relay = dependencies.relay;
        this.locks = dependencies.locks;
        this.sites = dependencies.sites;
        this.resources = dependencies.resources;
        this.tenants = dependencies.tenants;
        this.siteAccess = dependencies.siteAccess;
        this.authoringWrites = dependencies.authoringWrites;
        this.idempotency = dependencies.idempotency;
        this.siteProjection = dependencies.siteProjection;
    }

    @Transactional
    public FlowResponse<SiteTypes.SiteDetail> remount(
            String credential, UUID tenant, UUID site, String oldSlug, String newSlug, String key) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            SiteApi.View existing = resources.site(tenant, site).orElseThrow(SiteNotFoundException::new);
            Resolution resolution = siteAccess.require(credential, tenant, existing, TenantAccess.ADMIN);
            SiteApi.ActorId actor = siteAccess.actor(resolution);
            return idempotency.execute(
                    resolution.principal(),
                    key,
                    "site.remount",
                    IdempotentFlowExecutor.canonical(tenant, site, oldSlug.strip(), newSlug.strip()),
                    200,
                    SiteTypes.SiteDetail.class,
                    () -> tenants.inTenant(tenant, () -> {
                        var siteId = new SiteApi.SiteId(site);
                        UUID target = sites.targetAt(siteId, oldSlug).orElseThrow(MountNotFoundException::new);
                        authoringWrites.requireActive(locks.space(tenant, target));
                        locks.site(tenant, site);
                        sites.targetAt(siteId, oldSlug).filter(target::equals).orElseThrow(MountNotFoundException::new);
                        String from = sites.slugOf(siteId, target).orElseThrow(MountNotFoundException::new);
                        SiteApi.View changed =
                                switch (sites.remount(actor, new SiteApi.SiteId(site), from, newSlug)) {
                                    case SiteApi.MountResult.Mounted mounted -> mounted.site();
                                    case SiteApi.MountResult.NotFound ignored -> throw new SiteNotFoundException();
                                    case SiteApi.MountResult.MountMissing ignored -> throw new MountNotFoundException();
                                    case SiteApi.MountResult.SlugTaken ignored -> throw AddressFailures.slugTaken();
                                    case SiteApi.MountResult.SlugInvalid ignored ->
                                        throw new SlugInvalidException("newSlug");
                                    case SiteApi.MountResult.TargetAlreadyMounted ignored ->
                                        throw new IllegalStateException("remount cannot change the target");
                                };
                        String to =
                                sites.slugOf(new SiteApi.SiteId(site), target).orElseThrow(MountNotFoundException::new);
                        if (!from.equals(to)) relay.redirectOnRemount(site, from, target);
                        return siteProjection.view(credential, tenant, changed.id());
                    }));
        }
    }
}

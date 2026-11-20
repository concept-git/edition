package io.space.control.compositions.hosting.sitedelivery;

import io.space.concepts.customdomain.api.*;
import io.space.concepts.redirect.api.*;
import io.space.concepts.release.api.*;
import io.space.concepts.site.api.*;
import io.space.concepts.space.api.*;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import java.util.*;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
final class SiteDeliveryTriggers {
    private final SiteDeliveryScheduler scheduler;
    private final SiteApi sites;
    private final SpaceApi spaces;
    private final TenantScopeApi scope;

    SiteDeliveryTriggers(SiteDeliveryScheduler scheduler, SiteApi sites, SpaceApi spaces, TenantScopeApi scope) {
        this.scheduler = scheduler;
        this.sites = sites;
        this.spaces = spaces;
        this.scope = scope;
    }

    @EventListener
    public void siteCreated(SiteEvents.Created e) {
        scheduler.schedule(e.site().tenantId(), e.site().id());
    }

    @EventListener
    public void siteRenamed(SiteEvents.Renamed e) {
        scheduler.schedule(e.site().tenantId(), e.site().id());
    }

    @EventListener
    public void siteMounted(SiteEvents.Mounted e) {
        scheduler.schedule(e.site().tenantId(), e.site().id());
    }

    @EventListener
    public void siteRemounted(SiteEvents.Remounted e) {
        scheduler.schedule(e.site().tenantId(), e.site().id());
    }

    @EventListener
    public void siteUnmounted(SiteEvents.Unmounted e) {
        scheduler.schedule(e.site().tenantId(), e.site().id());
    }

    @EventListener
    public void siteReordered(SiteEvents.Reordered e) {
        scheduler.schedule(e.site().tenantId(), e.site().id());
    }

    @EventListener
    public void siteSettingsChanged(SiteEvents.SettingsChanged e) {
        scheduler.schedule(e.site().tenantId(), e.site().id());
    }

    @EventListener
    public void siteDeleted(SiteEvents.Deleted e) {
        scheduler.schedule(e.tenantId(), e.site().value());
    }

    @EventListener
    public void domainVerified(CustomDomainEvents.Verified e) {
        site(e.domain().target());
    }

    @EventListener
    public void domainPrimarySet(CustomDomainEvents.PrimarySet e) {
        site(e.domain().target());
    }

    @EventListener
    public void domainRemoved(CustomDomainEvents.Unbound e) {
        site(e.target());
    }

    @EventListener
    public void promoted(ReleaseEvents.Promoted e) {
        space(e.release().scopeId());
    }

    @EventListener
    public void renamed(SpaceEvents.Renamed e) {
        space(e.space().id());
    }

    @EventListener
    public void reslugged(SpaceEvents.Reslugged e) {
        space(e.placement().space().value());
    }

    @EventListener
    public void transferred(SpaceEvents.Transferred e) {
        space(e.from().space().value());
        space(e.to().space().value());
    }

    @EventListener
    public void redirect(RedirectEvents.Registered e) {
        site(e.rule().scopeId());
    }

    @EventListener
    public void retired(RedirectEvents.Retired e) {
        site(e.scope().value());
    }

    private void site(UUID site) {
        sites.tenantOf(new SiteApi.SiteId(site)).ifPresent(t -> scheduler.schedule(t, site));
    }

    private void space(UUID space) {
        spaces.tenantOf(new SpaceApi.SpaceId(space))
                .ifPresent(t -> scope.inTenant(new TenantRegistryApi.TenantId(t), () -> {
                    for (var s : sites.mountsOf(space))
                        scheduler.schedule(t, s.site().value());
                    return null;
                }));
    }
}

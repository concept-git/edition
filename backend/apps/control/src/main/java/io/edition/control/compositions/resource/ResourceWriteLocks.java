package io.edition.control.compositions.resource;

import io.edition.concepts.page.api.PageApi;
import io.edition.concepts.site.api.SiteApi;
import io.edition.concepts.space.api.SpaceApi;
import io.edition.control.compositions.access.TenantAccess;
import java.util.UUID;
import org.springframework.stereotype.Component;

/** Serializes resource-dependent writes with terminal deletion. Lock order: space, page/site. */
@Component
public final class ResourceWriteLocks {
    private final SpaceApi spaces;
    private final PageApi pages;
    private final SiteApi sites;
    private final TenantAccess tenants;

    public ResourceWriteLocks(SpaceApi spaces, PageApi pages, SiteApi sites, TenantAccess tenants) {
        this.spaces = spaces;
        this.pages = pages;
        this.sites = sites;
        this.tenants = tenants;
    }

    public SpaceApi.View space(UUID tenant, UUID id) {
        return tenants.inTenant(
                tenant,
                () -> spaces.lock(new SpaceApi.SpaceId(id))
                        .filter(s -> s.tenantId().equals(tenant))
                        .orElseThrow(SpaceNotFoundException::new));
    }

    public SiteApi.View site(UUID tenant, UUID id) {
        return tenants.inTenant(
                tenant,
                () -> sites.lock(new SiteApi.SiteId(id))
                        .filter(s -> s.tenantId().equals(tenant))
                        .orElseThrow(SiteNotFoundException::new));
    }

    public PageApi.View page(UUID tenant, UUID space, UUID id) {
        return locatedPage(tenant, space, id).page();
    }

    public ResourceChain.LocatedPage locatedPage(UUID tenant, UUID space, UUID id) {
        var owner = space(tenant, space);
        return tenants.inTenant(tenant, () -> {
            var page = pages.lock(new PageApi.PageId(id)).orElseThrow(PageNotFoundException::new);
            var placement = spaces.placementsOf(java.util.Set.of(id)).stream()
                    .filter(value -> value.space().value().equals(space))
                    .findFirst()
                    .orElseThrow(PageNotFoundException::new);
            return new ResourceChain.LocatedPage(owner, page, placement.slug());
        });
    }
}

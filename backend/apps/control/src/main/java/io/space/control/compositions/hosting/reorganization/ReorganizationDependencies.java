package io.space.control.compositions.hosting.reorganization;

import static io.space.control.compositions.hosting.reorganization.ReorganizationTypes.*;

import io.space.concepts.redirect.api.RedirectApi;
import io.space.concepts.site.api.SiteApi;
import io.space.concepts.space.api.SpaceApi;
import io.space.concepts.toc.api.TocApi;
import io.space.control.compositions.AuthoringWrites;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.authoring.pageediting.PageAccess;
import io.space.control.compositions.authoring.pageediting.PageProjection;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import io.space.control.compositions.hosting.site.SiteAccess;
import io.space.control.compositions.hosting.site.SiteProjection;
import io.space.control.compositions.releases.release.AuthoredAutoRelease;
import io.space.control.compositions.resource.ResourceChain;
import io.space.control.compositions.resource.ResourceWriteLocks;

@org.springframework.stereotype.Component
final class ReorganizationDependencies {
    final ReorganizationRelay relay;
    final ResourceWriteLocks locks;
    final SiteApi sites;
    final SpaceApi spaces;
    final TocApi toc;
    final RedirectApi redirects;
    final ResourceChain resources;
    final TenantAccess tenants;
    final SiteAccess siteAccess;
    final PageAccess pageAccess;
    final AuthoringWrites authoringWrites;
    final IdempotentFlowExecutor idempotency;
    final SiteProjection siteProjection;
    final PageProjection pageProjection;
    final AuthoredAutoRelease authoredAutoRelease;
    final RedirectTargets targets;

    ReorganizationDependencies(
            SiteApi sites,
            SpaceApi spaces,
            TocApi toc,
            RedirectApi redirects,
            ResourceChain resources,
            TenantAccess tenants,
            SiteAccess siteAccess,
            PageAccess pageAccess,
            AuthoringWrites authoringWrites,
            IdempotentFlowExecutor idempotency,
            SiteProjection siteProjection,
            PageProjection pageProjection,
            AuthoredAutoRelease authoredAutoRelease,
            RedirectTargets targets,
            ResourceWriteLocks locks,
            ReorganizationRelay relay) {
        this.relay = relay;
        this.locks = locks;
        this.sites = sites;
        this.spaces = spaces;
        this.toc = toc;
        this.redirects = redirects;
        this.resources = resources;
        this.tenants = tenants;
        this.siteAccess = siteAccess;
        this.pageAccess = pageAccess;
        this.authoringWrites = authoringWrites;
        this.idempotency = idempotency;
        this.siteProjection = siteProjection;
        this.pageProjection = pageProjection;
        this.authoredAutoRelease = authoredAutoRelease;
        this.targets = targets;
    }
}

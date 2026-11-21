package io.edition.control.compositions.hosting.reorganization;

import static io.edition.control.compositions.hosting.reorganization.ReorganizationTypes.*;

import io.edition.concepts.redirect.api.RedirectApi;
import io.edition.concepts.site.api.SiteApi;
import io.edition.concepts.space.api.SpaceApi;
import io.edition.concepts.toc.api.TocApi;
import io.edition.control.compositions.AuthoringWrites;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.authoring.pageediting.PageAccess;
import io.edition.control.compositions.authoring.pageediting.PageProjection;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import io.edition.control.compositions.hosting.site.SiteAccess;
import io.edition.control.compositions.hosting.site.SiteProjection;
import io.edition.control.compositions.releases.release.AuthoredAutoRelease;
import io.edition.control.compositions.resource.ResourceChain;
import io.edition.control.compositions.resource.ResourceWriteLocks;

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

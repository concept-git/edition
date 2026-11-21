package io.edition.control.compositions.hosting.site;

import io.edition.concepts.customdomain.api.CustomDomainApi;
import io.edition.concepts.site.api.SiteApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.InvalidCursorException;
import io.edition.control.compositions.principal.PrincipalResolver.Resolution;
import io.edition.control.compositions.resource.ResourceChain;
import io.edition.control.compositions.resource.SiteNotFoundException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class SiteProjection {
    private final SiteAccess access;
    private final TenantAccess tenants;
    private final SiteApi sites;
    private final CustomDomainApi domains;
    private final ResourceChain resources;

    SiteProjection(
            SiteAccess access, TenantAccess tenants, SiteApi sites, CustomDomainApi domains, ResourceChain resources) {
        this.access = access;
        this.tenants = tenants;
        this.sites = sites;
        this.domains = domains;
        this.resources = resources;
    }

    public SiteTypes.SiteDetail view(String credential, UUID tenant, UUID site) {
        SiteApi.View found = resources.site(tenant, site).orElseThrow(SiteNotFoundException::new);
        var resolution = access.require(credential, tenant, found, TenantAccess.READ);
        return tenants.inTenant(tenant, () -> detail(found, resolution, tenant));
    }

    SiteTypes.SitePage list(Resolution resolution, UUID tenant, String cursor, int limit) {
        var visible = new ArrayList<SiteTypes.SiteSummary>(limit);
        String scanCursor = cursor;
        String nextCursor = null;
        while (visible.size() < limit) {
            int remaining = limit - visible.size();
            final String batchCursor = scanCursor;
            final SiteApi.Page page;
            try {
                page = tenants.inTenant(tenant, () -> sites.pageByTenant(tenant, batchCursor, remaining));
            } catch (IllegalArgumentException invalid) {
                throw new InvalidCursorException();
            }
            Set<UUID> candidates = page.items().stream().map(SiteApi.View::id).collect(Collectors.toUnmodifiableSet());
            Set<UUID> allowed = access.readable(resolution, tenant, candidates);
            tenants.inTenant(tenant, () -> {
                page.items().stream()
                        .filter(site -> allowed.contains(site.id()))
                        .map(site -> summary(site, resolution, tenant))
                        .forEach(visible::add);
                return null;
            });
            nextCursor = page.nextCursor();
            if (nextCursor == null || visible.size() >= limit) break;
            scanCursor = nextCursor;
        }
        return new SiteTypes.SitePage(visible, nextCursor, null, listActions(resolution, tenant));
    }

    SiteTypes.SiteSummary summary(SiteApi.View view, Resolution resolution, UUID tenant) {
        return new SiteTypes.SiteSummary(
                view.id(),
                view.tenantId(),
                view.name(),
                view.rule(),
                view.home(),
                view.robotsPolicy().value(),
                domainRows(tenant, view.id()),
                view.createdAt(),
                view.createdBy(),
                view.updatedAt(),
                view.updatedBy(),
                sorted(access.allowedActions(resolution, tenant, view)));
    }

    SiteTypes.SiteDetail detail(SiteApi.View view, Resolution resolution, UUID tenant) {
        var summary = summary(view, resolution, tenant);
        SiteApi.Branding branding = view.branding() == null ? new SiteApi.Branding(null, null, null) : view.branding();
        return new SiteTypes.SiteDetail(
                summary.id(),
                summary.tenantId(),
                summary.name(),
                summary.rule(),
                summary.home(),
                summary.robotsPolicy(),
                view.titleTemplate(),
                new SiteTypes.Branding(branding.logo(), branding.favicon(), branding.primaryColor()),
                view.locale(),
                view.analyticsId(),
                view.mounts().stream()
                        .map(mount -> new SiteTypes.Mount(mount.target(), mount.slug()))
                        .toList(),
                summary.domains(),
                summary.createdAt(),
                summary.createdBy(),
                summary.updatedAt(),
                summary.updatedBy(),
                summary.allowedActions());
    }

    List<SiteTypes.Action> listActions(Resolution resolution, UUID tenant) {
        return sorted(access.listActions(resolution, tenant));
    }

    private List<SiteTypes.Domain> domainRows(UUID tenant, UUID site) {
        return tenants.inTenant(
                tenant,
                () -> domains.activeHostsOf(site).stream()
                        .map(item -> new SiteTypes.Domain(item.host(), item.verified(), item.isPrimary()))
                        .toList());
    }

    private static List<SiteTypes.Action> sorted(Set<SiteTypes.Action> actions) {
        return actions.stream()
                .sorted(Comparator.comparing(SiteTypes.Action::value))
                .toList();
    }
}

package io.space.control.compositions.authoring.space;

import io.space.concepts.collection.api.CollectionApi;
import io.space.concepts.page.api.PageApi;
import io.space.concepts.release.api.ReleaseApi;
import io.space.concepts.site.api.SiteApi;
import io.space.concepts.space.api.SpaceApi;
import io.space.control.compositions.DriftFacts;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.principal.PrincipalResolver;
import io.space.control.compositions.resource.ResourceChain;
import io.space.control.compositions.resource.SpaceNotFoundException;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class SpaceProjection {
    private final SpaceAccess access;
    private final CollectionApi collections;
    private final ReleaseApi releases;
    private final TenantAccess tenants;
    private final SpaceApi spaces;
    private final PageApi pages;
    private final SiteApi sites;
    private final DriftFacts drift;
    private final ResourceChain resources;

    SpaceProjection(
            SpaceAccess access,
            CollectionApi collections,
            ReleaseApi releases,
            TenantAccess tenants,
            SpaceApi spaces,
            PageApi pages,
            SiteApi sites,
            DriftFacts drift,
            ResourceChain resources) {
        this.access = access;
        this.collections = collections;
        this.releases = releases;
        this.tenants = tenants;
        this.spaces = spaces;
        this.pages = pages;
        this.sites = sites;
        this.drift = drift;
        this.resources = resources;
    }

    public SpaceTypes.SpaceDetail view(String credential, UUID tenant, UUID space) {
        SpaceApi.View found = resources.space(tenant, space).orElseThrow(SpaceNotFoundException::new);
        var resolution = access.require(credential, tenant, found, TenantAccess.READ);
        return detail(found, resolution, tenant);
    }

    SpaceTypes.SpaceSummary summary(SpaceApi.View view, PrincipalResolver.Resolution resolution, UUID tenant) {
        UUID collectionId = tenants.inTenant(
                tenant, () -> collections.collectionOf(view.id()).orElse(null));
        ReleaseFacts facts = releaseFacts(tenant, view.id());
        int pageCount = tenants.inTenant(tenant, () -> {
            int count = 0;
            for (SpaceApi.Placement placement : spaces.itemsOf(new SpaceApi.SpaceId(view.id()))) {
                var page = pages.view(new PageApi.PageId(placement.item()));
                if (page.isPresent() && page.orElseThrow().trashedAt() == null) count++;
            }
            return count;
        });
        int driftCount = tenants.inTenant(tenant, () -> drift.size(view.id()));
        return new SpaceTypes.SpaceSummary(
                view.id(),
                view.tenantId(),
                view.name(),
                icon(view),
                view.mode().name().toLowerCase(Locale.ROOT),
                view.status().name().toLowerCase(Locale.ROOT),
                pageCount,
                driftCount,
                facts.lastReleaseAt(),
                view.createdAt(),
                view.createdBy(),
                view.updatedAt(),
                view.updatedBy(),
                collectionId,
                sorted(access.allowedActions(resolution, tenant, view, facts.hasLive())));
    }

    SpaceTypes.SpaceDetail detail(SpaceApi.View view, PrincipalResolver.Resolution resolution, UUID tenant) {
        var summary = summary(view, resolution, tenant);
        List<String> path = tenants.inTenant(tenant, () -> collections.pathOf(view.id()));
        int keep = tenants.inTenant(tenant, () -> releases.keep(new ReleaseApi.ScopeId(view.id())));
        var occurrences = tenants.inTenant(tenant, () -> sites.mountsOf(view.id()));
        var chains = occurrences.stream()
                .map(mount -> List.of(
                        TenantAccess.tenant(tenant),
                        TenantAccess.site(mount.site().value())))
                .collect(java.util.stream.Collectors.toSet());
        var visible = tenants.filter(resolution, tenant, chains, TenantAccess.READ).stream()
                .map(List::getLast)
                .map(io.space.concepts.permission.api.PermissionApi.Resource::id)
                .collect(java.util.stream.Collectors.toSet());
        List<SpaceTypes.Mount> mounts = occurrences.stream()
                .filter(mount -> visible.contains(mount.site().value()))
                .map(mount -> new SpaceTypes.Mount(mount.site().value(), mount.slug()))
                .toList();
        return new SpaceTypes.SpaceDetail(
                summary.id(),
                summary.tenantId(),
                summary.name(),
                summary.icon(),
                view.description(),
                summary.mode(),
                summary.status(),
                summary.pageCount(),
                summary.driftCount(),
                summary.lastReleaseAt(),
                summary.createdAt(),
                summary.createdBy(),
                summary.updatedAt(),
                summary.updatedBy(),
                summary.collectionId(),
                summary.allowedActions(),
                path,
                mounts,
                occurrences.size(),
                keep,
                view.mode() == SpaceApi.Mode.AUTHORED ? view.autoRelease() : null);
    }

    List<SpaceTypes.Action> listActions(PrincipalResolver.Resolution resolution, UUID tenant) {
        return sorted(access.listActions(resolution, tenant));
    }

    private ReleaseFacts releaseFacts(UUID tenant, UUID space) {
        return tenants.inTenant(tenant, () -> {
            var live = releases.live(new ReleaseApi.ScopeId(space));
            return new ReleaseFacts(live.map(ReleaseApi.View::promotedAt).orElse(null), live.isPresent());
        });
    }

    private static String icon(SpaceApi.View view) {
        return view.icon() == null ? null : view.icon().value();
    }

    private static List<SpaceTypes.Action> sorted(Set<SpaceTypes.Action> actions) {
        return actions.stream()
                .sorted(Comparator.comparing(SpaceTypes.Action::value))
                .toList();
    }

    private record ReleaseFacts(Instant lastReleaseAt, boolean hasLive) {}
}

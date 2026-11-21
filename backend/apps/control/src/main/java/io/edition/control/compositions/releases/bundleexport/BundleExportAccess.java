package io.edition.control.compositions.releases.bundleexport;

import io.edition.concepts.permission.api.PermissionApi;
import io.edition.concepts.release.api.ReleaseApi;
import io.edition.concepts.space.api.SpaceApi;
import io.edition.control.compositions.access.PermissionDeniedException;
import io.edition.control.compositions.access.PermissionGuard;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.principal.PrincipalResolver.Resolution;
import io.edition.control.compositions.releases.release.ReleaseAccess;
import io.edition.control.compositions.releases.release.ReleaseNotFoundException;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/** A release's historical scope never substitutes for each page's current owner and permissions. */
@Component
final class BundleExportAccess {
    private final ReleaseAccess access;
    private final TenantAccess tenants;
    private final SpaceApi spaces;
    private final ReleaseApi releases;
    private final PermissionApi permissions;

    BundleExportAccess(
            ReleaseAccess access,
            TenantAccess tenants,
            SpaceApi spaces,
            ReleaseApi releases,
            PermissionApi permissions) {
        this.access = access;
        this.tenants = tenants;
        this.spaces = spaces;
        this.releases = releases;
        this.permissions = permissions;
    }

    Authorized capture(String credential, UUID tenant, UUID space, UUID release) {
        var owner = access.space(tenant, space);
        var actor = require(credential, tenant, space);
        return tenants.inTenant(tenant, () -> {
            var selected = access.requireRelease(space, release);
            if (selected.status() != ReleaseApi.Status.LIVE && selected.status() != ReleaseApi.Status.ARCHIVED)
                throw new PermissionDeniedException();
            var bundle = releases.export(new ReleaseApi.ReleaseId(release)).orElseThrow(ReleaseNotFoundException::new);
            requirePages(
                    actor,
                    tenant,
                    bundle.pages().stream().map(ReleaseApi.PageSnapshot::pageId).collect(Collectors.toSet()));
            return new Authorized(actor, owner, bundle);
        });
    }

    Resolution require(String credential, UUID tenant, UUID space) {
        access.space(tenant, space);
        var actor = tenants.admit(credential, tenant);
        var chain = List.of(TenantAccess.tenant(tenant), TenantAccess.space(space));
        if (!actor.permits(TenantAccess.PUBLISH)
                || !PermissionGuard.bindingMatches(actor, chain)
                || tenants.inTenant(
                                tenant,
                                () -> permissions.filterFresh(Set.of(chain), actor.subject(), TenantAccess.PUBLISH))
                        .isEmpty()) throw new PermissionDeniedException();
        return actor;
    }

    void requirePages(Resolution actor, UUID tenant, Set<UUID> pages) {
        if (!actor.permits(TenantAccess.READ)) throw new PermissionDeniedException();
        var ids = new ArrayList<>(pages);
        for (int start = 0; start < ids.size(); start += 256) {
            var batch = Set.copyOf(ids.subList(start, Math.min(start + 256, ids.size())));
            var located = spaces.placementsOf(batch);
            if (located.size() != batch.size()) throw new PermissionDeniedException();
            var chains = located.stream()
                    .map(p -> List.of(
                            TenantAccess.tenant(tenant),
                            TenantAccess.space(p.space().value()),
                            TenantAccess.page(p.item())))
                    .collect(Collectors.toSet());
            if (chains.stream().anyMatch(chain -> !PermissionGuard.bindingMatches(actor, chain))
                    || permissions
                                    .filterFresh(chains, actor.subject(), TenantAccess.READ)
                                    .size()
                            != chains.size()) throw new PermissionDeniedException();
        }
    }

    record Authorized(Resolution actor, SpaceApi.View space, ReleaseApi.Bundle bundle) {}
}

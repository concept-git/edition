package io.edition.control.compositions.authoring.termination;

import io.edition.concepts.apitoken.api.ApiTokenApi;
import io.edition.concepts.collection.api.CollectionApi;
import io.edition.concepts.customdomain.api.CustomDomainApi;
import io.edition.concepts.deletionrecovery.api.DeletionRecoveryApi;
import io.edition.concepts.importjob.api.ImportJobApi;
import io.edition.concepts.page.api.PageApi;
import io.edition.concepts.permission.api.PermissionApi;
import io.edition.concepts.redirect.api.RedirectApi;
import io.edition.concepts.release.api.ReleaseApi;
import io.edition.concepts.revision.api.RevisionApi;
import io.edition.concepts.search.api.SearchApi;
import io.edition.concepts.site.api.SiteApi;
import io.edition.concepts.space.api.SpaceApi;
import io.edition.concepts.tag.api.TagApi;
import io.edition.concepts.toc.api.TocApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.hosting.site.SiteNotEmptyException;
import io.edition.control.compositions.resource.SiteNotFoundException;
import io.edition.control.compositions.resource.SpaceNotFoundException;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * Coordinates owned actions; SQL remains inside each module. Caller holds the tenant transaction.
 */
@Component
public class TerminalResources {
    private final io.edition.concepts.objectstore.api.ObjectReservationsApi reservations;
    private final io.edition.concepts.bundleexport.api.BundleExportJobs exports;
    private final SpaceApi spaces;
    private final PageApi pages;
    private final RevisionApi revisions;
    private final TagApi tags;
    private final SearchApi search;
    private final TocApi toc;
    private final CollectionApi collections;
    private final ReleaseApi releases;
    private final SiteApi sites;
    private final CustomDomainApi domains;
    private final RedirectApi redirects;
    private final PermissionApi permissions;
    private final ApiTokenApi tokens;
    private final ImportJobApi jobs;
    private final DeletionRecoveryApi operations;

    public TerminalResources(
            SpaceApi spaces,
            PageApi pages,
            RevisionApi revisions,
            TagApi tags,
            SearchApi search,
            TocApi toc,
            CollectionApi collections,
            ReleaseApi releases,
            SiteApi sites,
            CustomDomainApi domains,
            RedirectApi redirects,
            PermissionApi permissions,
            ApiTokenApi tokens,
            ImportJobApi jobs,
            DeletionRecoveryApi operations,
            io.edition.concepts.objectstore.api.ObjectReservationsApi reservations,
            io.edition.concepts.bundleexport.api.BundleExportJobs exports) {
        this.exports = exports;
        this.reservations = reservations;
        this.spaces = spaces;
        this.pages = pages;
        this.revisions = revisions;
        this.tags = tags;
        this.search = search;
        this.toc = toc;
        this.collections = collections;
        this.releases = releases;
        this.sites = sites;
        this.domains = domains;
        this.redirects = redirects;
        this.permissions = permissions;
        this.tokens = tokens;
        this.jobs = jobs;
        this.operations = operations;
    }

    public DeletionRecoveryApi.Deletion space(UUID tenant, UUID id, UUID actor, String name) {
        operations.lockSpace(id);
        var current = spaces.lock(new SpaceApi.SpaceId(id)).orElseThrow(SpaceNotFoundException::new);
        validateSpace(current, tenant, name);
        var pageIds = spaces.itemsOf(new SpaceApi.SpaceId(id)).stream()
                .map(SpaceApi.Placement::item)
                .collect(Collectors.toSet());
        var affected = new HashSet<UUID>();
        for (var occurrence : sites.mountsOf(id).stream()
                .sorted(Comparator.comparing(o -> o.site().value()))
                .toList()) {
            sites.unmountBySpace(new SiteApi.ActorId(actor), occurrence.site(), id);
            affected.add(occurrence.site().value());
        }
        exports.terminateSpace(id);
        jobs.terminateSpace(id);
        for (var token : tokens.inSpace(tenant, id, true)) {
            tokens.revoke(token.id());
            permissions.clearPrincipal(new PermissionApi.Principal(
                    PermissionApi.PrincipalType.TOKEN, token.id().value()));
        }
        retireTargets(tenant, id, pageIds);
        toc.replace(new TocApi.TocId(id), List.of());
        var objects = new HashSet<>(releases.objectKeys(new ReleaseApi.ScopeId(id)));
        releases.terminateScope(new ReleaseApi.ScopeId(id));
        for (UUID page : pageIds.stream().sorted().toList()) {
            pages.lock(new PageApi.PageId(page))
                    .ifPresent(p -> p.attachments().forEach(a -> objects.add(a.storageKey())));
            clearPage(page);
            pages.terminate(new PageApi.PageId(page));
        }
        collections.unplace(id);
        permissions.clearResource(TenantAccess.space(id));
        if (!spaces.delete(new SpaceApi.SpaceId(id))) throw new TerminationErrors.NotArchived();
        objects.forEach(reservations::protect);
        return operations.deleted(tenant, "space", id, actor, objects, affected);
    }

    public DeletionRecoveryApi.Deletion site(UUID tenant, UUID id, UUID actor, String name) {
        operations.boundLockWait();
        var current = sites.lock(new SiteApi.SiteId(id)).orElseThrow(SiteNotFoundException::new);
        validateSite(current, tenant, name);
        for (var domain : domains.hostsOf(id)) domains.unbind(domain.host());
        retireSite(id, null, null);
        permissions.clearResource(TenantAccess.site(id));
        search.terminateScope(new SearchApi.ScopeId(id));
        var deleted = sites.delete(new SiteApi.ActorId(actor), new SiteApi.SiteId(id));
        if (!(deleted instanceof SiteApi.DeleteResult.Deleted))
            throw new IllegalStateException("locked site deletion rejected");
        return operations.deleted(tenant, "site", id, actor, Set.of(), Set.of(id));
    }

    public TerminationTypes.TerminationPlan planSpace(UUID tenant, UUID id, String name) {
        var current = spaces.view(new SpaceApi.SpaceId(id)).orElseThrow(SpaceNotFoundException::new);
        validateSpace(current, tenant, name);
        return new TerminationTypes.TerminationPlan(
                "space",
                id,
                "server-validated",
                java.time.Instant.now(),
                Map.of("pages", (long) spaces.itemsOf(new SpaceApi.SpaceId(id)).size(), "mounts", (long)
                        sites.mountsOf(id).size()),
                List.of(
                        "unmount-sites",
                        "terminate-import-and-export-jobs",
                        "revoke-space-tokens",
                        "retire-redirect-targets",
                        "clear-toc-releases-pages-revisions-tags-grants",
                        "schedule-protected-object-cleanup"),
                List.of(
                        "Concurrent state and authorization changes are revalidated under execution locks.",
                        "Object cleanup continues asynchronously."));
    }

    public TerminationTypes.TerminationPlan planSite(UUID tenant, UUID id, String name) {
        var current = sites.view(new SiteApi.SiteId(id)).orElseThrow(SiteNotFoundException::new);
        validateSite(current, tenant, name);
        return new TerminationTypes.TerminationPlan(
                "site",
                id,
                "server-validated",
                java.time.Instant.now(),
                Map.of("mounts", (long) current.mounts().size(), "domains", (long)
                        domains.hostsOf(id).size()),
                List.of("unbind-domains", "retire-site-redirects", "clear-site-grants-and-search", "terminate-site"),
                List.of("Concurrent state and authorization changes are revalidated under execution locks."));
    }

    private static void validateSpace(SpaceApi.View current, UUID tenant, String name) {
        if (!current.tenantId().equals(tenant)) throw new SpaceNotFoundException();
        if (current.status() != SpaceApi.Status.ARCHIVED) throw new TerminationErrors.NotArchived();
        confirm(current.name(), name);
    }

    private static void validateSite(SiteApi.View current, UUID tenant, String name) {
        if (!current.tenantId().equals(tenant)) throw new SiteNotFoundException();
        if (!current.mounts().isEmpty()) throw new SiteNotEmptyException();
        confirm(current.name(), name);
    }

    public boolean purge(UUID tenant, UUID page, Duration retention) {
        var space = spaces.spaceOf(page);
        if (space.isEmpty()) return false;
        operations.lockSpace(space.orElseThrow().value());
        spaces.lock(space.orElseThrow()).orElseThrow(SpaceNotFoundException::new);
        var current = pages.lock(new PageApi.PageId(page));
        if (current.isEmpty() || releases.referencesPage(page)) return false;
        var value = current.orElseThrow();
        // Page.purge validates its Clock boundary; cleanup before it must also be atomic on
        // rejection.
        if (value.trashedAt() == null) return false;
        var objects =
                value.attachments().stream().map(PageApi.Attachment::storageKey).collect(Collectors.toSet());
        for (var entry : toc.entriesFor(page)) toc.remove(new TocApi.EntryId(entry.id()));
        clearPage(page);
        if (!pages.purge(new PageApi.PageId(page), retention))
            throw new IllegalStateException("purge candidate is no longer expired");
        retireTargets(tenant, null, Set.of(page));
        objects.forEach(reservations::protect);
        operations.deleted(tenant, "page", page, null, objects, Set.of());
        return true;
    }

    private void clearPage(UUID page) {
        revisions.prune(new RevisionApi.ItemId(page), 0);
        var item = new TagApi.ItemId(page);
        for (String label : tags.labelsOf(item)) {
            if (!(tags.untag(item, label) instanceof TagApi.UntagResult.Untagged)) {
                throw new IllegalStateException("stored tag rejected during termination");
            }
        }
        permissions.clearResource(TenantAccess.page(page));
        spaces.unplace(page);
    }

    private void retireTargets(UUID tenant, UUID space, Set<UUID> pages) {
        for (var site : sites.listByTenant(tenant)) retireSite(site.id(), space, pages);
    }

    private void retireSite(UUID site, UUID space, Set<UUID> pages) {
        String cursor = null;
        do {
            var batch = redirects.list(new RedirectApi.ScopeId(site), Optional.empty(), cursor, 100);
            for (var rule : batch.items()) {
                if (pages == null
                        || (rule.targetType() == RedirectApi.TargetType.SPACE
                                && rule.targetId().equals(space))
                        || (rule.targetType() == RedirectApi.TargetType.PAGE && pages.contains(rule.targetId())))
                    redirects.retire(new RedirectApi.ScopeId(site), rule.path());
            }
            cursor = batch.nextCursor();
        } while (cursor != null);
    }

    private static void confirm(String current, String supplied) {
        if (supplied == null || !current.equals(supplied.strip())) throw new TerminationErrors.Confirmation();
    }
}

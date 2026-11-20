package io.space.control.compositions.hosting.customdomain;

import io.space.concepts.customdomain.api.CustomDomainApi;
import io.space.concepts.site.api.SiteApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.InvalidCursorException;
import io.space.control.compositions.hosting.site.SiteAccess;
import io.space.control.compositions.principal.PrincipalResolver.Resolution;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * 租户级域名索引：站点先经 Permission.filter(read) 收窄，再由 CustomDomain 概念按 host 分页。
 * 行内只给状态与写能力；TXT challenge 仍走站点级详情，写动作仍走站点级端点。
 */
@Component
class TenantDomainListing {
    private final SiteApi sites;
    private final CustomDomainApi domains;
    private final SiteAccess access;
    private final TenantAccess tenants;

    TenantDomainListing(SiteApi sites, CustomDomainApi domains, SiteAccess access, TenantAccess tenants) {
        this.sites = sites;
        this.domains = domains;
        this.access = access;
        this.tenants = tenants;
    }

    CustomDomainTypes.TenantDomainPage page(
            Resolution resolution, UUID tenant, Optional<UUID> site, String cursor, int limit) {
        if (limit < 1 || limit > 100) throw new InvalidCursorException();
        List<SiteApi.View> candidates = tenants.inTenant(tenant, () -> sites.listByTenant(tenant));
        Set<UUID> readable = access.readable(
                resolution, tenant, candidates.stream().map(SiteApi.View::id).collect(Collectors.toSet()));
        Map<UUID, SiteApi.View> visible = candidates.stream()
                .filter(item -> readable.contains(item.id()))
                .collect(Collectors.toMap(SiteApi.View::id, Function.identity()));
        Map<UUID, Boolean> administered = visible.keySet().stream()
                .collect(Collectors.toMap(Function.identity(), id -> access.administers(resolution, tenant, id)));
        List<CustomDomainTypes.DomainSiteChoice> choices = visible.values().stream()
                .sorted(Comparator.comparing(SiteApi.View::name).thenComparing(SiteApi.View::id))
                .map(item -> new CustomDomainTypes.DomainSiteChoice(
                        item.id(),
                        item.name(),
                        administered.get(item.id()) ? Set.of(CustomDomainTypes.DomainAction.BIND) : Set.of()))
                .toList();
        Set<UUID> targets = visible.keySet().stream()
                .filter(id -> site.map(id::equals).orElse(true))
                .collect(Collectors.toUnmodifiableSet());
        final CustomDomainApi.Page page;
        try {
            page = tenants.inTenant(tenant, () -> domains.page(targets, cursor, limit));
        } catch (IllegalArgumentException invalid) {
            throw new InvalidCursorException();
        }
        List<CustomDomainTypes.TenantDomainSummary> items = page.items().stream()
                .map(view -> summary(view, visible.get(view.target()), administered.get(view.target())))
                .toList();
        return new CustomDomainTypes.TenantDomainPage(items, page.nextCursor(), null, choices);
    }

    private static CustomDomainTypes.TenantDomainSummary summary(
            CustomDomainApi.View view, SiteApi.View site, boolean administered) {
        return new CustomDomainTypes.TenantDomainSummary(
                view.host(),
                view.verified(),
                view.isPrimary(),
                view.createdAt(),
                site.id(),
                site.name(),
                administered ? Set.of(CustomDomainTypes.DomainAction.UPDATE) : Set.of());
    }
}

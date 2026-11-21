package io.edition.control.compositions.hosting.reorganization;

import io.edition.concepts.page.api.PageApi;
import io.edition.concepts.redirect.api.RedirectApi;
import io.edition.concepts.site.api.SiteApi;
import io.edition.concepts.space.api.SpaceApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.resource.PageNotFoundException;
import io.edition.control.compositions.resource.ResourceChain;
import io.edition.control.compositions.resource.ResourceWriteLocks;
import io.edition.control.compositions.resource.SpaceNotFoundException;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;

/** 重定向目标的归属、写锁与当前地址投影；始终以稳定 id 寻址。 */
@Component
final class RedirectTargets {
    private final SiteApi sites;
    private final SpaceApi spaces;
    private final PageApi pages;
    private final ResourceChain resources;
    private final TenantAccess tenants;
    private final ResourceWriteLocks locks;

    RedirectTargets(
            SiteApi sites,
            SpaceApi spaces,
            PageApi pages,
            ResourceChain resources,
            TenantAccess tenants,
            ResourceWriteLocks locks) {
        this.locks = locks;
        this.sites = sites;
        this.spaces = spaces;
        this.pages = pages;
        this.resources = resources;
        this.tenants = tenants;
    }

    ReorganizationTypes.RedirectView redirectView(SiteApi.View site, RedirectApi.Rule rule) {
        CurrentTarget current = currentTarget(site, rule).orElse(null);
        return new ReorganizationTypes.RedirectView(
                rule.path(),
                rule.targetId(),
                rule.targetType().stored(),
                rule.origin().stored(),
                rule.createdAt(),
                null,
                current == null ? null : current.path(),
                current == null ? null : current.label(),
                current != null);
    }

    SiteApi.View lockTarget(UUID tenant, UUID site, RedirectApi.TargetType type, UUID target) {
        // 先锁内容，再锁站点，与移动、挂载流程保持一致的锁顺序。
        try {
            if (type == RedirectApi.TargetType.SPACE) {
                locks.space(tenant, target);
            } else {
                var owner = tenants.inTenant(tenant, () -> spaces.spaceOf(target))
                        .orElseThrow(ReorganizationTypes.RedirectTargetNotFoundException::new);
                locks.page(tenant, owner.value(), target);
            }
        } catch (SpaceNotFoundException | PageNotFoundException missing) {
            throw new ReorganizationTypes.RedirectTargetNotFoundException();
        }
        var current = locks.site(tenant, site);
        requireTarget(tenant, current, type, target);
        return current;
    }

    void requireTarget(UUID tenant, SiteApi.View site, RedirectApi.TargetType type, UUID target) {
        boolean found;
        if (type == RedirectApi.TargetType.SPACE) {
            found = resources.space(tenant, target).isPresent()
                    && sites.slugOf(new SiteApi.SiteId(site.id()), target).isPresent();
        } else {
            Optional<SpaceApi.SpaceId> owner = tenants.inTenant(tenant, () -> spaces.spaceOf(target));
            found = owner.isPresent()
                    && resources.space(tenant, owner.orElseThrow().value()).isPresent()
                    && sites.slugOf(
                                    new SiteApi.SiteId(site.id()),
                                    owner.orElseThrow().value())
                            .isPresent()
                    && tenants.inTenant(
                            tenant,
                            () -> pages.view(new PageApi.PageId(target))
                                    .filter(page -> page.trashedAt() == null)
                                    .isPresent());
        }
        if (!found) throw new ReorganizationTypes.RedirectTargetNotFoundException();
    }

    private Optional<CurrentTarget> currentTarget(SiteApi.View site, RedirectApi.Rule rule) {
        if (rule.targetType() == RedirectApi.TargetType.SPACE) {
            return sites.slugOf(new SiteApi.SiteId(site.id()), rule.targetId())
                    .flatMap(slug -> spaces.view(new SpaceApi.SpaceId(rule.targetId()))
                            .map(space -> new CurrentTarget("/" + slug, space.name())));
        }
        Optional<SpaceApi.SpaceId> space = spaces.spaceOf(rule.targetId());
        if (space.isEmpty()) return Optional.empty();
        Optional<String> spaceSlug =
                sites.slugOf(new SiteApi.SiteId(site.id()), space.orElseThrow().value());
        Optional<SpaceApi.Placement> placement =
                spaces.placementsOf(java.util.Set.of(rule.targetId())).stream().findFirst();
        Optional<PageApi.View> page =
                pages.view(new PageApi.PageId(rule.targetId())).filter(value -> value.trashedAt() == null);
        if (spaceSlug.isEmpty() || placement.isEmpty() || page.isEmpty()) return Optional.empty();
        return Optional.of(new CurrentTarget(
                "/" + spaceSlug.orElseThrow() + "/" + placement.orElseThrow().slug(),
                page.orElseThrow().title()));
    }

    private record CurrentTarget(String path, String label) {}
}

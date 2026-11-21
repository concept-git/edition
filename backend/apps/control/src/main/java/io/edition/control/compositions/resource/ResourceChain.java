package io.edition.control.compositions.resource;

import io.edition.concepts.collection.api.CollectionApi;
import io.edition.concepts.page.api.PageApi;
import io.edition.concepts.site.api.SiteApi;
import io.edition.concepts.space.api.SpaceApi;
import io.edition.control.compositions.access.TenantAccess;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Component;

/**
 * 真实资源链核对：space 属于该 tenant、page 挂在该 space 且带 slug、
 * collection 属于该 tenant、site 属于该 tenant。已回收页（{@code trashedAt} 非空）仍答 found，
 * 否则删除 flow 无法还原；工作集 404 由各创作 flow 自己映射。
 *
 * <p>只答 found 与否，不抛 flow 异常。Token 路径 miss → 400 {@code tenant_space_mismatch}、
 * Page 路径 miss → 404 {@code page_not_found}、Collection 路径 miss → 404
 * {@code collection_not_found}、Site 路径 miss → 404 {@code site_not_found} 由各 flow 自己映射。
 */
@Component
public final class ResourceChain {
    private final SpaceApi spaces;
    private final PageApi pages;
    private final CollectionApi collections;
    private final SiteApi sites;
    private final TenantAccess tenants;

    public ResourceChain(
            SpaceApi spaces, PageApi pages, CollectionApi collections, SiteApi sites, TenantAccess tenants) {
        this.spaces = spaces;
        this.pages = pages;
        this.collections = collections;
        this.sites = sites;
        this.tenants = tenants;
    }

    public Optional<UUID> collection(UUID tenant, UUID collection) {
        return tenants.inTenant(
                tenant,
                () -> collections
                        .tenantOf(new CollectionApi.CollectionId(collection))
                        .filter(tenant::equals)
                        .map(ignored -> collection));
    }

    public Optional<SpaceApi.View> space(UUID tenant, UUID space) {
        return tenants.inTenant(
                tenant,
                () -> spaces.view(new SpaceApi.SpaceId(space))
                        .filter(value -> value.tenantId().equals(tenant)));
    }

    public Optional<LocatedPage> page(UUID tenant, UUID space, UUID page) {
        return tenants.inTenant(tenant, () -> {
            Optional<SpaceApi.View> owner = spaces.view(new SpaceApi.SpaceId(space))
                    .filter(value -> value.tenantId().equals(tenant));
            if (owner.isEmpty()) return Optional.empty();
            boolean belongs = spaces.spaceOf(page)
                    .map(SpaceApi.SpaceId::value)
                    .filter(space::equals)
                    .isPresent();
            if (!belongs) return Optional.empty();
            Optional<PageApi.View> view = pages.view(new PageApi.PageId(page));
            if (view.isEmpty()) return Optional.empty();
            return spaces.placementsOf(Set.of(page)).stream()
                    .filter(placement -> placement.space().value().equals(space))
                    .findFirst()
                    .map(placement -> new LocatedPage(owner.get(), view.get(), placement.slug()));
        });
    }

    public Optional<SiteApi.View> site(UUID tenant, UUID site) {
        return tenants.inTenant(
                tenant,
                () -> sites.view(new SiteApi.SiteId(site))
                        .filter(value -> value.tenantId().equals(tenant)));
    }

    public record LocatedPage(SpaceApi.View space, PageApi.View page, String slug) {}
}

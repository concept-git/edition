package io.edition.control.compositions.releases.release;

import io.edition.concepts.release.api.ReleaseApi;
import io.edition.concepts.space.api.SpaceApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.InvalidCursorException;
import io.edition.control.compositions.principal.PrincipalResolver.Resolution;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * 租户级发版索引：先把本租户空间收窄为调用者可读的集合，再由 Release 概念按
 * (createdAt desc, id desc) 做数据库键集分页。空间上下文随行返回，供跨空间列表钻入详情。
 */
@Component
class TenantReleaseListing {
    private final SpaceApi spaces;
    private final ReleaseApi releases;
    private final ReleaseAccess access;
    private final ReleaseProjection projection;
    private final TenantAccess tenants;

    TenantReleaseListing(
            SpaceApi spaces,
            ReleaseApi releases,
            ReleaseAccess access,
            ReleaseProjection projection,
            TenantAccess tenants) {
        this.spaces = spaces;
        this.releases = releases;
        this.access = access;
        this.projection = projection;
        this.tenants = tenants;
    }

    ReleaseTypes.TenantReleasePage page(
            Resolution resolution, UUID tenant, ReleaseTypes.TenantReleaseFilter filter, String cursor, int limit) {
        if (limit < 1 || limit > 100) throw new InvalidCursorException();
        List<SpaceApi.View> candidates = tenants.inTenant(tenant, () -> spaces.listByTenant(tenant));
        Set<UUID> readable = access.readable(
                resolution, tenant, candidates.stream().map(SpaceApi.View::id).collect(Collectors.toSet()));
        Map<UUID, SpaceApi.View> visible = candidates.stream()
                .filter(space -> readable.contains(space.id()))
                .collect(Collectors.toMap(SpaceApi.View::id, Function.identity()));
        List<ReleaseTypes.ReleaseSpaceChoice> choices = visible.values().stream()
                .sorted(Comparator.comparing(SpaceApi.View::name).thenComparing(SpaceApi.View::id))
                .map(space -> new ReleaseTypes.ReleaseSpaceChoice(
                        space.id(), space.name(), stored(space.mode()), stored(space.status())))
                .toList();
        Set<ReleaseApi.ScopeId> scopes = visible.values().stream()
                .filter(space -> filter.space().map(space.id()::equals).orElse(true))
                .filter(space -> filter.mode().map(space.mode()::equals).orElse(true))
                .map(space -> new ReleaseApi.ScopeId(space.id()))
                .collect(Collectors.toUnmodifiableSet());
        final ReleaseApi.Page page;
        try {
            page = tenants.inTenant(tenant, () -> releases.page(scopes, filter.status(), cursor, limit));
        } catch (IllegalArgumentException invalid) {
            throw new InvalidCursorException();
        }
        List<ReleaseTypes.TenantReleaseSummary> items = tenants.inTenant(
                tenant,
                () -> page.items().stream()
                        .map(release -> summary(release, visible.get(release.scopeId()), resolution, tenant))
                        .toList());
        return new ReleaseTypes.TenantReleasePage(items, page.nextCursor(), null, choices);
    }

    private ReleaseTypes.TenantReleaseSummary summary(
            ReleaseApi.View release, SpaceApi.View space, Resolution resolution, UUID tenant) {
        ReleaseTypes.ReleaseSummary base = projection.summary(release, resolution, tenant, space);
        return new ReleaseTypes.TenantReleaseSummary(
                base.id(),
                base.label(),
                base.status(),
                base.source(),
                base.pageCount(),
                base.createdAt(),
                base.promotedAt(),
                base.allowedActions(),
                space.id(),
                space.name(),
                stored(space.mode()),
                stored(space.status()));
    }

    private static String stored(Enum<?> value) {
        return value.name().toLowerCase(Locale.ROOT);
    }

    static Optional<ReleaseApi.Status> status(String value) {
        return value == null || value.isBlank()
                ? Optional.empty()
                : Optional.of(ReleaseApi.Status.valueOf(value.toUpperCase(Locale.ROOT)));
    }

    static Optional<SpaceApi.Mode> mode(String value) {
        return value == null || value.isBlank()
                ? Optional.empty()
                : Optional.of(SpaceApi.Mode.valueOf(value.toUpperCase(Locale.ROOT)));
    }
}

package io.edition.control.compositions.authoring.permission;

import io.edition.concepts.membership.api.MembershipApi;
import io.edition.concepts.page.api.PageApi;
import io.edition.concepts.permission.api.PermissionApi;
import io.edition.concepts.space.api.SpaceApi;
import io.edition.concepts.team.api.TeamApi;
import io.edition.concepts.user.api.UserApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.InvalidCursorException;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/** 需要持续扫描候选页的管理投影查询，避免把循环与过滤细节塞进 *Syncs。 */
@Component
class PermissionQueries {
    private final UserApi users;
    private final TeamApi teams;
    private final MembershipApi memberships;
    private final PageApi pages;
    private final SpaceApi spaces;
    private final PermissionApi permissions;
    private final TenantAccess tenants;
    private final PermissionProjection projection;

    PermissionQueries(
            UserApi users,
            TeamApi teams,
            MembershipApi memberships,
            PageApi pages,
            SpaceApi spaces,
            PermissionApi permissions,
            TenantAccess tenants,
            PermissionProjection projection) {
        this.users = users;
        this.teams = teams;
        this.memberships = memberships;
        this.pages = pages;
        this.spaces = spaces;
        this.permissions = permissions;
        this.tenants = tenants;
        this.projection = projection;
    }

    PermissionTypes.PrincipalPage users(UUID tenant, String query, String cursor, int limit) {
        requireQuery(query);
        var visible = new ArrayList<PermissionTypes.PrincipalView>(limit);
        String scanCursor = cursor;
        String nextCursor = null;
        while (visible.size() < limit) {
            UserApi.SearchPage page;
            try {
                page = users.search(query, scanCursor, limit - visible.size());
            } catch (IllegalArgumentException invalid) {
                throw new InvalidCursorException();
            }
            var tenantMembers = tenants.inTenant(
                    tenant,
                    () -> page.users().stream()
                            .filter(user -> user.status() == UserApi.Status.ACTIVE)
                            .filter(user -> memberships.isMember(
                                    MembershipApi.Group.tenant(tenant),
                                    new MembershipApi.MemberId(user.id().value())))
                            .map(projection::user)
                            .toList());
            visible.addAll(tenantMembers);
            nextCursor = page.nextCursor();
            if (nextCursor == null || visible.size() >= limit) {
                break;
            }
            scanCursor = nextCursor;
        }
        return new PermissionTypes.PrincipalPage(visible, nextCursor);
    }

    PermissionTypes.PrincipalPage teams(UUID tenant, String query, String cursor, int limit) {
        requireQuery(query);
        String needle = normalizeSearchText(query);
        var visible = new ArrayList<PermissionTypes.PrincipalView>(limit);
        String scanCursor = cursor;
        String nextCursor = null;
        while (visible.size() < limit) {
            TeamApi.Page page;
            try {
                String pageCursor = scanCursor;
                page = tenants.inTenant(tenant, () -> teams.list(tenant, pageCursor, limit - visible.size()));
            } catch (IllegalArgumentException invalid) {
                throw new InvalidCursorException();
            }
            page.teams().stream()
                    .filter(team -> normalizeSearchText(team.name()).contains(needle))
                    .map(team -> projection.team(tenant, team))
                    .forEach(visible::add);
            nextCursor = page.nextCursor();
            if (nextCursor == null || visible.size() >= limit) {
                break;
            }
            scanCursor = nextCursor;
        }
        return new PermissionTypes.PrincipalPage(visible, nextCursor);
    }

    PermissionTypes.PermissionPage pages(
            UUID tenant, PermissionAccess.Authorized authorized, String cursor, int limit) {
        var visible = new ArrayList<PermissionTypes.PagePermissionSummary>(limit);
        String scanCursor = cursor;
        String nextCursor = null;
        while (visible.size() < limit) {
            PageApi.Slice page;
            try {
                String pageCursor = scanCursor;
                page = tenants.inTenant(tenant, () -> pages.pageAll(pageCursor, limit - visible.size()));
            } catch (IllegalArgumentException invalid) {
                throw new InvalidCursorException();
            }
            Set<UUID> candidateIds =
                    page.items().stream().map(PageApi.View::id).collect(Collectors.toUnmodifiableSet());
            Map<UUID, SpaceApi.Placement> placements =
                    tenants.inTenant(tenant, () -> spaces.placementsOf(candidateIds)).stream()
                            .filter(placement -> placement
                                    .space()
                                    .value()
                                    .equals(authorized.space().id()))
                            .collect(Collectors.toUnmodifiableMap(SpaceApi.Placement::item, Function.identity()));
            List<PageApi.View> scopedPages = page.items().stream()
                    .filter(item -> placements.containsKey(item.id()))
                    .toList();
            Set<PermissionApi.Resource> resources = scopedPages.stream()
                    .map(item -> TenantAccess.page(item.id()))
                    .collect(Collectors.toUnmodifiableSet());
            Map<PermissionApi.Resource, PermissionApi.RestrictionView> restrictions = resources.isEmpty()
                    ? Map.of()
                    : tenants.inTenant(tenant, () -> permissions.restrictions(resources));
            scopedPages.stream()
                    .map(item -> projection.page(
                            item,
                            placements.get(item.id()).slug(),
                            authorized.space(),
                            restrictions.getOrDefault(
                                    TenantAccess.page(item.id()), PermissionApi.RestrictionView.inactive(0)),
                            authorized.actor()))
                    .forEach(visible::add);
            nextCursor = page.nextCursor();
            if (nextCursor == null || visible.size() >= limit) {
                break;
            }
            scanCursor = nextCursor;
        }
        return new PermissionTypes.PermissionPage(visible, nextCursor);
    }

    private static void requireQuery(String query) {
        if (query == null
                || normalizeSearchText(query)
                                .codePointCount(0, normalizeSearchText(query).length())
                        < 2) {
            throw new PermissionInputInvalidException("q", "min_length");
        }
    }

    private static String normalizeSearchText(String value) {
        return Normalizer.normalize(value.strip(), Normalizer.Form.NFKC).toLowerCase(Locale.ROOT);
    }
}

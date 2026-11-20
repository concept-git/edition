package io.space.control.compositions.authoring.permission;

import io.space.concepts.permission.api.PermissionApi;
import io.space.concepts.space.api.SpaceApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.resource.SpaceArchivedException;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Component;

/** Page restriction 的整集校验、归档单调性与 CAS 结果翻译。 */
@Component
class PermissionRestrictionRules {
    static final int MAX_PRINCIPALS = 100;
    private static final Comparator<PermissionApi.Principal> PRINCIPAL_ORDER = Comparator.comparingInt(
                    PermissionRestrictionRules::typeOrder)
            .thenComparing(
                    principal -> principal.id() == null ? "" : principal.id().toString());

    private final PermissionApi permissions;
    private final PermissionAccess access;
    private final TenantAccess tenants;

    PermissionRestrictionRules(PermissionApi permissions, PermissionAccess access, TenantAccess tenants) {
        this.permissions = permissions;
        this.access = access;
        this.tenants = tenants;
    }

    PermissionApi.RestrictionView view(UUID tenant, UUID page) {
        return tenants.inTenant(tenant, () -> permissions.restriction(TenantAccess.page(page)));
    }

    PermissionApi.RestrictionView replace(
            UUID tenant, SpaceApi.View space, UUID page, List<String> principalKeys, long expectedRevision) {
        if (principalKeys.size() > MAX_PRINCIPALS) {
            throw new PermissionRestrictionTooLargeException();
        }
        PermissionApi.RestrictionView current = view(tenant, page);
        Set<PermissionApi.Principal> desired = principals(tenant, current, principalKeys);
        if (space.status() == SpaceApi.Status.ARCHIVED
                && current.active()
                && !current.principals().containsAll(desired)) {
            throw new SpaceArchivedException();
        }
        PermissionApi.RestrictResult result = tenants.inTenant(
                tenant, () -> permissions.restrict(TenantAccess.page(page), desired, expectedRevision));
        return switch (result) {
            case PermissionApi.RestrictResult.Restricted restricted -> restricted.restriction();
            case PermissionApi.RestrictResult.Conflict conflict ->
                throw new PermissionVersionConflictException(conflict.current());
        };
    }

    PermissionApi.RestrictionView remove(UUID tenant, SpaceApi.View space, UUID page, long expectedRevision) {
        if (space.status() == SpaceApi.Status.ARCHIVED) {
            throw new SpaceArchivedException();
        }
        PermissionApi.UnrestrictResult result =
                tenants.inTenant(tenant, () -> permissions.unrestrict(TenantAccess.page(page), expectedRevision));
        return switch (result) {
            case PermissionApi.UnrestrictResult.Unrestricted unrestricted -> unrestricted.restriction();
            case PermissionApi.UnrestrictResult.Conflict conflict ->
                throw new PermissionVersionConflictException(conflict.current());
        };
    }

    private Set<PermissionApi.Principal> principals(
            UUID tenant, PermissionApi.RestrictionView current, List<String> keys) {
        List<PermissionApi.Principal> desired = keys.stream()
                .map(PermissionPrincipalKey::parse)
                .distinct()
                .sorted(PRINCIPAL_ORDER)
                .toList();
        List<PermissionApi.Principal> additions = desired.stream()
                .filter(principal -> !current.principals().contains(principal))
                .toList();
        if (additions.stream()
                .anyMatch(principal -> principal.type() == PermissionApi.PrincipalType.TOKEN
                        || principal.type() == PermissionApi.PrincipalType.ANONYMOUS)) {
            throw new PermissionPrincipalTypeUnsupportedException();
        }

        // 与 Tenant member removal 共用全局锁序：全部 User membership → 全部 Team，组内按稳定 id。
        additions.stream()
                .filter(principal -> principal.type() == PermissionApi.PrincipalType.USER)
                .forEach(principal -> access.mutablePrincipal(tenant, PermissionPrincipalKey.format(principal), true));
        additions.stream()
                .filter(principal -> principal.type() == PermissionApi.PrincipalType.TEAM)
                .forEach(principal -> access.mutablePrincipal(tenant, PermissionPrincipalKey.format(principal), true));
        return Collections.unmodifiableSet(new LinkedHashSet<>(desired));
    }

    private static int typeOrder(PermissionApi.Principal principal) {
        return switch (principal.type()) {
            case USER -> 0;
            case TEAM -> 1;
            case TOKEN -> 2;
            case ANONYMOUS -> 3;
        };
    }
}

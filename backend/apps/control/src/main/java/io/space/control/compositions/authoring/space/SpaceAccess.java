package io.space.control.compositions.authoring.space;

import io.space.concepts.permission.api.PermissionApi.Operation;
import io.space.concepts.permission.api.PermissionApi.PrincipalType;
import io.space.concepts.permission.api.PermissionApi.Resource;
import io.space.concepts.space.api.SpaceApi;
import io.space.control.compositions.access.PermissionDeniedException;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.principal.PrincipalResolver.Resolution;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * Space flow 的访问投影：在 {@link TenantAccess} 的租户准入之上计算 allowedActions。
 * 调用方先经 {@link io.space.control.compositions.ResourceChain} 解析出本租户 Space。
 */
@Component
class SpaceAccess {

    private final TenantAccess tenants;

    SpaceAccess(TenantAccess tenants) {
        this.tenants = tenants;
    }

    /** 创建空间：自然人成员 + 租户根 admin。 */
    Resolution requireTenantAdmin(String credential, UUID tenant) {
        return tenants.requireUser(credential, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN);
    }

    /** 已定位 Space 上的 [tenant, space] 判定。 */
    Resolution require(String credential, UUID tenant, SpaceApi.View space, Operation operation) {
        return tenants.require(credential, tenant, chain(tenant, space.id()), operation);
    }

    Resolution requireListAccess(String credential, UUID tenant) {
        return tenants.admit(credential, tenant);
    }

    Set<UUID> readable(Resolution resolution, UUID tenant, Set<UUID> spaces) {
        Set<List<Resource>> chains =
                spaces.stream().map(space -> chain(tenant, space)).collect(Collectors.toUnmodifiableSet());
        return tenants.filter(resolution, tenant, chains, TenantAccess.READ).stream()
                .map(List::getLast)
                .map(Resource::id)
                .collect(Collectors.toUnmodifiableSet());
    }

    Set<SpaceTypes.Action> allowedActions(Resolution resolution, UUID tenant, SpaceApi.View space, boolean hasLive) {
        var chain = chain(tenant, space.id());
        if (!tenants.allows(resolution, tenant, chain, TenantAccess.READ)) return Set.of();
        var actions = new LinkedHashSet<SpaceTypes.Action>();
        actions.add(SpaceTypes.Action.READ);
        if (space.status() == SpaceApi.Status.ACTIVE
                && space.mode() == SpaceApi.Mode.AUTHORED
                && resolution.principal().type() == PrincipalType.USER
                && tenants.allows(resolution, tenant, chain, TenantAccess.WRITE)) {
            actions.add(SpaceTypes.Action.WRITE_PAGES);
        }
        boolean spaceAdmin = tenants.allows(resolution, tenant, chain, TenantAccess.ADMIN);
        boolean tenantAdmin =
                tenants.allows(resolution, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN);
        if (spaceAdmin || tenantAdmin) {
            actions.add(SpaceTypes.Action.MANAGE_PERMISSIONS);
        }
        if (spaceAdmin) {
            if (resolution.principal().type() == PrincipalType.USER) actions.add(SpaceTypes.Action.DELETE);
            if (space.status() == SpaceApi.Status.ACTIVE) {
                actions.add(SpaceTypes.Action.UPDATE);
                actions.add(SpaceTypes.Action.ARCHIVE);
                if (space.mode() == SpaceApi.Mode.SYNCED || hasLive) {
                    actions.add(SpaceTypes.Action.CONVERT);
                }
            } else {
                actions.add(SpaceTypes.Action.RESTORE);
            }
        }
        return io.space.control.compositions.access.ManagementCapabilities.effective(resolution, actions, "content");
    }

    /** 只有自然人租户 admin 能创建空间：令牌绑定单一空间，无从创建。 */
    Set<SpaceTypes.Action> listActions(Resolution resolution, UUID tenant) {
        boolean admin = resolution.principal().type() == PrincipalType.USER
                && tenants.allows(resolution, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN);
        return admin && io.space.control.compositions.access.ManagementCapabilities.permits(resolution, "content:write")
                ? Set.of(SpaceTypes.Action.CREATE)
                : Set.of();
    }

    SpaceApi.ActorId actor(Resolution resolution) {
        if (resolution.principal().type() != PrincipalType.USER
                || resolution.principal().id() == null) {
            throw new PermissionDeniedException();
        }
        return new SpaceApi.ActorId(resolution.principal().id());
    }

    static List<Resource> chain(UUID tenant, UUID space) {
        return List.of(TenantAccess.tenant(tenant), TenantAccess.space(space));
    }
}

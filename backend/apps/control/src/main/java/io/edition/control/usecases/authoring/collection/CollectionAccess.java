package io.edition.control.usecases.authoring.collection;

import io.edition.control.modules.permission.api.PermissionApi.Resource;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.principal.PrincipalResolver.Resolution;
import io.edition.control.usecases.resource.ResourceChain;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * 分组 flow 的访问投影：GET 租户准入；写 [tenant]/admin。
 * Site 不进链。{@code edit} 仅租户根 admin。分组归属走 {@link ResourceChain}。
 */
@Component
class CollectionAccess {
    private final TenantAccess tenants;
    private final ResourceChain resources;

    CollectionAccess(TenantAccess tenants, ResourceChain resources) {
        this.tenants = tenants;
        this.resources = resources;
    }

    Resolution admit(String credential, UUID tenant) {
        return tenants.admit(credential, tenant);
    }

    Resolution requireAdmin(String credential, UUID tenant) {
        return tenants.require(credential, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN);
    }

    Set<UUID> readableSpaces(Resolution resolution, UUID tenant, Set<UUID> spaces) {
        if (spaces.isEmpty()) return Set.of();
        Set<List<Resource>> chains = spaces.stream()
                .map(space -> List.of(TenantAccess.tenant(tenant), TenantAccess.space(space)))
                .collect(Collectors.toUnmodifiableSet());
        return tenants.filter(resolution, tenant, chains, TenantAccess.READ).stream()
                .map(List::getLast)
                .map(Resource::id)
                .collect(Collectors.toUnmodifiableSet());
    }

    Set<CollectionTypes.Action> allowedActions(Resolution resolution, UUID tenant) {
        var actions = new LinkedHashSet<CollectionTypes.Action>();
        actions.add(CollectionTypes.Action.READ);
        if (tenants.allows(resolution, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN)) {
            actions.add(CollectionTypes.Action.EDIT);
        }
        return io.edition.control.usecases.access.ManagementCapabilities.effective(resolution, actions, "content");
    }

    boolean belongs(UUID tenant, UUID collectionId) {
        return resources.collection(tenant, collectionId).isPresent();
    }
}

package io.edition.control.usecases.authoring.tagging;

import io.edition.control.modules.permission.api.PermissionApi.Operation;
import io.edition.control.modules.permission.api.PermissionApi.Resource;
import io.edition.control.modules.space.api.SpaceApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.authoring.pageediting.PageEditingTypes;
import io.edition.control.usecases.principal.PrincipalResolver.Resolution;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * 标签 flow 的访问投影：打标/摘除按 [tenant, space, page]；改名按 [tenant] / admin；
 * 目录列表先 admit 再按页 filter read。Site 不进链。
 */
@Component
class TagAccess {
    private final TenantAccess tenants;

    TagAccess(TenantAccess tenants) {
        this.tenants = tenants;
    }

    Resolution require(String credential, UUID tenant, UUID space, UUID page, Operation operation) {
        return tenants.require(credential, tenant, pageChain(tenant, space, page), operation);
    }

    Resolution requireAdmin(String credential, UUID tenant) {
        return tenants.require(credential, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN);
    }

    Resolution admit(String credential, UUID tenant) {
        return tenants.admit(credential, tenant);
    }

    Set<UUID> readable(Resolution resolution, UUID tenant, Set<List<Resource>> chains) {
        return tenants.filter(resolution, tenant, chains, TenantAccess.READ).stream()
                .map(List::getLast)
                .map(Resource::id)
                .collect(Collectors.toUnmodifiableSet());
    }

    Set<TaggingTypes.Action> catalogActions(Resolution resolution, UUID tenant) {
        var actions = new LinkedHashSet<TaggingTypes.Action>();
        actions.add(TaggingTypes.Action.READ);
        if (tenants.allows(resolution, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN)) {
            actions.add(TaggingTypes.Action.RENAME);
        }
        return io.edition.control.usecases.access.ManagementCapabilities.effective(resolution, actions, "content");
    }

    Set<PageEditingTypes.Action> pageActions(Resolution resolution, UUID tenant, SpaceApi.View space, UUID page) {
        var chain = pageChain(tenant, space.id(), page);
        if (!tenants.allows(resolution, tenant, chain, TenantAccess.READ)) return Set.of();
        var actions = new LinkedHashSet<PageEditingTypes.Action>();
        actions.add(PageEditingTypes.Action.READ);
        boolean writable = space.status() == SpaceApi.Status.ACTIVE
                && space.mode() == SpaceApi.Mode.AUTHORED
                && tenants.allows(resolution, tenant, chain, TenantAccess.WRITE);
        if (writable) {
            actions.add(PageEditingTypes.Action.RENAME);
            actions.add(PageEditingTypes.Action.EDIT);
            actions.add(PageEditingTypes.Action.REVERT);
        }
        return io.edition.control.usecases.access.ManagementCapabilities.effective(resolution, actions, "content");
    }

    static List<Resource> pageChain(UUID tenant, UUID space, UUID page) {
        return List.of(TenantAccess.tenant(tenant), TenantAccess.space(space), TenantAccess.page(page));
    }
}

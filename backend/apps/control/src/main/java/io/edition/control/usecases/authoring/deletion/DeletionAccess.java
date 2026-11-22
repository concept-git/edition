package io.edition.control.usecases.authoring.deletion;

import io.edition.control.modules.page.api.PageApi;
import io.edition.control.modules.space.api.SpaceApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.authoring.pageediting.PageAccess;
import io.edition.control.usecases.authoring.pageediting.PageEditingTypes;
import io.edition.control.usecases.principal.PrincipalResolver.Resolution;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Component;

/**
 * 回收 flow 的访问投影：写 [tenant, space, page]；列表 [tenant, space] / read。
 * {@code edit} 闸门还原控件，不新增动词。
 */
@Component
class DeletionAccess {
    private final TenantAccess tenants;
    private final PageAccess pages;

    DeletionAccess(TenantAccess tenants, PageAccess pages) {
        this.tenants = tenants;
        this.pages = pages;
    }

    Resolution requireWrite(String credential, UUID tenant, UUID space, UUID page) {
        return pages.require(credential, tenant, space, page, TenantAccess.WRITE);
    }

    Resolution requireList(String credential, UUID tenant, UUID space) {
        return pages.requireSpace(credential, tenant, space, TenantAccess.READ);
    }

    Set<UUID> readable(Resolution resolution, UUID tenant, UUID space, Set<UUID> pageIds) {
        return pages.readable(resolution, tenant, space, pageIds);
    }

    Set<DeletionTypes.Action> listActions(Resolution resolution, UUID tenant, SpaceApi.View space) {
        var chain = PageAccess.chain(tenant, space.id(), null);
        if (!tenants.allows(resolution, tenant, chain, TenantAccess.READ)) return Set.of();
        var actions = new LinkedHashSet<DeletionTypes.Action>();
        actions.add(DeletionTypes.Action.READ);
        boolean writable = space.status() == SpaceApi.Status.ACTIVE
                && space.mode() == SpaceApi.Mode.AUTHORED
                && tenants.allows(resolution, tenant, chain, TenantAccess.WRITE);
        if (writable) actions.add(DeletionTypes.Action.EDIT);
        return io.edition.control.usecases.access.ManagementCapabilities.effective(resolution, actions, "content");
    }

    Set<DeletionTypes.Action> itemActions(Resolution resolution, UUID tenant, SpaceApi.View space, PageApi.View page) {
        Set<PageEditingTypes.Action> source = pages.allowedActions(resolution, tenant, space, page);
        var actions = new LinkedHashSet<DeletionTypes.Action>();
        if (source.contains(PageEditingTypes.Action.READ)) actions.add(DeletionTypes.Action.READ);
        if (source.contains(PageEditingTypes.Action.EDIT)) actions.add(DeletionTypes.Action.EDIT);
        return io.edition.control.usecases.access.ManagementCapabilities.effective(resolution, actions, "content");
    }
}

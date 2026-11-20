package io.space.control.compositions.authoring.tocediting;

import io.space.concepts.permission.api.PermissionApi.Operation;
import io.space.concepts.permission.api.PermissionApi.Resource;
import io.space.concepts.space.api.SpaceApi;
import io.space.concepts.toc.api.TocApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.principal.PrincipalResolver.Resolution;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Component;

/**
 * 目录 flow 的访问投影：在 {@link TenantAccess} 的租户准入之上，按 [tenant, space] 链判定。
 * Site 不进链；write 投影成 {@code edit}，且仅 authored+active 才给出。
 * 条目是否属于路径上的 Space 由本包判定（组合根只核 space/page 挂载）。
 */
@Component
class TocAccess {
    private final TenantAccess tenants;
    private final TocApi toc;

    TocAccess(TenantAccess tenants, TocApi toc) {
        this.tenants = tenants;
        this.toc = toc;
    }

    /** 路径 space 与条目错配对外一律 toc_entry_not_found，不泄露外空间树。 */
    boolean entryBelongs(UUID tenant, UUID space, UUID entryId) {
        return tenants.inTenant(
                tenant, () -> toc.tree(new TocApi.TocId(space)).stream().anyMatch(node -> contains(node, entryId)));
    }

    private static boolean contains(TocApi.View node, UUID entryId) {
        if (node.id().equals(entryId)) return true;
        return node.children().stream().anyMatch(child -> contains(child, entryId));
    }

    Resolution require(String credential, UUID tenant, UUID space, Operation operation) {
        return tenants.require(credential, tenant, chain(tenant, space), operation);
    }

    /**
     * GET 与写回共用：有 read 才给 {@code read}；{@code edit} 还要求空间可写且主体有 write。
     * 前端只认 {@code edit} 渲染写控件，无则完全不出现添加入口。
     */
    Set<TocEditingTypes.Action> allowedActions(Resolution resolution, UUID tenant, SpaceApi.View space) {
        var chain = chain(tenant, space.id());
        if (!tenants.allows(resolution, tenant, chain, TenantAccess.READ)) return Set.of();
        var actions = new LinkedHashSet<TocEditingTypes.Action>();
        actions.add(TocEditingTypes.Action.READ);
        boolean writable = space.status() == SpaceApi.Status.ACTIVE
                && space.mode() == SpaceApi.Mode.AUTHORED
                && tenants.allows(resolution, tenant, chain, TenantAccess.WRITE);
        if (writable) actions.add(TocEditingTypes.Action.EDIT);
        return io.space.control.compositions.access.ManagementCapabilities.effective(resolution, actions, "content");
    }

    static List<Resource> chain(UUID tenant, UUID space) {
        return List.of(TenantAccess.tenant(tenant), TenantAccess.space(space));
    }
}

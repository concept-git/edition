package io.edition.control.usecases;

import io.edition.control.modules.space.api.SpaceApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.resource.PageNotFoundException;
import io.edition.control.usecases.resource.ResourceChain;
import io.edition.control.usecases.resource.ResourceWriteLocks;
import io.edition.control.usecases.resource.SpaceArchivedException;
import io.edition.control.usecases.resource.SpaceModeRestrictedException;
import java.util.UUID;
import org.springframework.stereotype.Component;

/**
 * authored 工作区可写：归档只读。synced 空间的整体导入/热修由各自 flow 另判 mode。
 * 归档判定优先于 mode。
 */
@Component
public final class AuthoringWrites {
    private final ResourceWriteLocks locks;
    private final TenantAccess tenants;

    public AuthoringWrites(ResourceWriteLocks locks, TenantAccess tenants) {
        this.locks = locks;
        this.tenants = tenants;
    }

    /** 首次工作区写在Space/Page锁内复核生命周期；仅正文编辑允许synced热修。 */
    public <T> T withWorkingWrite(
            UUID tenant,
            UUID space,
            UUID page,
            boolean allowHotfix,
            java.util.function.Function<ResourceChain.LocatedPage, T> work) {
        return tenants.inTenant(tenant, () -> {
            var current = locks.locatedPage(tenant, space, page);
            if (current.page().trashedAt() != null) throw new PageNotFoundException();
            if (allowHotfix) requireActive(current.space());
            else require(current.space());
            return work.apply(current);
        });
    }

    public <T> T withSpaceWrite(UUID tenant, UUID space, java.util.function.Function<SpaceApi.View, T> work) {
        return tenants.inTenant(tenant, () -> {
            var current = locks.space(tenant, space);
            require(current);
            return work.apply(current);
        });
    }

    /** 回收/恢复可读取已回收页，但空间归档和来源模式仍在锁内检查。 */
    public <T> T withLifecycleWrite(
            UUID tenant, UUID space, UUID page, java.util.function.Function<ResourceChain.LocatedPage, T> work) {
        return tenants.inTenant(tenant, () -> {
            var current = locks.locatedPage(tenant, space, page);
            require(current.space());
            return work.apply(current);
        });
    }

    public void require(SpaceApi.View space) {
        requireActive(space);
        if (space.mode() != SpaceApi.Mode.AUTHORED) throw new SpaceModeRestrictedException();
    }

    public void requireActive(SpaceApi.View space) {
        if (space.status() == SpaceApi.Status.ARCHIVED) throw new SpaceArchivedException();
    }
}

package io.edition.control.usecases.authoring.pageediting;

import io.edition.control.modules.page.api.PageApi;
import io.edition.control.modules.permission.api.PermissionApi.Operation;
import io.edition.control.modules.permission.api.PermissionApi.Resource;
import io.edition.control.modules.revision.api.RevisionApi;
import io.edition.control.modules.space.api.SpaceApi;
import io.edition.control.usecases.access.PermissionDeniedException;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.principal.PrincipalResolver.Resolution;
import io.edition.control.usecases.resource.PageNotFoundException;
import io.edition.control.usecases.resource.ResourceChain;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * 页面 flow 的访问投影：在 {@link TenantAccess} 的租户准入之上，按 [tenant, space, page] 链判定，
 * 并把主体翻译成 Page/Revision 概念各自的 Actor 类型。租户准入规则不在这里重复。
 */
@Component
public class PageAccess {

    private final TenantAccess tenants;
    private final ResourceChain resources;

    PageAccess(TenantAccess tenants, ResourceChain resources) {
        this.tenants = tenants;
        this.resources = resources;
    }

    /** 工作集页：归属链 miss 或已回收都是 404，不把回收入口泄漏到创作 flow。 */
    public ResourceChain.LocatedPage workingPage(UUID tenant, UUID space, UUID page) {
        var located = placedPage(tenant, space, page);
        if (located.page().trashedAt() != null) throw new PageNotFoundException();
        return located;
    }

    public ResourceChain.LocatedPage placedPage(UUID tenant, UUID space, UUID page) {
        return resources.page(tenant, space, page).orElseThrow(PageNotFoundException::new);
    }

    public Resolution require(String credential, UUID tenant, UUID space, UUID page, Operation operation) {
        return tenants.require(credential, tenant, chain(tenant, space, page), operation);
    }

    public Resolution requireSpace(String credential, UUID tenant, UUID space, Operation operation) {
        return tenants.require(credential, tenant, chain(tenant, space, null), operation);
    }

    public Resolution requireListAccess(String credential, UUID tenant) {
        return tenants.admit(credential, tenant);
    }

    public Set<UUID> readable(Resolution resolution, UUID tenant, UUID space, Set<UUID> pages) {
        Set<List<Resource>> chains =
                pages.stream().map(page -> chain(tenant, space, page)).collect(Collectors.toUnmodifiableSet());
        return tenants.filter(resolution, tenant, chains, TenantAccess.READ).stream()
                .map(List::getLast)
                .map(Resource::id)
                .collect(Collectors.toUnmodifiableSet());
    }

    public Set<PageEditingTypes.Action> allowedActions(
            Resolution resolution, UUID tenant, SpaceApi.View space, PageApi.View page) {
        var chain = chain(tenant, space.id(), page.id());
        if (!tenants.allows(resolution, tenant, chain, TenantAccess.READ)) return Set.of();
        var actions = new LinkedHashSet<PageEditingTypes.Action>();
        actions.add(PageEditingTypes.Action.READ);
        boolean active = space.status() == SpaceApi.Status.ACTIVE;
        boolean write = active && tenants.allows(resolution, tenant, chain, TenantAccess.WRITE);
        if (write && space.mode() == SpaceApi.Mode.AUTHORED) {
            actions.add(PageEditingTypes.Action.RENAME);
            actions.add(PageEditingTypes.Action.EDIT);
            actions.add(PageEditingTypes.Action.REVERT);
            actions.add(PageEditingTypes.Action.RESLUG);
            actions.add(PageEditingTypes.Action.TRANSFER);
        }
        if (write && space.mode() == SpaceApi.Mode.SYNCED) {
            actions.add(PageEditingTypes.Action.EDIT);
        }
        boolean publish = active
                && space.mode() == SpaceApi.Mode.AUTHORED
                && tenants.allows(resolution, tenant, chain, TenantAccess.PUBLISH);
        if (publish) {
            actions.add(PageEditingTypes.Action.PUBLISH);
            if (page.status() == PageApi.Status.PUBLISHED) {
                actions.add(PageEditingTypes.Action.UNPUBLISH);
            }
        }
        return io.edition.control.usecases.access.ManagementCapabilities.effective(resolution, actions, "content");
    }

    Set<PageEditingTypes.Action> listActions(Resolution resolution, UUID tenant, SpaceApi.View space) {
        if (space.status() != SpaceApi.Status.ACTIVE || space.mode() != SpaceApi.Mode.AUTHORED) {
            return Set.of();
        }
        boolean writable = tenants.allows(resolution, tenant, chain(tenant, space.id(), null), TenantAccess.WRITE);
        return writable
                        && io.edition.control.usecases.access.ManagementCapabilities.permits(
                                resolution, "content:write")
                ? Set.of(PageEditingTypes.Action.CREATE)
                : Set.of();
    }

    public PageApi.Actor pageActor(Resolution resolution) {
        return switch (resolution.principal().type()) {
            case USER -> PageApi.Actor.user(resolution.principal().id());
            case TOKEN -> PageApi.Actor.apiToken(resolution.principal().id());
            default -> throw new PermissionDeniedException();
        };
    }

    RevisionApi.Actor revisionActor(Resolution resolution) {
        return switch (resolution.principal().type()) {
            case USER ->
                new RevisionApi.Actor(
                        RevisionApi.ActorType.USER, resolution.principal().id());
            case TOKEN ->
                new RevisionApi.Actor(
                        RevisionApi.ActorType.API_TOKEN, resolution.principal().id());
            default -> throw new PermissionDeniedException();
        };
    }

    public static List<Resource> chain(UUID tenant, UUID space, UUID page) {
        return page == null
                ? List.of(TenantAccess.tenant(tenant), TenantAccess.space(space))
                : List.of(TenantAccess.tenant(tenant), TenantAccess.space(space), TenantAccess.page(page));
    }
}

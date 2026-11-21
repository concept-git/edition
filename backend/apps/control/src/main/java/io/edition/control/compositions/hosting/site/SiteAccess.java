package io.edition.control.compositions.hosting.site;

import io.edition.concepts.customdomain.api.CustomDomainApi;
import io.edition.concepts.permission.api.PermissionApi.Operation;
import io.edition.concepts.permission.api.PermissionApi.PrincipalType;
import io.edition.concepts.permission.api.PermissionApi.Resource;
import io.edition.concepts.site.api.SiteApi;
import io.edition.control.compositions.access.PermissionDeniedException;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.principal.PrincipalResolver.Resolution;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * Site flow 的访问投影：在 {@link TenantAccess} 的租户准入之上计算 allowedActions。
 * TOKEN 一律拒绝（管理面 Session only）。
 */
@Component
public class SiteAccess {
    private final TenantAccess tenants;
    private final CustomDomainApi domains;

    SiteAccess(TenantAccess tenants, CustomDomainApi domains) {
        this.tenants = tenants;
        this.domains = domains;
    }

    public Resolution requireTenantAdmin(String credential, UUID tenant) {
        return tenants.requireUser(credential, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN);
    }

    public Resolution require(String credential, UUID tenant, SiteApi.View site, Operation operation) {
        return tenants.requireUser(credential, tenant, chain(tenant, site.id()), operation);
    }

    public Resolution requireListAccess(String credential, UUID tenant) {
        return tenants.admitUser(credential, tenant);
    }

    /** 批量收窄为调用者 [tenant, site]/read 成立的站点；域名索引等跨站点投影共用。 */
    public Set<UUID> readable(Resolution resolution, UUID tenant, Set<UUID> sites) {
        Set<List<Resource>> chains =
                sites.stream().map(site -> chain(tenant, site)).collect(Collectors.toUnmodifiableSet());
        return tenants.filter(resolution, tenant, chains, TenantAccess.READ).stream()
                .map(List::getLast)
                .map(Resource::id)
                .collect(Collectors.toUnmodifiableSet());
    }

    /** 站点 admin 才能改域名；与站点级 update 同一判定，供跨站点索引逐行计算。 */
    public boolean administers(Resolution resolution, UUID tenant, UUID site) {
        return io.edition.control.compositions.access.ManagementCapabilities.permits(resolution, "hosting:write")
                && tenants.allows(resolution, tenant, chain(tenant, site), TenantAccess.ADMIN);
    }

    Set<SiteTypes.Action> allowedActions(Resolution resolution, UUID tenant, SiteApi.View site) {
        var chain = chain(tenant, site.id());
        if (!tenants.allows(resolution, tenant, chain, TenantAccess.READ)) return Set.of();
        var actions = new LinkedHashSet<SiteTypes.Action>();
        actions.add(SiteTypes.Action.READ);
        if (tenants.allows(resolution, tenant, chain, TenantAccess.ADMIN)) {
            actions.add(SiteTypes.Action.UPDATE);
            actions.add(SiteTypes.Action.MOUNT);
            actions.add(SiteTypes.Action.UNMOUNT);
            actions.add(SiteTypes.Action.REMOUNT);
            actions.add(SiteTypes.Action.REORDER);
            actions.add(SiteTypes.Action.DELETE);
            actions.add(SiteTypes.Action.MANAGE_PERMISSIONS);
        }
        return io.edition.control.compositions.access.ManagementCapabilities.effective(resolution, actions, "hosting");
    }

    Set<SiteTypes.Action> listActions(Resolution resolution, UUID tenant) {
        boolean admin = resolution.principal().type() == PrincipalType.USER
                && tenants.allows(resolution, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN);
        return admin
                        && io.edition.control.compositions.access.ManagementCapabilities.permits(
                                resolution, "hosting:write")
                ? Set.of(SiteTypes.Action.CREATE)
                : Set.of();
    }

    public SiteApi.ActorId actor(Resolution resolution) {
        if (resolution.principal().type() != PrincipalType.USER
                || resolution.principal().id() == null) {
            throw new PermissionDeniedException();
        }
        return new SiteApi.ActorId(resolution.principal().id());
    }

    static List<Resource> chain(UUID tenant, UUID site) {
        return List.of(TenantAccess.tenant(tenant), TenantAccess.site(site));
    }
}

package io.space.control.compositions.authoring.permission;

import static io.space.control.compositions.authoring.permission.PermissionTypes.*;

import io.space.concepts.permission.api.PermissionApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.InvalidCursorException;
import io.space.control.compositions.resource.ResourceChain;
import io.space.control.compositions.resource.SiteNotFoundException;
import java.util.Set;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListSitePermissionsUseCase {
    private final PermissionAccess access;
    private final PermissionProjection projection;

    private final PermissionApi permissions;
    private final TenantAccess tenants;
    private final ResourceChain resources;

    ListSitePermissionsUseCase(PermissionDependencies dependencies) {
        this.access = dependencies.access;
        this.projection = dependencies.projection;
        this.permissions = dependencies.permissions;
        this.tenants = dependencies.tenants;
        this.resources = dependencies.resources;
    }

    @Transactional(readOnly = true)
    public GrantPage listSitePermissions(String credential, UUID tenant, UUID site, String cursor, int limit) {
        var authorized = access.requireSite(
                credential, tenant, resources.site(tenant, site).orElseThrow(SiteNotFoundException::new));
        PermissionApi.GrantPage page;
        try {
            page = tenants.inTenant(
                    tenant,
                    () -> permissions.grants(
                            Set.of(TenantAccess.tenant(tenant), TenantAccess.site(site)), cursor, limit));
        } catch (IllegalArgumentException invalid) {
            throw new InvalidCursorException();
        }
        var items = page.items().stream()
                .map(grant -> projection.siteGrant(tenant, site, grant, authorized.actor()))
                .toList();
        return new GrantPage(items, page.nextCursor(), projection.workspaceActions(false, authorized.actor()));
    }
}

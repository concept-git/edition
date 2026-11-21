package io.edition.control.compositions.authoring.permission;

import static io.edition.control.compositions.authoring.permission.PermissionTypes.*;

import io.edition.concepts.permission.api.PermissionApi;
import io.edition.concepts.space.api.SpaceApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.InvalidCursorException;
import io.edition.control.compositions.resource.ResourceChain;
import io.edition.control.compositions.resource.SpaceNotFoundException;
import java.util.Set;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListSpacePermissionsUseCase {
    private final PermissionAccess access;
    private final PermissionProjection projection;

    private final PermissionApi permissions;
    private final TenantAccess tenants;
    private final ResourceChain resources;

    ListSpacePermissionsUseCase(PermissionDependencies dependencies) {
        this.access = dependencies.access;
        this.projection = dependencies.projection;
        this.permissions = dependencies.permissions;
        this.tenants = dependencies.tenants;
        this.resources = dependencies.resources;
    }

    @Transactional(readOnly = true)
    public GrantPage listSpacePermissions(String credential, UUID tenant, UUID space, String cursor, int limit) {
        var authorized = access.require(
                credential, tenant, resources.space(tenant, space).orElseThrow(SpaceNotFoundException::new));
        PermissionApi.GrantPage page;
        try {
            page = tenants.inTenant(
                    tenant,
                    () -> permissions.grants(
                            Set.of(TenantAccess.tenant(tenant), TenantAccess.space(space)), cursor, limit));
        } catch (IllegalArgumentException invalid) {
            throw new InvalidCursorException();
        }
        boolean archived = authorized.space().status() == SpaceApi.Status.ARCHIVED;
        var items = page.items().stream()
                .map(grant -> projection.grant(tenant, space, grant, archived, authorized.actor()))
                .toList();
        return new GrantPage(items, page.nextCursor(), projection.workspaceActions(archived, authorized.actor()));
    }
}

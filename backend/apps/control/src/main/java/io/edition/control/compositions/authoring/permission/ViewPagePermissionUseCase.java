package io.edition.control.compositions.authoring.permission;

import static io.edition.control.compositions.authoring.permission.PermissionTypes.*;

import io.edition.control.compositions.resource.PageNotFoundException;
import io.edition.control.compositions.resource.ResourceChain;
import io.edition.control.compositions.resource.SpaceNotFoundException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ViewPagePermissionUseCase {
    private final PermissionAccess access;
    private final PermissionProjection projection;

    private final PermissionRestrictionRules restrictions;

    private final ResourceChain resources;

    ViewPagePermissionUseCase(PermissionDependencies dependencies) {
        this.access = dependencies.access;
        this.projection = dependencies.projection;
        this.restrictions = dependencies.restrictions;
        this.resources = dependencies.resources;
    }

    @Transactional(readOnly = true)
    public PagePermissionView viewPagePermission(String credential, UUID tenant, UUID space, UUID page) {
        var authorized = access.require(
                credential, tenant, resources.space(tenant, space).orElseThrow(SpaceNotFoundException::new));
        resources.page(tenant, space, page).orElseThrow(PageNotFoundException::new);
        return projection.pagePermission(
                tenant, page, authorized.space(), restrictions.view(tenant, page), authorized.actor());
    }
}

package io.edition.control.usecases.authoring.permission;

import static io.edition.control.usecases.authoring.permission.PermissionTypes.*;

import io.edition.control.modules.permission.api.PermissionApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.resource.PageNotFoundException;
import io.edition.control.usecases.resource.ResourceChain;
import io.edition.control.usecases.resource.SpaceNotFoundException;
import java.util.List;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ExplainPageReadUseCase {
    private final PermissionAccess access;
    private final PermissionProjection projection;

    private final PermissionApi permissions;
    private final TenantAccess tenants;
    private final ResourceChain resources;

    ExplainPageReadUseCase(PermissionDependencies dependencies) {
        this.access = dependencies.access;
        this.projection = dependencies.projection;
        this.permissions = dependencies.permissions;
        this.tenants = dependencies.tenants;
        this.resources = dependencies.resources;
    }

    @Transactional(readOnly = true)
    public EffectivePermissionView explainPageRead(
            String credential, UUID tenant, UUID space, UUID page, String principalKey) {
        access.require(credential, tenant, resources.space(tenant, space).orElseThrow(SpaceNotFoundException::new));
        resources.page(tenant, space, page).orElseThrow(PageNotFoundException::new);
        PermissionApi.Subject subject = access.subject(tenant, principalKey);
        PermissionApi.Decision decision = tenants.inTenant(
                tenant,
                () -> permissions.decide(
                        List.of(TenantAccess.tenant(tenant), TenantAccess.space(space), TenantAccess.page(page)),
                        subject,
                        TenantAccess.READ));
        return projection.effective(tenant, subject, decision);
    }
}

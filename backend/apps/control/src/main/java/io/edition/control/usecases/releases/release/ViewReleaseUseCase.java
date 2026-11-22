package io.edition.control.usecases.releases.release;

import static io.edition.control.usecases.releases.release.ReleaseTypes.*;

import io.edition.control.modules.space.api.SpaceApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.principal.PrincipalResolver.Resolution;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ViewReleaseUseCase {

    private final TenantAccess tenants;

    private final ReleaseAccess access;
    private final ReleaseProjection projection;

    ViewReleaseUseCase(ReleaseDependencies dependencies) {
        this.tenants = dependencies.tenants;
        this.access = dependencies.access;
        this.projection = dependencies.projection;
    }

    @Transactional(readOnly = true)
    public ReleaseDetail viewRelease(String credential, UUID tenant, UUID space, UUID releaseId) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            SpaceApi.View owner = access.space(tenant, space);
            Resolution resolution = access.require(credential, tenant, space, TenantAccess.PUBLISH);
            return tenants.inTenant(
                    tenant,
                    () -> projection.detail(access.requireRelease(space, releaseId), resolution, tenant, owner));
        }
    }
}

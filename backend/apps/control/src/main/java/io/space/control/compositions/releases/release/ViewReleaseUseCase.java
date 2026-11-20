package io.space.control.compositions.releases.release;

import static io.space.control.compositions.releases.release.ReleaseTypes.*;

import io.space.concepts.space.api.SpaceApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.principal.PrincipalResolver.Resolution;
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
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
            SpaceApi.View owner = access.space(tenant, space);
            Resolution resolution = access.require(credential, tenant, space, TenantAccess.PUBLISH);
            return tenants.inTenant(
                    tenant,
                    () -> projection.detail(access.requireRelease(space, releaseId), resolution, tenant, owner));
        }
    }
}

package io.edition.control.usecases.releases.release;

import static io.edition.control.usecases.releases.release.ReleaseTypes.*;

import io.edition.control.modules.release.api.ReleaseApi;
import io.edition.control.usecases.access.TenantAccess;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class DiffReleasesUseCase {

    private final ReleaseApi releases;
    private final TenantAccess tenants;

    private final ReleaseAccess access;
    private final ReleaseProjection projection;

    DiffReleasesUseCase(ReleaseDependencies dependencies) {
        this.releases = dependencies.releases;
        this.tenants = dependencies.tenants;
        this.access = dependencies.access;
        this.projection = dependencies.projection;
    }

    @Transactional(readOnly = true)
    public DeltaView diffReleases(String credential, UUID tenant, UUID space, UUID from, UUID to) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            access.space(tenant, space);
            access.require(credential, tenant, space, TenantAccess.READ);
            return tenants.inTenant(tenant, () -> {
                access.requireRelease(space, from);
                access.requireRelease(space, to);
                ReleaseApi.Delta delta = releases.diff(new ReleaseApi.ReleaseId(from), new ReleaseApi.ReleaseId(to))
                        .orElseThrow(ReleaseNotFoundException::new);
                return projection.delta(delta);
            });
        }
    }
}

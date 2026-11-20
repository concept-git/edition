package io.space.control.compositions.releases.release;

import static io.space.control.compositions.releases.release.ReleaseTypes.*;

import io.space.concepts.release.api.ReleaseApi;
import io.space.control.compositions.access.TenantAccess;
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
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
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

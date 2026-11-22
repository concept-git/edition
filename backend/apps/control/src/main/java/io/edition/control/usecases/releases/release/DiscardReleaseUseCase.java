package io.edition.control.usecases.releases.release;

import static io.edition.control.usecases.releases.release.ReleaseTypes.*;

import io.edition.control.modules.release.api.ReleaseApi;
import io.edition.control.modules.space.api.SpaceApi;
import io.edition.control.usecases.AuthoringWrites;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.FlowResponse;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.principal.PrincipalResolver.Resolution;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class DiscardReleaseUseCase {

    private final ReleaseApi releases;
    private final TenantAccess tenants;
    private final AuthoringWrites authoringWrites;

    private final ReleaseAccess access;
    private final ReleaseProjection projection;

    private final IdempotentFlowExecutor idempotency;

    DiscardReleaseUseCase(ReleaseDependencies dependencies) {
        this.releases = dependencies.releases;
        this.tenants = dependencies.tenants;
        this.authoringWrites = dependencies.authoringWrites;
        this.access = dependencies.access;
        this.projection = dependencies.projection;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public FlowResponse<ReleaseDetail> discardRelease(
            String credential, UUID tenant, UUID space, UUID releaseId, String key) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            SpaceApi.View owner = access.space(tenant, space);
            Resolution resolution = access.require(credential, tenant, space, TenantAccess.PUBLISH);
            return idempotency.execute(
                    resolution.principal(),
                    key,
                    "release.discard",
                    IdempotentFlowExecutor.canonical(tenant, space, releaseId),
                    200,
                    ReleaseDetail.class,
                    () -> tenants.inTenant(tenant, () -> {
                        authoringWrites.requireActive(access.lockSpace(tenant, space));
                        ReleaseApi.View existing = access.requireRelease(space, releaseId);
                        access.requireDiscardable(existing);
                        ReleaseDetail detail = projection.detail(existing, resolution, tenant, owner);
                        releases.discard(new ReleaseApi.ReleaseId(releaseId));
                        return detail;
                    }));
        }
    }
}
